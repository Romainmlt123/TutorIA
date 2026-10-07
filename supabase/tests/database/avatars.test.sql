-- Avatar de l'élève : sa ligne seulement, invisible pour les parents, valeurs bornées.
begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

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

select pg_temp.new_user('12000000-0000-4000-8000-000000000001', 'lea@test.fr',
  '{"role": "student", "first_name": "Léa", "under_15": false}');
select pg_temp.new_user('12000000-0000-4000-8000-000000000002', 'tom@test.fr',
  '{"role": "student", "first_name": "Tom", "under_15": false}');
select pg_temp.new_user('22000000-0000-4000-8000-000000000001', 'claire@test.fr',
  '{"role": "parent", "first_name": "Claire", "terms_accepted": true}');

insert into public.parent_links (parent_id, student_id, origin)
values ('22000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000001', 'link_code');

-- ---------------------------------------------------------------------------
-- L'élève : sa propre ligne
-- ---------------------------------------------------------------------------
select pg_temp.login('12000000-0000-4000-8000-000000000001');

select lives_ok(
  $$ insert into public.avatars (owned, announced) values ('{bandana}', '{}')
     on conflict (student_id) do update set owned = excluded.owned $$,
  'a student saves her wardrobe before creating her avatar'
);

select lives_ok(
  $$ insert into public.avatars (look) values ('{"skin": 2, "hair": "court"}')
     on conflict (student_id) do update set look = excluded.look $$,
  'then saves her look on the same row'
);

select results_eq(
  $$ select student_id::text, look ->> 'hair', owned from public.avatars $$,
  $$ values ('12000000-0000-4000-8000-000000000001', 'court', '{bandana}'::text[]) $$,
  'she reads her own avatar, look and wardrobe together'
);

select throws_ok(
  $$ insert into public.avatars (student_id, look) values ('12000000-0000-4000-8000-000000000002', '{}') $$,
  '42501',
  null,
  'a student cannot write the avatar of another student'
);

select throws_ok(
  $$ update public.avatars set updated_at = now() - interval '1 day' $$,
  '42501',
  null,
  'a student cannot set the update time'
);

select throws_ok(
  $$ update public.avatars set owned = '{"Couronne d''or"}' $$,
  '23514',
  null,
  'item ids are short slugs only'
);

select throws_ok(
  $$ update public.avatars set look = '[1, 2]' $$,
  '23514',
  null,
  'a look is an object'
);

select throws_ok(
  $$ update public.avatars set look = jsonb_build_object('pad', repeat('x', 5000)) $$,
  '23514',
  null,
  'a look stays small'
);

select throws_ok(
  $$ delete from public.avatars $$,
  '42501',
  null,
  'a student does not delete her avatar (it goes with the account)'
);

reset role;
select pg_temp.login('12000000-0000-4000-8000-000000000002');

select is_empty(
  $$ select 1 from public.avatars $$,
  'another student reads nothing'
);

reset role;
select pg_temp.login('22000000-0000-4000-8000-000000000001');

select is_empty(
  $$ select 1 from public.avatars $$,
  'a linked parent does not see the avatar'
);

reset role;

-- ---------------------------------------------------------------------------
-- Suppression du compte : l'avatar part avec lui
-- ---------------------------------------------------------------------------
delete from auth.users where id = '12000000-0000-4000-8000-000000000001';

select is_empty(
  $$ select 1 from public.avatars where student_id = '12000000-0000-4000-8000-000000000001' $$,
  'deleting the account deletes the avatar'
);

select * from finish();

rollback;
