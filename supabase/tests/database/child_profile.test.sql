-- Famille (v2.18, F5) : seul le parent qui a validé le compte d'un enfant de moins de 15 ans
-- modifie son prénom et sa classe.
begin;

create extension if not exists pgtap with schema extensions;

select plan(7);

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

-- Léa (moins de 15 ans, compte validé par Claire), Hugo (15 ans et plus, relié à Claire),
-- Claire (parent qui a validé), Marc (autre parent relié à Léa, sans validation), Zoé (inconnue).
select pg_temp.new_user('16000000-0000-4000-8000-000000000001', 'lea@test.fr',
  '{"role": "student", "first_name": "Léa", "under_15": true}');
select pg_temp.new_user('16000000-0000-4000-8000-000000000002', 'hugo@test.fr',
  '{"role": "student", "first_name": "Hugo", "under_15": false}');
select pg_temp.new_user('26000000-0000-4000-8000-000000000001', 'claire@test.fr',
  '{"role": "parent", "first_name": "Claire", "terms_accepted": true}');
select pg_temp.new_user('26000000-0000-4000-8000-000000000002', 'marc@test.fr',
  '{"role": "parent", "first_name": "Marc", "terms_accepted": true}');
select pg_temp.new_user('26000000-0000-4000-8000-000000000003', 'zoe@test.fr',
  '{"role": "parent", "first_name": "Zoé", "terms_accepted": true}');

insert into public.parent_links (parent_id, student_id, origin) values
  ('26000000-0000-4000-8000-000000000001', '16000000-0000-4000-8000-000000000001', 'link_code'),
  ('26000000-0000-4000-8000-000000000001', '16000000-0000-4000-8000-000000000002', 'link_code'),
  ('26000000-0000-4000-8000-000000000002', '16000000-0000-4000-8000-000000000001', 'link_code');
insert into public.parental_consents (student_id, parent_id, method) values
  ('16000000-0000-4000-8000-000000000001', '26000000-0000-4000-8000-000000000001', 'link_code'),
  ('16000000-0000-4000-8000-000000000002', '26000000-0000-4000-8000-000000000001', 'link_code');

-- Claire a validé le compte de Léa (moins de 15 ans) : elle modifie son prénom et sa classe.
select pg_temp.login('26000000-0000-4000-8000-000000000001');
select lives_ok(
  $$select public.update_child_profile('16000000-0000-4000-8000-000000000001', '  Léana ', '5e')$$,
  'le parent qui a validé le compte modifie le profil');
reset role;
select is(
  (select first_name from public.profiles where id = '16000000-0000-4000-8000-000000000001'),
  'Léana',
  'le prénom est enregistré, sans espaces autour');
select is(
  (select grade::text from public.students where id = '16000000-0000-4000-8000-000000000001'),
  '5e',
  'la classe est enregistrée');

-- Un prénom vide est refusé.
select pg_temp.login('26000000-0000-4000-8000-000000000001');
select throws_ok(
  $$select public.update_child_profile('16000000-0000-4000-8000-000000000001', '   ', '4e')$$,
  '22023', 'invalid_first_name', 'un prénom vide est refusé');

-- Hugo a 15 ans ou plus : même avec l'accord, son profil reste à lui.
select throws_ok(
  $$select public.update_child_profile('16000000-0000-4000-8000-000000000002', 'Hugues', '4e')$$,
  '42501', 'not_allowed', 'le profil d''un élève de 15 ans ou plus n''est pas modifiable');
reset role;

-- Marc est relié à Léa sans avoir validé son compte.
select pg_temp.login('26000000-0000-4000-8000-000000000002');
select throws_ok(
  $$select public.update_child_profile('16000000-0000-4000-8000-000000000001', 'Lili', '4e')$$,
  '42501', 'not_allowed', 'un parent relié sans validation ne modifie pas le profil');
reset role;

-- Zoé n'est pas reliée à Léa.
select pg_temp.login('26000000-0000-4000-8000-000000000003');
select throws_ok(
  $$select public.update_child_profile('16000000-0000-4000-8000-000000000001', 'Lili', '4e')$$,
  '42501', 'not_allowed', 'un parent non relié ne modifie pas le profil');
reset role;

select * from finish();
rollback;
