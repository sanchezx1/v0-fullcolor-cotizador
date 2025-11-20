-- Fix calcular_score_lead security context so lead inserts from anon clients bypass RLS inside triggers
create or replace function public.calcular_score_lead(lead_id_param bigint)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_score integer := 50;
  v_num_cotizaciones integer;
  v_tiene_ruc_valido boolean;
  v_presupuesto numeric;
  v_dias_sin_contacto integer;
  v_origen varchar;
begin
  if lead_id_param is null then
    return v_score;
  end if;

  select
    (ruc_cedula is not null and ruc_cedula <> '' and right(replace(replace(ruc_cedula, '-', ''), ' ', ''), 3) = '001'),
    presupuesto_estimado,
    origen,
    coalesce(extract(day from now() - ultimo_contacto)::integer,
             extract(day from now() - created_at)::integer)
  into v_tiene_ruc_valido, v_presupuesto, v_origen, v_dias_sin_contacto
  from public.leads
  where id = lead_id_param;

  select count(*) into v_num_cotizaciones
  from public.cotizaciones
  where lead_id = lead_id_param;

  v_score := v_score + least(v_num_cotizaciones * 10, 30);

  if v_tiene_ruc_valido then
    v_score := v_score + 25;
  end if;

  if v_presupuesto is not null then
    if v_presupuesto >= 10000 then
      v_score := v_score + 20;
    elsif v_presupuesto >= 5000 then
      v_score := v_score + 15;
    elsif v_presupuesto >= 1000 then
      v_score := v_score + 10;
    else
      v_score := v_score + 5;
    end if;
  end if;

  if v_origen = 'referido' then
    v_score := v_score + 10;
  elsif v_origen = 'evento' then
    v_score := v_score + 8;
  elsif v_origen = 'redes_sociales' then
    v_score := v_score + 5;
  end if;

  v_score := v_score - least(coalesce(v_dias_sin_contacto, 0), 30);
  v_score := greatest(0, least(100, v_score));

  return v_score;
end;
$$;

grant execute on function public.calcular_score_lead(bigint) to anon, authenticated, service_role;
