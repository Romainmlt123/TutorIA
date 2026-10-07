-- Visuels du tuteur : gardés avec le message, bornés, lus par l'élève seulement.
begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

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

select pg_temp.new_user('13000000-0000-4000-8000-000000000001', 'lea@test.fr',
  '{"role": "student", "first_name": "Léa", "under_15": false}');
select pg_temp.new_user('23000000-0000-4000-8000-000000000001', 'claire@test.fr',
  '{"role": "parent", "first_name": "Claire", "terms_accepted": true}');

insert into public.parent_links (parent_id, student_id, origin)
values ('23000000-0000-4000-8000-000000000001', '13000000-0000-4000-8000-000000000001', 'link_code');

create temp table chat (session_id uuid, conversation_id uuid) on commit drop;
grant select on chat to authenticated, service_role;

with s as (
  insert into public.study_sessions (student_id, mode, subject_id, chapter_id)
  values ('13000000-0000-4000-8000-000000000001', 'written', 'maths', 'maths-equations')
  returning id
), c as (
  insert into public.conversations (student_id, session_id)
  select '13000000-0000-4000-8000-000000000001', id from s
  returning id, session_id
)
insert into chat select session_id, id from c;

set local role service_role;

select lives_ok(
  $$ insert into public.messages (conversation_id, student_id, role, content, visual)
     select conversation_id, '13000000-0000-4000-8000-000000000001', 'tutor', 'Regarde la droite rouge.',
       '{"kind": "graph", "title": "3x + 5 = 20"}'
     from chat $$,
  'the server keeps a visual with the tutor message'
);

select throws_ok(
  $$ insert into public.messages (conversation_id, student_id, role, content, visual)
     select conversation_id, '13000000-0000-4000-8000-000000000001', 'tutor', 'x', '[1, 2]' from chat $$,
  '23514',
  null,
  'a visual is an object'
);

select throws_ok(
  $$ insert into public.messages (conversation_id, student_id, role, content, visual)
     select conversation_id, '13000000-0000-4000-8000-000000000001', 'tutor', 'x',
       jsonb_build_object('pad', repeat('x', 9000)) from chat $$,
  '23514',
  null,
  'a visual stays small'
);

reset role;
select pg_temp.login('13000000-0000-4000-8000-000000000001');

select results_eq(
  $$ select visual ->> 'kind' from public.messages where visual is not null $$,
  $$ values ('graph') $$,
  'the student reads her visuals with her messages'
);

reset role;
select pg_temp.login('23000000-0000-4000-8000-000000000001');

select is_empty(
  $$ select 1 from public.messages $$,
  'a parent never reads messages, nor their visuals'
);

reset role;

select * from finish();

rollback;
