-- Helper sequence to generate sequential quote numbers
create sequence if not exists public.cotizacion_numero_seq;

select setval(
  'cotizacion_numero_seq',
  greatest(
    coalesce((
      select max(substring(numero from '\\d+$')::bigint)
      from public.cotizaciones
      where numero ~ '^COT-\\d+$'
    ), 0),
    coalesce((select last_value from public.cotizacion_numero_seq), 0)
  )
);

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
begin
  if p_lead_id is null then
    raise exception 'LEAD_ID_REQUIRED';
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

  loop
    begin
      select nextval('cotizacion_numero_seq') into v_next;

      insert into public.cotizaciones (
        lead_id,
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
