-- Liens parent-élève : seul le parent peut retirer le lien (v2.8).
begin;

create extension if not exists pgtap with schema extensions;

select plan(3);

create function pg_temp.login(p_id uuid)
returns void
language sql
as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', p_id, 'role', 'authenticated')::text, true);
$$;

create function pg_temp.new_user(p_id uuid, p_email text, p_meta jsonb)
returns void
language sql
as $$
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
  values (p_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', p_email, p_meta, now(), now());
$$;

select pg_temp.new_user('15000000-0000-4000-8000-000000000001', 'lea@test.fr',
  '{"role": "student", "first_name": "Léa", "under_15": false}');
select pg_temp.new_user('25000000-0000-4000-8000-000000000001', 'claire@test.fr',
  '{"role": "parent", "first_name": "Claire", "terms_accepted": true}');

insert into public.parent_links (parent_id, student_id, origin)
values ('25000000-0000-4000-8000-000000000001', '15000000-0000-4000-8000-000000000001', 'link_code');

-- L'élève voit son lien, mais ne peut pas le supprimer.
select pg_temp.login('15000000-0000-4000-8000-000000000001');
delete from public.parent_links where student_id = '15000000-0000-4000-8000-000000000001';
select is((select count(*)::int from public.parent_links), 1, 'l''élève voit toujours son lien');
reset role;
select is(
  (select count(*)::int from public.parent_links
   where student_id = '15000000-0000-4000-8000-000000000001'),
  1,
  'l''élève ne peut pas retirer un parent');

-- Le parent, lui, peut retirer le lien.
select pg_temp.login('25000000-0000-4000-8000-000000000001');
delete from public.parent_links where parent_id = '25000000-0000-4000-8000-000000000001';
reset role;
select is(
  (select count(*)::int from public.parent_links
   where student_id = '15000000-0000-4000-8000-000000000001'),
  0,
  'le parent peut retirer le lien');

select * from finish();
rollback;
