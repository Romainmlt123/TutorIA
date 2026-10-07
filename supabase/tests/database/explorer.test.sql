-- Niveaux d'Explorer : partie d'une séance, meilleur résultat, XP accordée une fois, droits d'accès.
begin;

create extension if not exists pgtap with schema extensions;

select plan(21);

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

-- Séance écrite d'un niveau et sa partie, comme le serveur les crée.
create function pg_temp.play(p_student uuid, p_level text)
returns uuid
language plpgsql
as $$
declare
  v_session uuid;
begin
  insert into public.study_sessions (student_id, mode, subject_id, chapter_id, level_id)
  values (p_student, 'written', 'maths', 'maths-equations', p_level)
  returning id into v_session;
  insert into public.level_attempts (session_id, student_id, level_id) values (v_session, p_student, p_level);
  return v_session;
end;
$$;

-- Termine la partie d'une séance (lea, Équations) ; rend l'XP accordée.
create function pg_temp.finish(p_session uuid, p_level text, p_type public.level_type, p_score numeric, p_stars smallint, p_passed boolean)
returns integer
language sql
as $$
  select public.finish_level(p_session, '11000000-0000-4000-8000-000000000001', p_level,
    'maths-equations', 'maths', p_type, p_score, p_stars, p_passed);
$$;

select pg_temp.new_user('11000000-0000-4000-8000-000000000001', 'lea@test.fr',
  '{"role": "student", "first_name": "Léa", "under_15": false}');
select pg_temp.new_user('21000000-0000-4000-8000-000000000001', 'claire@test.fr',
  '{"role": "parent", "first_name": "Claire", "terms_accepted": true}');
select pg_temp.new_user('21000000-0000-4000-8000-000000000002', 'marc@test.fr',
  '{"role": "parent", "first_name": "Marc", "terms_accepted": true}');

insert into public.parent_links (parent_id, student_id, origin)
values ('21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'link_code');

create temp table played (name text primary key, session_id uuid) on commit drop;
grant select on played to authenticated;
grant select, insert on played to service_role;

-- ---------------------------------------------------------------------------
-- Serveur : fin d'une leçon, XP de la séance, idempotence
-- ---------------------------------------------------------------------------
set local role service_role;

insert into played values ('lecon', pg_temp.play('11000000-0000-4000-8000-000000000001', 'maths-equations.isoler-x'));

select is(
  pg_temp.finish((select session_id from played where name = 'lecon'), 'maths-equations.isoler-x', 'lecon', 1, 3::smallint, true),
  40,
  'a first lesson finished with three stars earns 10 + 30 XP'
);

select results_eq(
  $$ select xp from public.study_sessions where id = (select session_id from played where name = 'lecon') $$,
  $$ values (55) $$,
  'the level XP is added to the 15 XP of the written session'
);

select results_eq(
  $$ select xp from public.student_progress where student_id = '11000000-0000-4000-8000-000000000001' $$,
  $$ values (55) $$,
  'the session triggers carry the level XP to the student progress'
);

select results_eq(
  $$ select xp from public.daily_activity where student_id = '11000000-0000-4000-8000-000000000001' $$,
  $$ values (55) $$,
  'and to the day of the session'
);

select is(
  pg_temp.finish((select session_id from played where name = 'lecon'), 'maths-equations.isoler-x', 'lecon', 1, 3::smallint, true),
  0,
  'finishing the same attempt again earns nothing'
);

select results_eq(
  $$ select attempts, stars::integer, passed from public.level_progress where student_id = '11000000-0000-4000-8000-000000000001' and level_id = 'maths-equations.isoler-x' $$,
  $$ values (1, 3, true) $$,
  'and does not count a second attempt'
);

select results_eq(
  $$ select finished, recorded_at is not null from public.level_attempts
     where session_id = (select session_id from played where name = 'lecon') $$,
  $$ values (true, true) $$,
  'the attempt is marked as counted'
);

select throws_ok(
  $$ select pg_temp.finish(gen_random_uuid(), 'maths-equations.isoler-x', 'lecon', 1, 3::smallint, true) $$,
  'P0002',
  'level attempt not found',
  'a level cannot be finished without an attempt'
);

-- ---------------------------------------------------------------------------
-- Rejouer : meilleur résultat gardé, XP des seules étoiles nouvelles
-- ---------------------------------------------------------------------------
insert into played values ('ex1', pg_temp.play('11000000-0000-4000-8000-000000000001', 'maths-equations.resoudre-ax-b-c'));
insert into played values ('ex2', pg_temp.play('11000000-0000-4000-8000-000000000001', 'maths-equations.resoudre-ax-b-c'));
insert into played values ('ex3', pg_temp.play('11000000-0000-4000-8000-000000000001', 'maths-equations.resoudre-ax-b-c'));

select is(
  pg_temp.finish((select session_id from played where name = 'ex1'), 'maths-equations.resoudre-ax-b-c', 'exercices', 0.6, 1::smallint, true),
  20,
  'exercises passed with one star earn 10 + 10 XP'
);

select is(
  pg_temp.finish((select session_id from played where name = 'ex2'), 'maths-equations.resoudre-ax-b-c', 'exercices', 0.95, 3::smallint, true),
  20,
  'replaying with three stars earns only the two new stars'
);

select is(
  pg_temp.finish((select session_id from played where name = 'ex3'), 'maths-equations.resoudre-ax-b-c', 'exercices', 0.75, 2::smallint, true),
  0,
  'a weaker replay earns nothing'
);

select results_eq(
  $$ select best_score, stars::integer, attempts from public.level_progress
     where student_id = '11000000-0000-4000-8000-000000000001' and level_id = 'maths-equations.resoudre-ax-b-c' $$,
  $$ values (0.950::numeric(4, 3), 3, 3) $$,
  'the best score and stars are kept, every attempt is counted'
);

insert into played values ('ev1', pg_temp.play('11000000-0000-4000-8000-000000000001', 'maths-equations.bilan'));
insert into played values ('ev2', pg_temp.play('11000000-0000-4000-8000-000000000001', 'maths-equations.bilan'));

select is(
  pg_temp.finish((select session_id from played where name = 'ev1'), 'maths-equations.bilan', 'evaluation', 0.625, 1::smallint, false),
  20,
  'a failed evaluation still earns the first-finish XP (X5b: 5 out of 8, +20 XP)'
);

select is(
  pg_temp.finish((select session_id from played where name = 'ev2'), 'maths-equations.bilan', 'evaluation', 0.75, 2::smallint, true),
  10,
  'passing it later earns the new star only'
);

select results_eq(
  $$ select passed, stars::integer from public.level_progress where student_id = '11000000-0000-4000-8000-000000000001' and level_id = 'maths-equations.bilan' $$,
  $$ values (true, 2) $$,
  'a level stays passed once it has been passed'
);

reset role;

-- ---------------------------------------------------------------------------
-- Élève et parents : lecture seule
-- ---------------------------------------------------------------------------
select pg_temp.login('11000000-0000-4000-8000-000000000001');

select results_eq(
  $$ select count(*)::integer from public.level_progress $$,
  $$ values (3) $$,
  'a student reads her level progress'
);

select throws_ok(
  $$ select count(*) from public.level_attempts $$,
  '42501',
  null,
  'a student cannot read the attempts (tutor judgements)'
);

select throws_ok(
  $$ update public.level_progress set stars = 3 $$,
  '42501',
  null,
  'a student cannot write her progress'
);

select throws_ok(
  $$ select public.finish_level((select session_id from played where name = 'ev1'),
       '11000000-0000-4000-8000-000000000001', 'maths-equations.bilan', 'maths-equations', 'maths',
       'evaluation', 1, 3::smallint, true) $$,
  '42501',
  null,
  'a student cannot finish a level herself'
);

reset role;
select pg_temp.login('21000000-0000-4000-8000-000000000001');

select results_eq(
  $$ select count(*)::integer from public.level_progress $$,
  $$ values (3) $$,
  'a linked parent reads the level progress'
);

reset role;
select pg_temp.login('21000000-0000-4000-8000-000000000002');

select is_empty(
  $$ select 1 from public.level_progress $$,
  'another parent reads nothing'
);

reset role;

select * from finish();

rollback;
