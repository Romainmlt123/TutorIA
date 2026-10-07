-- Niveaux d'Explorer joués avec le tuteur écrit : la partie en cours de chaque séance et le meilleur
-- résultat de l'élève par niveau. Tout est écrit par le serveur, qui juge les réponses (outils du
-- tuteur) et calcule le résultat ; l'app et les parents ne font que lire la progression.

create type public.level_type as enum ('lecon', 'exercices', 'evaluation');

-- Une séance écrite peut porter un niveau d'Explorer, « <ville>.<niveau> » (null : séance libre).
alter table public.study_sessions
  add column level_id text check (level_id ~ '^[a-z0-9]+([.-][a-z0-9]+)*$' and char_length(level_id) <= 96);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Partie d'un niveau dans une séance : les jugements du tuteur, plafonnés par le serveur.
-- `recorded_at` est posé une seule fois, par finish_level, quand le résultat a compté.
create table public.level_attempts (
  session_id uuid not null,
  student_id uuid not null,
  level_id text not null check (level_id ~ '^[a-z0-9]+([.-][a-z0-9]+)*$' and char_length(level_id) <= 96),
  -- Réponses enregistrées, dans l'ordre : [{"correct": true, "hinted": false}, …].
  answers jsonb not null default '[]' check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) <= 20),
  steps_done smallint not null default 0 check (steps_done between 0 and 20),
  finished boolean not null default false,
  score numeric(4, 3) check (score between 0 and 1),
  stars smallint check (stars between 0 and 3),
  passed boolean,
  recorded_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (session_id, level_id),
  constraint level_attempts_session_fkey foreign key (session_id, student_id)
    references public.study_sessions (id, student_id) on delete cascade
);

create index level_attempts_session_student_idx on public.level_attempts (session_id, student_id);

-- Meilleur résultat d'un élève sur un niveau : rien ne se perd en rejouant.
create table public.level_progress (
  student_id uuid not null references public.students (id) on delete cascade,
  level_id text not null check (level_id ~ '^[a-z0-9]+([.-][a-z0-9]+)*$' and char_length(level_id) <= 96),
  chapter_id text not null check (chapter_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(chapter_id) <= 64),
  subject_id public.subject_id not null,
  level_type public.level_type not null,
  best_score numeric(4, 3) not null check (best_score between 0 and 1),
  stars smallint not null check (stars between 0 and 3),
  -- Réussi au moins une fois (leçon terminée, exercices avec une étoile, bilan à 70 %).
  passed boolean not null,
  attempts integer not null default 1 check (attempts >= 1),
  first_finished_at timestamptz not null default now(),
  last_played_at timestamptz not null default now(),
  primary key (student_id, level_id)
);

create index level_progress_chapter_idx on public.level_progress (student_id, chapter_id);

-- ---------------------------------------------------------------------------
-- XP d'un niveau (mêmes valeurs que src/features/explorer/logic/progression.ts)
-- ---------------------------------------------------------------------------

-- 10 XP la première fois qu'il est terminé, réussi ou non (l'effort compte), et 10 XP par étoile :
-- rejouer ne rapporte que les étoiles nouvelles.
create function private.level_xp(p_stars smallint)
returns integer language sql immutable set search_path = ''
as $$ select 10 + 10 * p_stars $$;

revoke execute on function private.level_xp(smallint) from public;

-- ---------------------------------------------------------------------------
-- Fin d'un niveau (serveur) : en une transaction, le meilleur résultat et l'XP de la séance.
-- ---------------------------------------------------------------------------

-- Rend l'XP accordée. Idempotente : une partie déjà comptée rend 0 sans rien changer.
-- L'XP s'ajoute à la séance ; les déclencheurs de study_sessions la reportent sur le jour et
-- la progression de l'élève. La maîtrise du chapitre n'est pas touchée.
create function public.finish_level(
  p_session_id uuid,
  p_student_id uuid,
  p_level_id text,
  p_chapter_id text,
  p_subject_id public.subject_id,
  p_level_type public.level_type,
  p_score numeric,
  p_stars smallint,
  p_passed boolean
)
returns integer
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_attempt public.level_attempts%rowtype;
  v_previous public.level_progress%rowtype;
  v_found boolean;
  v_before integer := 0;
  v_after integer;
begin
  -- Deux parties du même niveau finies en même temps (deux appareils) : l'une attend l'autre, pour
  -- que l'XP ne soit pas accordée deux fois avant que la ligne de progression existe.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_student_id::text || p_level_id, 0));

  select * into v_attempt from public.level_attempts
  where session_id = p_session_id and student_id = p_student_id and level_id = p_level_id
  for update;
  if not found then
    raise exception 'level attempt not found' using errcode = 'P0002';
  end if;
  if v_attempt.recorded_at is not null then
    return 0;
  end if;

  update public.level_attempts set
    finished = true,
    score = p_score,
    stars = p_stars,
    passed = p_passed,
    recorded_at = now(),
    updated_at = now()
  where session_id = p_session_id and level_id = p_level_id;

  select * into v_previous from public.level_progress
  where student_id = p_student_id and level_id = p_level_id
  for update;
  v_found := found;
  if v_found then
    v_before := private.level_xp(v_previous.stars);
  end if;

  insert into public.level_progress as lp (
    student_id, level_id, chapter_id, subject_id, level_type, best_score, stars, passed
  )
  values (
    p_student_id, p_level_id, p_chapter_id, p_subject_id, p_level_type, p_score, p_stars, p_passed
  )
  on conflict (student_id, level_id) do update set
    best_score = greatest(lp.best_score, excluded.best_score),
    stars = greatest(lp.stars, excluded.stars),
    passed = lp.passed or excluded.passed,
    attempts = lp.attempts + 1,
    last_played_at = now();

  v_after := private.level_xp(
    greatest(p_stars, case when v_found then v_previous.stars else 0 end)::smallint
  );
  if v_after > v_before then
    update public.study_sessions set xp = xp + (v_after - v_before)
    where id = p_session_id and student_id = p_student_id;
  end if;
  return greatest(0, v_after - v_before);
end;
$$;

revoke execute on function public.finish_level(
  uuid, uuid, text, text, public.subject_id, public.level_type, numeric, smallint, boolean
) from public, anon, authenticated;
grant execute on function public.finish_level(
  uuid, uuid, text, text, public.subject_id, public.level_type, numeric, smallint, boolean
) to service_role;
grant execute on function private.level_xp(smallint) to service_role;

-- ---------------------------------------------------------------------------
-- Sécurité d'accès
-- ---------------------------------------------------------------------------
alter table public.level_attempts enable row level security;
alter table public.level_progress enable row level security;

revoke all on table public.level_attempts, public.level_progress from anon, authenticated;
grant select, insert, update, delete on table public.level_attempts, public.level_progress
  to service_role;

-- level_attempts : serveur seulement (RLS active, aucune politique).

-- Meilleurs résultats : l'élève et ses parents lisent ; seul finish_level écrit.
grant select on table public.level_progress to authenticated;

create policy level_progress_select on public.level_progress
  for select to authenticated
  using (student_id = (select auth.uid()) or student_id in (select private.linked_student_ids()));
