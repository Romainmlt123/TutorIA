-- Séances, flashcards, progression, agrégats, confidentialité des messages et purges.
begin;

create extension if not exists pgtap with schema extensions;

select plan(26);

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

select pg_temp.new_user('11000000-0000-4000-8000-000000000001', 'lea@test.fr',
  '{"role": "student", "first_name": "Léa", "under_15": true}');
select pg_temp.new_user('11000000-0000-4000-8000-000000000002', 'tom@test.fr',
  '{"role": "student", "first_name": "Tom", "under_15": false}');
select pg_temp.new_user('21000000-0000-4000-8000-000000000001', 'claire@test.fr',
  '{"role": "parent", "first_name": "Claire", "terms_accepted": true}');
select pg_temp.new_user('21000000-0000-4000-8000-000000000002', 'marc@test.fr',
  '{"role": "parent", "first_name": "Marc", "terms_accepted": true}');

insert into public.parent_links (parent_id, student_id, origin)
values ('21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'link_code');

select ok(
  exists (select 1 from public.student_progress where student_id = '11000000-0000-4000-8000-000000000001'),
  'a new student gets a progress row'
);

-- ---------------------------------------------------------------------------
-- Flashcards (élève)
-- ---------------------------------------------------------------------------
create temp table demo_session (id uuid) on commit drop;
grant select, insert on demo_session to authenticated;

select pg_temp.login('11000000-0000-4000-8000-000000000001');

with created as (
  insert into public.study_sessions (mode, subject_id, chapter_id)
  values ('flashcards', 'maths', 'maths-equations')
  returning id
)
insert into demo_session select id from created;

select results_eq(
  $$ select student_id::text, mode::text from public.study_sessions $$,
  $$ values ('11000000-0000-4000-8000-000000000001', 'flashcards') $$,
  'a student starts a flashcard session, owned by the base'
);

select throws_ok(
  $$ insert into public.study_sessions (mode, subject_id) values ('written', 'maths') $$,
  '42501',
  null,
  'a student cannot create a tutor session herself'
);

select throws_ok(
  $$ insert into public.study_sessions (mode, started_at) values ('flashcards', now() - interval '3 hours') $$,
  '42501',
  null,
  'a student cannot choose the start time of a session'
);

select lives_ok(
  $$ insert into public.flashcard_reviews (session_id, card_id, chapter_id, subject_id, correct)
     select id, 'maths-equations-1', 'maths-equations', 'maths', true from demo_session $$,
  'a student records a right answer'
);

select lives_ok(
  $$ insert into public.flashcard_reviews (session_id, card_id, chapter_id, subject_id, correct)
     select id, 'maths-equations-2', 'maths-equations', 'maths', false from demo_session $$,
  'a student records an answer to review'
);

select throws_ok(
  $$ insert into public.flashcard_reviews (session_id, card_id, chapter_id, subject_id, correct)
     select id, 'maths-equations-1', 'maths-equations', 'maths', true from demo_session $$,
  '23505',
  null,
  'a card is answered once per session: no XP farming'
);

select throws_ok(
  $$ update public.student_progress set xp = 99999 $$,
  '42501',
  null,
  'a student cannot give herself XP'
);

select throws_ok(
  $$ insert into public.daily_activity (student_id, day, seconds) values ('11000000-0000-4000-8000-000000000001', current_date, 99999) $$,
  '42501',
  null,
  'a student cannot write her study time'
);

select results_eq(
  $$ select card_id, state::text, box from public.flashcard_states order by card_id $$,
  $$ values ('maths-equations-1', 'known', 1::smallint), ('maths-equations-2', 'to_review', 1::smallint) $$,
  'each card gets its state and Leitner box'
);

select results_eq(
  $$ select mastery, sessions from public.chapter_progress where chapter_id = 'maths-equations' $$,
  $$ values (0.500::numeric(4,3), 1) $$,
  'the chapter mastery is the success rate of the last answers'
);

select results_eq(
  $$ select xp, cards_answered, cards_correct from public.study_sessions $$,
  $$ values (10, 2::smallint, 1::smallint) $$,
  'the session earns 5 XP per answered card'
);

select results_eq(
  $$ select cards, xp, sessions from public.daily_activity $$,
  $$ values (2, 10, 1) $$,
  'the day aggregates cards, XP and sessions'
);

select results_eq(
  $$ select xp, streak_days from public.student_progress $$,
  $$ values (10, 1) $$,
  'XP and streak are updated by the base'
);

reset role;
select pg_temp.login('11000000-0000-4000-8000-000000000002');

select throws_ok(
  $$ insert into public.flashcard_reviews (session_id, card_id, chapter_id, subject_id, correct)
     select id, 'maths-equations-3', 'maths-equations', 'maths', true from demo_session $$,
  null,
  null,
  'a student cannot answer in the session of another student'
);

select results_eq(
  $$ select count(*)::int from public.study_sessions $$,
  $$ values (0) $$,
  'a student does not see the sessions of another student'
);

reset role;

-- ---------------------------------------------------------------------------
-- Tuteur (serveur) : conversation et messages, jamais visibles des parents
-- ---------------------------------------------------------------------------
insert into public.study_sessions (id, student_id, mode, subject_id, chapter_id, started_at)
values ('31000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'written', 'maths', 'maths-equations', now() - interval '1 day');

insert into public.conversations (id, student_id, session_id)
values ('41000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001');

insert into public.messages (conversation_id, student_id, role, content)
values ('41000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'student', 'Je bloque sur 3x + 5 = 20'),
       ('41000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'tutor', 'Que fait le 5 à gauche ?');

select results_eq(
  $$ select streak_days from public.student_progress where student_id = '11000000-0000-4000-8000-000000000001' $$,
  $$ values (1) $$,
  'a session on an earlier day keeps the current streak'
);

select pg_temp.login('11000000-0000-4000-8000-000000000001');

select results_eq(
  $$ select count(*)::int from public.messages $$,
  $$ values (2) $$,
  'a student reads her own messages'
);

reset role;
select pg_temp.login('21000000-0000-4000-8000-000000000001');

select results_eq(
  $$ select (select count(*) from public.messages) + (select count(*) from public.conversations) $$,
  $$ values (0::bigint) $$,
  'a parent never reads the messages of her child'
);

select results_eq(
  $$ select count(*)::int from public.study_sessions $$,
  $$ values (2) $$,
  'a linked parent sees the sessions of her child'
);

select results_eq(
  $$ select count(*)::int from public.daily_activity $$,
  $$ values (2) $$,
  'a linked parent sees the daily activity of her child'
);

reset role;
select pg_temp.login('21000000-0000-4000-8000-000000000002');

select results_eq(
  $$ select (select count(*) from public.study_sessions) + (select count(*) from public.chapter_progress) + (select count(*) from public.daily_activity) $$,
  $$ values (0::bigint) $$,
  'an unlinked parent sees no activity'
);

reset role;
set local role service_role;

select results_eq(
  $$ select consent_status::text, voice_enabled, today_seconds >= 0 from public.tutor_context('11000000-0000-4000-8000-000000000001') $$,
  $$ values ('pending', true, true) $$,
  'the server reads the tutor context in one call'
);

reset role;
select pg_temp.login('21000000-0000-4000-8000-000000000001');

select throws_ok(
  $$ select private.purge_expired_data() $$,
  '42501',
  null,
  'only the scheduled job runs the purge'
);

reset role;

-- ---------------------------------------------------------------------------
-- Purges
-- ---------------------------------------------------------------------------
update public.messages set created_at = now() - interval '7 months'
where content = 'Je bloque sur 3x + 5 = 20';
update public.students set created_at = now() - interval '31 days'
where id = '11000000-0000-4000-8000-000000000002';

select * from private.purge_expired_data();

-- Limité à l'élève du test : la base locale peut contenir d'autres messages (seed, essais).
select results_eq(
  $$ select content from public.messages where student_id = '11000000-0000-4000-8000-000000000001' $$,
  $$ values ('Que fait le 5 à gauche ?') $$,
  'messages older than 6 months are purged'
);

select ok(
  exists (select 1 from auth.users where id = '11000000-0000-4000-8000-000000000002'),
  'a student aged 15 or more is never purged for missing consent'
);

select * from finish();

rollback;
