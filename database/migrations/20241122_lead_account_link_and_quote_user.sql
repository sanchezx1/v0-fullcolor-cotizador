-- Fase 2: lógica de leads/cuentas/cotizaciones
-- - Unificar lead activo por email (reutilizar invitado, actualizar a cuenta)
-- - Asociar cotizaciones al usuario cuando aplique
-- - Utilidades de detección de email y vinculación a cuenta

-- 1) RPC público para crear/reutilizar lead y opcionalmente vincularlo al usuario autenticado
create or replace function public.create_public_lead(
  p_nombre text,
  p_email text,
  p_telefono text default null,
  p_empresa text default null,
  p_notas text default null,
  p_ruc_cedula text default null,
  p_ciudad text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lead public.leads%rowtype;
  v_actor uuid := auth.uid();
  v_actor_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_target_user uuid := null;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'EMAIL_REQUIRED';
  end if;

  -- Si el usuario está autenticado y su email coincide, usaremos su user_id
  if v_actor is not null and v_actor_email = lower(p_email) then
    v_target_user := v_actor;
  end if;

  -- Buscar lead existente, priorizando invitado sin user_id
  select *
    into v_lead
    from public.leads
   where lower(email) = lower(p_email)
   order by (user_id is null) desc, created_at desc
   limit 1;

  if found then
    -- Actualizar lead existente (incluye upgrade a user_id si aplica)
    update public.leads
       set nombre   = coalesce(nullif(p_nombre, ''), nombre),
           telefono = coalesce(nullif(p_telefono, ''), telefono),
           empresa  = coalesce(nullif(p_empresa, ''), empresa),
           notas    = coalesce(p_notas, notas),
           ruc_cedula = coalesce(nullif(p_ruc_cedula, ''), ruc_cedula),
           ciudad   = coalesce(nullif(p_ciudad, ''), ciudad),
           user_id  = coalesce(v_lead.user_id, v_target_user),
           updated_at = now(),
           updated_by = v_actor
     where id = v_lead.id
     returning * into v_lead;

    return jsonb_build_object(
      'success', true,
      'lead', jsonb_build_object(
        'id', v_lead.id,
        'email', v_lead.email,
        'user_id', v_lead.user_id
      ),
      'reused', true,
      'upgraded_to_user', (v_lead.user_id is not null)
    );
  end if;

  -- Crear lead nuevo (como invitado o ya vinculado si coincide email + auth)
  insert into public.leads (
    nombre,
    email,
    telefono,
    empresa,
    notas,
    ruc_cedula,
    ciudad,
    user_id
  )
  values (
    p_nombre,
    lower(p_email),
    nullif(p_telefono, ''),
    nullif(p_empresa, ''),
    p_notas,
    nullif(p_ruc_cedula, ''),
    nullif(p_ciudad, ''),
    v_target_user
  )
  returning * into v_lead;

  return jsonb_build_object(
    'success', true,
    'lead', jsonb_build_object(
      'id', v_lead.id,
      'email', v_lead.email,
      'user_id', v_lead.user_id
    ),
    'reused', false,
    'upgraded_to_user', (v_lead.user_id is not null)
  );
end;
$$;

grant execute on function public.create_public_lead(text, text, text, text, text, text, text) to anon, authenticated;

-- 2) RPC para vincular lead invitado a la cuenta autenticada usando email
create or replace function public.link_lead_to_auth_user(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_lead public.leads%rowtype;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'EMAIL_REQUIRED';
  end if;

  if v_actor_email <> lower(p_email) then
    raise exception 'EMAIL_MISMATCH';
  end if;

  select *
    into v_lead
    from public.leads
   where lower(email) = lower(p_email)
   order by (user_id is null) desc, created_at desc
   limit 1;

  if not found then
    return jsonb_build_object('linked', false, 'reason', 'NOT_FOUND');
  end if;

  -- Solo actualiza si no tiene user_id o ya coincide
  if v_lead.user_id is null or v_lead.user_id = v_actor then
    update public.leads
       set user_id = v_actor,
           updated_at = now(),
           updated_by = v_actor
     where id = v_lead.id
     returning * into v_lead;
  end if;

  return jsonb_build_object(
    'linked', true,
    'lead_id', v_lead.id,
    'user_id', v_lead.user_id
  );
end;
$$;

grant execute on function public.link_lead_to_auth_user(text) to authenticated;

-- 3) RPC para detección sin datos sensibles
create or replace function public.check_lead_email_exists(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_exists boolean;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    return false;
  end if;

  select exists(
    select 1 from public.leads where lower(email) = lower(p_email)
  ) into v_exists;

  return v_exists;
end;
$$;

grant execute on function public.check_lead_email_exists(text) to anon, authenticated;

-- 4) RPC de cotización: asignar user_id si el lead o el actor lo tienen
create or replace function public.create_public_quote(
  p_lead_id bigint,
  p_items jsonb,
  p_canal text default 'web',
  p_notas text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_items_count integer;
  v_total numeric := 0;
  v_subtotal numeric := 0;
  v_iva numeric := 0;
  v_next bigint;
  v_cotizacion public.cotizaciones%rowtype;
  v_lead public.leads%rowtype;
  v_user uuid := auth.uid();
begin
  if p_lead_id is null then
    raise exception 'LEAD_ID_REQUIRED';
  end if;

  select * into v_lead from public.leads where id = p_lead_id;

  if not found then
    raise exception 'LEAD_NOT_FOUND';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'ITEMS_REQUIRED';
  end if;

  select jsonb_array_length(p_items) into v_items_count;

  select coalesce(sum((item->>'subtotal')::numeric), 0)
  into v_total
  from jsonb_array_elements(p_items) as item;

  v_subtotal := v_total;
  v_iva := round(v_subtotal * 0.15, 2);

  v_user := coalesce(v_lead.user_id, v_user);

  loop
    begin
      select nextval('cotizacion_numero_seq') into v_next;

      insert into public.cotizaciones (
        lead_id,
        user_id,
        numero,
        estado,
        total,
        subtotal,
        iva,
        validez_dias,
        canal,
        notas
      )
      values (
        p_lead_id,
        v_user,
        'COT-' || lpad(v_next::text, 5, '0'),
        'pendiente',
        v_total,
        v_subtotal,
        v_iva,
        30,
        coalesce(p_canal, 'web'),
        p_notas
      )
      returning * into v_cotizacion;

      exit;
    exception when unique_violation then
      continue;
    end;
  end loop;

  insert into public.items_cotizacion (
    cotizacion_id,
    producto_id,
    cantidad,
    precio_unitario_aplicado,
    subtotal
  )
  select
    v_cotizacion.id,
    item.producto_id,
    item.cantidad,
    item.precio_unitario,
    item.subtotal
  from jsonb_to_recordset(p_items) as item(
    producto_id bigint,
    cantidad integer,
    precio_unitario numeric,
    subtotal numeric
  );

  insert into public.eventos (cotizacion_id, tipo, metadata)
  values (
    v_cotizacion.id,
    'cotizacion_creada',
    jsonb_build_object(
      'total_items', v_items_count,
      'canal', coalesce(p_canal, 'web')
    )
  );

  return jsonb_build_object(
    'cotizacion', to_jsonb(v_cotizacion),
    'items', coalesce((
      select jsonb_agg(to_jsonb(i))
      from public.items_cotizacion i
      where i.cotizacion_id = v_cotizacion.id
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.create_public_quote(bigint, jsonb, text, text) to anon, authenticated;
