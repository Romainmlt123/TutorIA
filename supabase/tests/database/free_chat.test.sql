-- Chat libre : titre des discussions, suppression par l'élève, purge des discussions vidées.
begin;

create extension if not exists pgtap with schema extensions;

select plan(9);

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

-- Discussion de l'élève, telle que le serveur la crée (une séance écrite, une conversation, un message).
create function pg_temp.chat(p_student uuid, p_title text, p_age interval, p_with_message boolean)
returns uuid
language plpgsql
as $$
declare
  v_session uuid;
  v_conversation uuid;
begin
  insert into public.study_sessions (student_id, mode, subject_id, started_at)
  values (p_student, 'written', 'maths', now() - p_age) returning id into v_session;
  insert into public.conversations (student_id, session_id, title, created_at, last_message_at)
  values (p_student, v_session, p_title, now() - p_age, now() - p_age) returning id into v_conversation;
  if p_with_message then
    insert into public.messages (conversation_id, student_id, role, content)
    values (v_conversation, p_student, 'student', 'Comment on calcule une hypoténuse ?');
  end if;
  return v_conversation;
end;
$$;

select pg_temp.new_user('14000000-0000-4000-8000-000000000001', 'lea@test.fr',
  '{"role": "student", "first_name": "Léa", "under_15": false}');
select pg_temp.new_user('14000000-0000-4000-8000-000000000002', 'tom@test.fr',
  '{"role": "student", "first_name": "Tom", "under_15": false}');
select pg_temp.new_user('24000000-0000-4000-8000-000000000001', 'claire@test.fr',
  '{"role": "parent", "first_name": "Claire", "terms_accepted": true}');

insert into public.parent_links (parent_id, student_id, origin)
values ('24000000-0000-4000-8000-000000000001', '14000000-0000-4000-8000-000000000001', 'link_code');

create temp table chats (name text primary key, id uuid) on commit drop;
grant select on chats to authenticated;

insert into chats values
  ('pythagore', pg_temp.chat('14000000-0000-4000-8000-000000000001', 'Pythagore : l''hypoténuse', interval '1 day', true)),
  ('old_empty', pg_temp.chat('14000000-0000-4000-8000-000000000001', 'Ancienne discussion', interval '7 months', false)),
  ('old_kept', pg_temp.chat('14000000-0000-4000-8000-000000000001', 'Ancienne avec message', interval '7 months', true)),
  ('tom', pg_temp.chat('14000000-0000-4000-8000-000000000002', 'Discussion de Tom', interval '1 day', true));

select throws_ok(
  $$ update public.conversations set title = repeat('x', 81) where id = (select id from chats where name = 'pythagore') $$,
  '23514',
  null,
  'a title stays short'
);

-- ---------------------------------------------------------------------------
-- L'élève : ses discussions, et leur suppression
-- ---------------------------------------------------------------------------
select pg_temp.login('14000000-0000-4000-8000-000000000001');

select results_eq(
  $$ select title from public.conversations order by last_message_at desc $$,
  $$ values ('Pythagore : l''hypoténuse'), ('Ancienne discussion'), ('Ancienne avec message') $$,
  'a student lists her own discussions with their titles'
);

select throws_ok(
  $$ update public.conversations set title = 'Renommée' $$,
  '42501',
  null,
  'a student does not write titles (the server gives them)'
);

delete from public.conversations where id = (select id from chats where name = 'tom');

reset role;
select isnt_empty(
  $$ select 1 from public.conversations where id = (select id from chats where name = 'tom') $$,
  'a student cannot delete the discussion of another student'
);

select pg_temp.login('24000000-0000-4000-8000-000000000001');
delete from public.conversations;
reset role;
select is(
  (select count(*)::integer from public.conversations where student_id = '14000000-0000-4000-8000-000000000001'),
  3,
  'a parent neither sees nor deletes the discussions'
);

select pg_temp.login('14000000-0000-4000-8000-000000000001');
delete from public.conversations where id = (select id from chats where name = 'pythagore');
reset role;

select is_empty(
  $$ select 1 from public.messages where conversation_id = (select id from chats where name = 'pythagore') $$,
  'deleting a discussion deletes its messages'
);

select is(
  (select count(*)::integer from public.study_sessions where student_id = '14000000-0000-4000-8000-000000000001'),
  3,
  'the study session stays, for stats and parents, without any text'
);

-- ---------------------------------------------------------------------------
-- Purge de nuit
-- ---------------------------------------------------------------------------
select results_eq(
  $$ select deleted::integer from private.purge_expired_data() where item = 'conversations' $$,
  $$ values (1) $$,
  'the nightly purge removes an old discussion left without messages'
);

select results_eq(
  $$ select id from public.conversations where id in (select id from chats where name like 'old%') $$,
  $$ select id from chats where name = 'old_kept' $$,
  'an old discussion keeps living while it still has messages (they go first)'
);

select * from finish();

rollback;
