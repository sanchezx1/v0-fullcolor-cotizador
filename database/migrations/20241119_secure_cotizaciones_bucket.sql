-- Ensure cotizaciones bucket is private and only accessible via admins/service role

-- 1) Force bucket to be private (id/name are equal for storage buckets)
update storage.buckets
set public = false
where name = 'cotizaciones';

-- 2) Drop legacy policies (if any) to avoid duplicates
drop policy if exists "Public read cotizaciones bucket" on storage.objects;
drop policy if exists "Admins read cotizaciones bucket" on storage.objects;
drop policy if exists "Admins upload to cotizaciones bucket" on storage.objects;
drop policy if exists "Admins update cotizaciones bucket" on storage.objects;
drop policy if exists "Admins delete from cotizaciones bucket" on storage.objects;
drop policy if exists "Service role manage cotizaciones bucket" on storage.objects;

-- 3) Create policies scoped to admins/service role
create policy "Service role manage cotizaciones bucket"
on storage.objects for all
to service_role
using (bucket_id = 'cotizaciones')
with check (bucket_id = 'cotizaciones');

create policy "Admins read cotizaciones bucket"
on storage.objects for select
to authenticated
using (
  bucket_id = 'cotizaciones'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins upload cotizaciones bucket"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'cotizaciones'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins update cotizaciones bucket"
on storage.objects for update
to authenticated
using (
  bucket_id = 'cotizaciones'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  bucket_id = 'cotizaciones'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins delete cotizaciones bucket"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'cotizaciones'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
