-- Comptes, liens parent-enfant, codes de liaison et règles d'accès (RLS).
-- Lancer : npm run db:test (Supabase local).
begin;

create extension if not exists pgtap with schema extensions;

select plan(45);

-- ---------------------------------------------------------------------------
-- Données : deux élèves, deux parents. Claire est reliée à Léa.
-- ---------------------------------------------------------------------------
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

select pg_temp.new_user('10000000-0000-4000-8000-000000000001', 'lea@test.fr',
  '{"role": "student", "first_name": "Léa", "under_15": true}');
select pg_temp.new_user('10000000-0000-4000-8000-000000000002', 'tom@test.fr',
  '{"role": "student", "first_name": "Tom", "under_15": false}');
select pg_temp.new_user('10000000-0000-4000-8000-000000000003', 'leo@test.fr',
  '{"role": "student", "first_name": "leo", "under_15": true}');
select pg_temp.new_user('20000000-0000-4000-8000-000000000001', 'claire@test.fr',
  '{"role": "parent", "first_name": "Claire", "terms_accepted": true, "weekly_report": true}');
select pg_temp.new_user('20000000-0000-4000-8000-000000000002', 'marc@test.fr',
  '{"role": "parent", "first_name": "Marc", "terms_accepted": true}');
select pg_temp.new_user('20000000-0000-4000-8000-000000000003', 'invite@test.fr',
  '{"role": "parent"}');

insert into public.parent_links (parent_id, student_id, origin)
values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'link_code');

-- ---------------------------------------------------------------------------
-- Inscription : le déclencheur crée le profil, l'élève et ses réglages.
-- ---------------------------------------------------------------------------
select results_eq(
  $$ select role::text, first_name from public.profiles where id = '10000000-0000-4000-8000-000000000001' $$,
  $$ values ('student', 'Léa') $$,
  'signup creates the student profile'
);

select results_eq(
  $$ select under_15, consent_status::text from public.students where id = '10000000-0000-4000-8000-000000000001' $$,
  $$ values (true, 'pending') $$,
  'a student under 15 waits for parental consent'
);

select results_eq(
  $$ select consent_status::text from public.students where id = '10000000-0000-4000-8000-000000000002' $$,
  $$ values ('not_required') $$,
  'a student aged 15 or more needs no consent'
);

select ok(
  exists (select 1 from public.parental_settings where student_id = '10000000-0000-4000-8000-000000000001'),
  'signup creates the parental settings of the student'
);

select results_eq(
  $$ select weekly_report, terms_accepted_at is not null from public.parents where id = '20000000-0000-4000-8000-000000000001' $$,
  $$ values (true, true) $$,
  'signup creates the parent with its preferences'
);

select results_eq(
  $$ select p.first_name is null, pa.terms_accepted_at is null
     from public.profiles p join public.parents pa on pa.id = p.id
     where p.id = '20000000-0000-4000-8000-000000000003' $$,
  $$ values (true, true) $$,
  'an invited parent has an account to finalize'
);

select throws_ok(
  $$ select pg_temp.new_user('30000000-0000-4000-8000-000000000001', 'x@test.fr', '{}') $$,
  '22023',
  null,
  'signup without a role is refused'
);

select throws_ok(
  $$ select pg_temp.new_user('30000000-0000-4000-8000-000000000002', 'y@test.fr', '{"role": "student", "first_name": "Zoé"}') $$,
  '22023',
  null,
  'student signup without the age switch is refused'
);

select throws_ok(
  $$ select pg_temp.new_user('30000000-0000-4000-8000-000000000003', 'z@test.fr', '{"role": "admin"}') $$,
  '22P02',
  null,
  'signup with an unknown role is refused'
);

select throws_ok(
  $$ update public.profiles set role = 'parent' where id = '10000000-0000-4000-8000-000000000001' $$,
  '42501',
  null,
  'the role never changes, even for the server'
);

-- ---------------------------------------------------------------------------
-- Élève (Léa)
-- ---------------------------------------------------------------------------
select pg_temp.login('10000000-0000-4000-8000-000000000001');

select results_eq(
  $$ select id::text from public.profiles order by id $$,
  $$ values ('10000000-0000-4000-8000-000000000001'), ('20000000-0000-4000-8000-000000000001') $$,
  'a student sees her profile and her linked parent, nobody else'
);

select results_eq(
  $$ select count(*)::int from public.students $$,
  $$ values (1) $$,
  'a student does not see other students'
);

select lives_ok(
  $$ update public.students set grade = '4e', daily_minutes = 20 where id = '10000000-0000-4000-8000-000000000001' $$,
  'a student saves her onboarding answers'
);

select throws_ok(
  $$ update public.students set consent_status = 'granted' where id = '10000000-0000-4000-8000-000000000001' $$,
  '42501',
  null,
  'a student cannot validate her own consent'
);

select throws_ok(
  $$ update public.profiles set role = 'parent' where id = '10000000-0000-4000-8000-000000000001' $$,
  '42501',
  null,
  'a student cannot change her role'
);

select throws_ok(
  $$ select * from public.link_codes $$,
  '42501',
  null,
  'link codes are never readable from the app'
);

select lives_ok(
  $$ update public.parental_settings set voice_enabled = false where student_id = '10000000-0000-4000-8000-000000000001' $$,
  'a student update of the parental settings runs'
);

select lives_ok(
  $$ insert into public.self_assessments (student_id, subject_id, level)
     values ('10000000-0000-4000-8000-000000000001', 'physique-chimie', 'struggling') $$,
  'a student saves her self-assessment'
);

select throws_ok(
  $$ insert into public.self_assessments (student_id, subject_id, level)
     values ('10000000-0000-4000-8000-000000000002', 'maths', 'ok') $$,
  '42501',
  null,
  'a student cannot write the self-assessment of another student'
);

select throws_ok(
  $$ select public.redeem_link_code('10000000-0000-4000-8000-000000000001', repeat('a', 64)) $$,
  '42501',
  null,
  'the app cannot redeem a code without the server'
);

select throws_ok(
  $$ select public.consume_rate_limit('x', 1, 60) $$,
  '42501',
  null,
  'the app cannot touch the rate limiter'
);

reset role;

select results_eq(
  $$ select voice_enabled from public.parental_settings where student_id = '10000000-0000-4000-8000-000000000001' $$,
  $$ values (true) $$,
  'a student cannot change the parental settings'
);

-- ---------------------------------------------------------------------------
-- Parent relié (Claire)
-- ---------------------------------------------------------------------------
select pg_temp.login('20000000-0000-4000-8000-000000000001');

select results_eq(
  $$ select id::text from public.students $$,
  $$ values ('10000000-0000-4000-8000-000000000001') $$,
  'a parent sees her linked child only'
);

select results_eq(
  $$ select count(*)::int from public.self_assessments $$,
  $$ values (0) $$,
  'a parent never sees the self-assessment of her child'
);

select lives_ok(
  $$ update public.parental_settings set voice_enabled = false where student_id = '10000000-0000-4000-8000-000000000001' $$,
  'a linked parent changes the settings of her child'
);

update public.parental_settings set voice_enabled = false where student_id = '10000000-0000-4000-8000-000000000002';

reset role;

select results_eq(
  $$ select student_id::text, voice_enabled, updated_by::text from public.parental_settings
     where student_id in ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002')
     order by student_id $$,
  $$ values ('10000000-0000-4000-8000-000000000001', false, '20000000-0000-4000-8000-000000000001'),
            ('10000000-0000-4000-8000-000000000002', true, null) $$,
  'settings change for the linked child only, with their author'
);

-- ---------------------------------------------------------------------------
-- Parent non relié (Marc) et visiteur anonyme
-- ---------------------------------------------------------------------------
select pg_temp.login('20000000-0000-4000-8000-000000000002');

select results_eq(
  $$ select count(*)::int from public.students $$,
  $$ values (0) $$,
  'an unlinked parent sees no student'
);

select results_eq(
  $$ select count(*)::int from public.parental_settings $$,
  $$ values (0) $$,
  'an unlinked parent sees no settings'
);

reset role;
set local role anon;

select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  null,
  'an anonymous visitor reads nothing'
);

reset role;

-- ---------------------------------------------------------------------------
-- Codes de liaison (serveur, clé secrète)
-- ---------------------------------------------------------------------------
set local role service_role;

select results_eq(
  $$ select status from public.create_link_code('20000000-0000-4000-8000-000000000002', 'Léo', '5e', repeat('1', 64)) $$,
  $$ values ('created') $$,
  'a parent creates a link code'
);

select results_eq(
  $$ select status from public.create_link_code('20000000-0000-4000-8000-000000000002', 'Léo', '5e', repeat('1', 64)) $$,
  $$ values ('collision') $$,
  'an active code cannot exist twice'
);

select results_eq(
  $$ select status from public.redeem_link_code('10000000-0000-4000-8000-000000000002', repeat('1', 64)) $$,
  $$ values ('name_mismatch') $$,
  'a code made for another first name is refused'
);

select results_eq(
  $$ select status, parent_id::text from public.redeem_link_code('10000000-0000-4000-8000-000000000003', repeat('1', 64)) $$,
  $$ values ('linked', '20000000-0000-4000-8000-000000000002') $$,
  'the right child redeems the code, whatever the accents and the case'
);

select results_eq(
  $$ select s.consent_status::text, s.grade::text, c.method::text
     from public.students s join public.parental_consents c on c.student_id = s.id
     where s.id = '10000000-0000-4000-8000-000000000003' $$,
  $$ values ('granted', '5e', 'link_code') $$,
  'redeeming validates the consent, keeps its proof and fills the grade'
);

select results_eq(
  $$ select status from public.redeem_link_code('10000000-0000-4000-8000-000000000003', repeat('1', 64)) $$,
  $$ values ('invalid') $$,
  'a code works only once'
);

reset role;

insert into public.link_codes (parent_id, child_first_name, child_grade, code_hmac, created_at, expires_at)
values ('20000000-0000-4000-8000-000000000002', 'Tom', '3e', repeat('2', 64), now() - interval '2 days', now() - interval '1 day');

set local role service_role;

select results_eq(
  $$ select status from public.redeem_link_code('10000000-0000-4000-8000-000000000002', repeat('2', 64)) $$,
  $$ values ('invalid') $$,
  'an expired code is refused'
);

select throws_ok(
  $$ insert into public.link_codes (parent_id, child_first_name, child_grade, code_hmac, created_at, expires_at)
     values ('20000000-0000-4000-8000-000000000002', 'Tom', '3e', repeat('3', 64), now(), now() + interval '2 days') $$,
  '23514',
  null,
  'a code cannot last more than 24 hours'
);

-- ---------------------------------------------------------------------------
-- Demandes de liaison et limite de débit
-- ---------------------------------------------------------------------------
insert into public.link_requests (student_id, parent_id)
values ('10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003');

reset role;
select pg_temp.login('20000000-0000-4000-8000-000000000003');

select results_eq(
  $$ select first_name from public.profiles where role = 'student' $$,
  $$ values ('Tom') $$,
  'a parent sees the first name of a student who asks to link, and no other student'
);

reset role;
set local role service_role;

select results_eq(
  $$ select public.accept_link_request('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002') $$,
  $$ values ('account_not_ready') $$,
  'an invited parent must finalize the account before linking'
);

select lives_ok(
  $$ select public.finalize_parent_account('20000000-0000-4000-8000-000000000003', ' Sophie ') $$,
  'an invited parent finalizes the account'
);

select results_eq(
  $$ select public.accept_link_request('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002') $$,
  $$ values ('linked') $$,
  'the parent accepts the request'
);

select results_eq(
  $$ select array[public.consume_rate_limit('test', 2, 3600), public.consume_rate_limit('test', 2, 3600), public.consume_rate_limit('test', 2, 3600)] $$,
  $$ values (array[true, true, false]) $$,
  'the rate limiter refuses the call over the limit'
);

reset role;

-- ---------------------------------------------------------------------------
-- Suppression de compte (RGPD)
-- ---------------------------------------------------------------------------
delete from auth.users where id = '10000000-0000-4000-8000-000000000001';

select results_eq(
  $$ select (select count(*) from public.profiles where id = '10000000-0000-4000-8000-000000000001')
          + (select count(*) from public.students where id = '10000000-0000-4000-8000-000000000001')
          + (select count(*) from public.parental_settings where student_id = '10000000-0000-4000-8000-000000000001')
          + (select count(*) from public.self_assessments where student_id = '10000000-0000-4000-8000-000000000001')
          + (select count(*) from public.parent_links where student_id = '10000000-0000-4000-8000-000000000001') $$,
  $$ values (0::bigint) $$,
  'deleting a student account erases all of its data'
);

delete from auth.users where id = '20000000-0000-4000-8000-000000000002';

select results_eq(
  $$ select parent_id is null from public.parental_consents where student_id = '10000000-0000-4000-8000-000000000003' $$,
  $$ values (true) $$,
  'the consent proof survives the deletion of the parent account'
);

select results_eq(
  $$ select count(*)::int from public.link_codes where parent_id = '20000000-0000-4000-8000-000000000002' $$,
  $$ values (0) $$,
  'deleting a parent account erases its link codes'
);

select * from finish();

rollback;
