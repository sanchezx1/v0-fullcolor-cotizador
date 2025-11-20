-- RPC to create leads from the public cotizador without exposing SELECT permissions
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
  v_existing public.leads%rowtype;
  v_new public.leads%rowtype;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'EMAIL_REQUIRED';
  end if;

  select *
  into v_existing
  from public.leads
  where lower(email) = lower(p_email)
  limit 1;

  if found then
    return jsonb_build_object(
      'success', false,
      'code', 'LEAD_EMAIL_EXISTS',
      'existing_lead', to_jsonb(v_existing),
      'new_data', jsonb_build_object(
        'nombre', p_nombre,
        'email', p_email,
        'telefono', p_telefono,
        'empresa', p_empresa,
        'notas', p_notas,
        'ruc_cedula', p_ruc_cedula,
        'ciudad', p_ciudad
      )
    );
  end if;

  insert into public.leads (
    nombre,
    email,
    telefono,
    empresa,
    notas,
    ruc_cedula,
    ciudad
  )
  values (
    p_nombre,
    p_email,
    nullif(p_telefono, ''),
    nullif(p_empresa, ''),
    p_notas,
    nullif(p_ruc_cedula, ''),
    nullif(p_ciudad, '')
  )
  returning * into v_new;

  return jsonb_build_object(
    'success', true,
    'lead', to_jsonb(v_new)
  );
end;
$$;

grant execute on function public.create_public_lead(text, text, text, text, text, text, text) to anon, authenticated;
