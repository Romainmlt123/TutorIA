-- Activité d'apprentissage : séances (écrit, vocal, flashcards), conversations et messages du tuteur,
-- réponses aux flashcards, progression et agrégats par jour, calculés par déclencheurs.
-- L'app n'écrit que ce qu'elle ne peut pas falsifier : ses réponses aux flashcards, horodatées par la base.

create type public.session_mode as enum ('written', 'voice', 'flashcards');
create type public.session_outcome as enum ('understood', 'progressing', 'to_review');
create type public.session_tool as enum ('graph', 'whiteboard');
create type public.message_role as enum ('student', 'tutor');
create type public.card_state as enum ('known', 'to_review');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Séance : une conversation écrite, un appel vocal ou une série de flashcards.
-- Résumé structuré (notions comprises, points à revoir) : jamais la transcription.
create table public.study_sessions (
  id uuid primary key default private.uuid_v7(),
  student_id uuid not null default auth.uid() references public.students (id) on delete cascade,
  mode public.session_mode not null,
  subject_id public.subject_id,
  chapter_id text check (chapter_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(chapter_id) <= 64),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 3600),
  tools public.session_tool[] not null default '{}',
  outcome public.session_outcome,
  summary_understood text check (char_length(summary_understood) <= 200),
  summary_to_review text check (char_length(summary_to_review) <= 200),
  cards_answered smallint not null default 0 check (cards_answered between 0 and 200),
  cards_correct smallint not null default 0 check (cards_correct between 0 and 200),
  xp integer not null default 0 check (xp >= 0),
  constraint study_sessions_owner unique (id, student_id),
  constraint study_sessions_end_after_start check (ended_at is null or ended_at >= started_at)
);

create index study_sessions_student_started_idx on public.study_sessions (student_id, started_at desc);

-- Fil d'une séance écrite avec le tuteur.
create table public.conversations (
  id uuid primary key default private.uuid_v7(),
  student_id uuid not null references public.students (id) on delete cascade,
  session_id uuid not null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint conversations_owner unique (id, student_id),
  -- Une conversation par séance ; l'index couvre aussi la clé étrangère composée.
  constraint conversations_session_once unique (session_id, student_id),
  constraint conversations_session_fkey foreign key (session_id, student_id)
    references public.study_sessions (id, student_id) on delete cascade
);

create index conversations_student_idx on public.conversations (student_id, last_message_at desc);

-- Messages : ajout seul, jamais lisibles par un parent. Conservés 6 mois.
create table public.messages (
  id uuid primary key default private.uuid_v7(),
  conversation_id uuid not null,
  student_id uuid not null,
  role public.message_role not null,
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  constraint messages_conversation_fkey foreign key (conversation_id, student_id)
    references public.conversations (id, student_id) on delete cascade
);

create index messages_conversation_idx on public.messages (conversation_id, student_id, created_at);
create index messages_student_idx on public.messages (student_id, created_at);

-- Réponse à une flashcard : ajout seul, horodatée par la base, une par carte et par séance.
create table public.flashcard_reviews (
  id uuid primary key default private.uuid_v7(),
  session_id uuid not null,
  student_id uuid not null default auth.uid(),
  card_id text not null check (card_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(card_id) <= 80),
  chapter_id text not null check (chapter_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(chapter_id) <= 64),
  subject_id public.subject_id not null,
  correct boolean not null,
  answered_at timestamptz not null default now(),
  constraint flashcard_reviews_session_fkey foreign key (session_id, student_id)
    references public.study_sessions (id, student_id) on delete cascade,
  constraint flashcard_reviews_once unique (session_id, card_id)
);

create index flashcard_reviews_session_idx on public.flashcard_reviews (session_id, student_id);
create index flashcard_reviews_student_chapter_idx
  on public.flashcard_reviews (student_id, chapter_id, answered_at desc);

-- État de chaque carte (Je sais / À revoir) et prochaine révision (boîtes de Leitner).
create table public.flashcard_states (
  student_id uuid not null references public.students (id) on delete cascade,
  card_id text not null,
  chapter_id text not null,
  subject_id public.subject_id not null,
  state public.card_state not null,
  box smallint not null check (box between 1 and 5),
  due_on date not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, card_id)
);

create index flashcard_states_due_idx on public.flashcard_states (student_id, due_on);

-- Maîtrise d'un chapitre : taux de réussite sur les 20 dernières réponses.
create table public.chapter_progress (
  student_id uuid not null references public.students (id) on delete cascade,
  chapter_id text not null,
  subject_id public.subject_id not null,
  mastery numeric(4, 3) check (mastery between 0 and 1),
  sessions integer not null default 0 check (sessions >= 0),
  updated_at timestamptz not null default now(),
  primary key (student_id, chapter_id)
);

create index chapter_progress_subject_idx on public.chapter_progress (student_id, subject_id);

-- Maîtrise en fin de mois, pour l'évolution sur un mois ou un trimestre (P2).
create table public.chapter_progress_monthly (
  student_id uuid not null references public.students (id) on delete cascade,
  chapter_id text not null,
  month date not null check (extract(day from month) = 1),
  mastery numeric(4, 3) not null check (mastery between 0 and 1),
  primary key (student_id, chapter_id, month)
);

-- XP, niveau et série (une ligne par élève, mise à jour par les déclencheurs).
create table public.student_progress (
  student_id uuid primary key references public.students (id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  record_streak integer not null default 0 check (record_streak >= 0),
  last_active_day date,
  updated_at timestamptz not null default now()
);

-- Agrégat par élève et par jour (heure de Paris) : accueil, stats, espace Parents, limite de temps.
create table public.daily_activity (
  student_id uuid not null references public.students (id) on delete cascade,
  day date not null,
  seconds integer not null default 0 check (seconds >= 0),
  sessions integer not null default 0 check (sessions >= 0),
  cards integer not null default 0 check (cards >= 0),
  xp integer not null default 0 check (xp >= 0),
  primary key (student_id, day)
);

-- Résumé de la semaine pour les parents, produit à partir des agrégats seulement.
create table public.weekly_reports (
  student_id uuid not null references public.students (id) on delete cascade,
  week_start date not null,
  summary text not null check (char_length(summary) between 1 and 600),
  generated_at timestamptz not null default now(),
  primary key (student_id, week_start)
);

-- Signalement d'une réponse du tuteur (exigence Google Play pour l'IA). Conservé 6 mois.
create table public.tutor_reports (
  id uuid primary key default private.uuid_v7(),
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id public.subject_id,
  chapter_id text,
  excerpt text not null check (char_length(excerpt) between 1 and 500),
  prompt_version text not null check (char_length(prompt_version) <= 40),
  created_at timestamptz not null default now()
);

create index tutor_reports_student_idx on public.tutor_reports (student_id);
create index tutor_reports_created_idx on public.tutor_reports (created_at);

-- La progression existe dès l'inscription (une ligne par élève).
insert into public.student_progress (student_id) select id from public.students on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Règles de calcul
-- ---------------------------------------------------------------------------

-- 5 XP par carte répondue (l'effort compte), comme dans l'app ; 15 XP par séance avec le tuteur.
create function private.xp_per_card() returns integer language sql immutable set search_path = ''
as $$ select 5 $$;

create function private.xp_per_tutor_session() returns integer language sql immutable set search_path = ''
as $$ select 15 $$;

-- Durée maximale comptée pour une séance : 10 min pour le vocal (plafond de l'appel), 1 h sinon.
create function private.max_session_seconds(p_mode public.session_mode)
returns integer language sql immutable set search_path = ''
as $$ select case p_mode when 'voice' then 600 else 3600 end $$;

-- Intervalles de Leitner, en jours, par boîte.
create function private.leitner_days(p_box smallint)
returns integer language sql immutable set search_path = ''
as $$ select (array[1, 2, 4, 7, 14])[greatest(1, least(5, p_box))] $$;

revoke execute on function private.xp_per_card() from public;
revoke execute on function private.xp_per_tutor_session() from public;
revoke execute on function private.max_session_seconds(public.session_mode) from public;
revoke execute on function private.leitner_days(smallint) from public;

-- Série : +1 le lendemain du dernier jour actif, inchangée le même jour (ou pour un jour passé),
-- remise à 1 après un jour sans activité.
create function private.next_streak(p_streak integer, p_last_day date, p_day date)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_last_day is null then 1
    when p_day <= p_last_day then greatest(p_streak, 1)
    when p_day = p_last_day + 1 then p_streak + 1
    else 1
  end;
$$;

revoke execute on function private.next_streak(integer, date, date) from public;

-- Une séance compte pour la série du jour (heure de Paris) et pour le nombre de séances.
create function private.record_session_day(p_student_id uuid, p_started_at timestamptz)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_day date := private.paris_day(p_started_at);
begin
  insert into public.daily_activity (student_id, day, sessions)
  values (p_student_id, v_day, 1)
  on conflict (student_id, day) do update set sessions = public.daily_activity.sessions + 1;

  insert into public.student_progress (student_id, streak_days, record_streak, last_active_day)
  values (p_student_id, 1, 1, v_day)
  on conflict (student_id) do update set
    streak_days = private.next_streak(
      public.student_progress.streak_days, public.student_progress.last_active_day, v_day
    ),
    record_streak = greatest(
      public.student_progress.record_streak,
      private.next_streak(
        public.student_progress.streak_days, public.student_progress.last_active_day, v_day
      )
    ),
    last_active_day = greatest(public.student_progress.last_active_day, v_day),
    updated_at = now();
end;
$$;

revoke execute on function private.record_session_day(uuid, timestamptz) from public;

-- Nouvelle séance : série, compteur du jour, séances du chapitre, XP d'une séance avec le tuteur.
create function private.on_session_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.record_session_day(new.student_id, new.started_at);

  if new.chapter_id is not null and new.subject_id is not null then
    insert into public.chapter_progress (student_id, chapter_id, subject_id, sessions)
    values (new.student_id, new.chapter_id, new.subject_id, 1)
    on conflict (student_id, chapter_id) do update set
      sessions = public.chapter_progress.sessions + 1,
      updated_at = now();
  end if;

  if new.mode in ('written', 'voice') then
    update public.study_sessions set xp = private.xp_per_tutor_session() where id = new.id;
  end if;
  return new;
end;
$$;

revoke execute on function private.on_session_created() from public;

create trigger study_sessions_created
  after insert on public.study_sessions
  for each row execute function private.on_session_created();

-- Séance mise à jour : les écarts de durée et d'XP vont dans le jour de la séance et la progression.
create function private.on_session_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date := private.paris_day(new.started_at);
  v_seconds integer := new.duration_seconds - old.duration_seconds;
  v_xp integer := new.xp - old.xp;
  v_cards integer := new.cards_answered - old.cards_answered;
begin
  if v_seconds = 0 and v_xp = 0 and v_cards = 0 then
    return new;
  end if;

  update public.daily_activity set
    seconds = greatest(0, seconds + v_seconds),
    xp = greatest(0, xp + v_xp),
    cards = greatest(0, cards + v_cards)
  where student_id = new.student_id and day = v_day;

  if v_xp <> 0 then
    update public.student_progress set xp = greatest(0, xp + v_xp), updated_at = now()
    where student_id = new.student_id;
  end if;
  return new;
end;
$$;

revoke execute on function private.on_session_updated() from public;

create trigger study_sessions_updated
  after update of duration_seconds, xp, cards_answered on public.study_sessions
  for each row execute function private.on_session_updated();

-- Réponse à une flashcard : état de la carte, maîtrise du chapitre, séance (durée, cartes, XP).
create function private.on_flashcard_answered()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := private.paris_day(new.answered_at);
  v_box smallint;
  v_mastery numeric(4, 3);
  v_session public.study_sessions%rowtype;
  v_first_in_session boolean;
begin
  select * into v_session from public.study_sessions where id = new.session_id for update;

  -- Carte : boîte suivante si la réponse est juste, retour à la première sinon.
  select box into v_box from public.flashcard_states
  where student_id = new.student_id and card_id = new.card_id;
  v_box := case when new.correct then least(5, coalesce(v_box, 0) + 1) else 1 end;

  insert into public.flashcard_states (student_id, card_id, chapter_id, subject_id, state, box, due_on, updated_at)
  values (
    new.student_id, new.card_id, new.chapter_id, new.subject_id,
    case when new.correct then 'known' else 'to_review' end::public.card_state,
    v_box, v_today + private.leitner_days(v_box), now()
  )
  on conflict (student_id, card_id) do update set
    state = excluded.state,
    box = excluded.box,
    due_on = excluded.due_on,
    updated_at = now();

  -- Chapitre : taux de réussite sur les 20 dernières réponses, et photo du mois en cours.
  select round(avg(case when r.correct then 1 else 0 end), 3) into v_mastery
  from (
    select correct from public.flashcard_reviews
    where student_id = new.student_id and chapter_id = new.chapter_id
    order by answered_at desc
    limit 20
  ) as r;

  -- Révision du jour (plusieurs chapitres) : la séance compte une fois pour chaque chapitre touché.
  select count(*) = 1 and v_session.chapter_id is distinct from new.chapter_id into v_first_in_session
  from public.flashcard_reviews
  where session_id = new.session_id and chapter_id = new.chapter_id;

  insert into public.chapter_progress (student_id, chapter_id, subject_id, mastery, sessions)
  values (new.student_id, new.chapter_id, new.subject_id, v_mastery, case when v_first_in_session then 1 else 0 end)
  on conflict (student_id, chapter_id) do update set
    mastery = excluded.mastery,
    sessions = public.chapter_progress.sessions + excluded.sessions,
    updated_at = now();

  insert into public.chapter_progress_monthly (student_id, chapter_id, month, mastery)
  values (new.student_id, new.chapter_id, date_trunc('month', v_today)::date, v_mastery)
  on conflict (student_id, chapter_id, month) do update set mastery = excluded.mastery;

  -- Séance : la durée va de son début à la dernière réponse, plafonnée.
  update public.study_sessions set
    ended_at = new.answered_at,
    duration_seconds = least(
      private.max_session_seconds(v_session.mode),
      greatest(0, extract(epoch from (new.answered_at - v_session.started_at))::integer)
    ),
    cards_answered = cards_answered + 1,
    cards_correct = cards_correct + case when new.correct then 1 else 0 end,
    xp = xp + private.xp_per_card()
  where id = new.session_id;

  return new;
end;
$$;

revoke execute on function private.on_flashcard_answered() from public;

create trigger flashcard_reviews_answered
  after insert on public.flashcard_reviews
  for each row execute function private.on_flashcard_answered();

-- Un nouvel élève a sa ligne de progression dès l'inscription.
create function private.on_student_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.student_progress (student_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

revoke execute on function private.on_student_created() from public;

create trigger students_progress_created
  after insert on public.students
  for each row execute function private.on_student_created();

-- Contrôle d'une réponse : séance de flashcards de l'élève, commencée il y a moins de 2 heures.
create function private.is_open_flashcard_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.study_sessions
    where id = p_session_id
      and student_id = (select auth.uid())
      and mode = 'flashcards'
      and started_at > now() - interval '2 hours'
  );
$$;

revoke execute on function private.is_open_flashcard_session(uuid) from public;
grant execute on function private.is_open_flashcard_session(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Sécurité d'accès
-- ---------------------------------------------------------------------------
alter table public.study_sessions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.flashcard_states enable row level security;
alter table public.chapter_progress enable row level security;
alter table public.chapter_progress_monthly enable row level security;
alter table public.student_progress enable row level security;
alter table public.daily_activity enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.tutor_reports enable row level security;

revoke all on table
  public.study_sessions, public.conversations, public.messages, public.flashcard_reviews,
  public.flashcard_states, public.chapter_progress, public.chapter_progress_monthly,
  public.student_progress, public.daily_activity, public.weekly_reports, public.tutor_reports
from anon, authenticated;

grant select, insert, update, delete on table
  public.study_sessions, public.conversations, public.messages, public.flashcard_reviews,
  public.flashcard_states, public.chapter_progress, public.chapter_progress_monthly,
  public.student_progress, public.daily_activity, public.weekly_reports, public.tutor_reports
to service_role;

-- Séances : l'élève et ses parents lisent ; l'élève ne crée que des séances de flashcards,
-- sans choisir ni son identité ni l'horodatage (valeurs par défaut de la base).
grant select on table public.study_sessions to authenticated;
grant insert (mode, subject_id, chapter_id) on table public.study_sessions to authenticated;

create policy study_sessions_select on public.study_sessions
  for select to authenticated
  using (student_id = (select auth.uid()) or student_id in (select private.linked_student_ids()));

create policy study_sessions_insert on public.study_sessions
  for insert to authenticated
  with check (student_id = (select auth.uid()) and mode = 'flashcards');

-- Conversations et messages : l'élève seulement. Jamais les parents.
grant select on table public.conversations, public.messages to authenticated;

create policy conversations_select on public.conversations
  for select to authenticated
  using (student_id = (select auth.uid()));

create policy messages_select on public.messages
  for select to authenticated
  using (student_id = (select auth.uid()));

-- Réponses aux flashcards : l'élève les ajoute, dans une séance de flashcards ouverte.
grant select on table public.flashcard_reviews to authenticated;
grant insert (session_id, card_id, chapter_id, subject_id, correct) on table public.flashcard_reviews
  to authenticated;

create policy flashcard_reviews_select on public.flashcard_reviews
  for select to authenticated
  using (student_id = (select auth.uid()));

create policy flashcard_reviews_insert on public.flashcard_reviews
  for insert to authenticated
  with check (student_id = (select auth.uid()) and private.is_open_flashcard_session(session_id));

-- État des cartes : l'élève seulement (révision du jour).
grant select on table public.flashcard_states to authenticated;

create policy flashcard_states_select on public.flashcard_states
  for select to authenticated
  using (student_id = (select auth.uid()));

-- Progression et agrégats : l'élève et ses parents lisent ; seuls les déclencheurs écrivent.
grant select on table
  public.chapter_progress, public.chapter_progress_monthly, public.student_progress,
  public.daily_activity, public.weekly_reports
to authenticated;

create policy chapter_progress_select on public.chapter_progress
  for select to authenticated
  using (student_id = (select auth.uid()) or student_id in (select private.linked_student_ids()));

create policy chapter_progress_monthly_select on public.chapter_progress_monthly
  for select to authenticated
  using (student_id = (select auth.uid()) or student_id in (select private.linked_student_ids()));

create policy student_progress_select on public.student_progress
  for select to authenticated
  using (student_id = (select auth.uid()) or student_id in (select private.linked_student_ids()));

create policy daily_activity_select on public.daily_activity
  for select to authenticated
  using (student_id = (select auth.uid()) or student_id in (select private.linked_student_ids()));

create policy weekly_reports_select on public.weekly_reports
  for select to authenticated
  using (student_id = (select auth.uid()) or student_id in (select private.linked_student_ids()));

-- tutor_reports : serveur seulement (RLS active, aucune politique).

-- ---------------------------------------------------------------------------
-- Contexte du tuteur (serveur) : consentement, réglages parentaux et temps du jour, en un appel.
-- ---------------------------------------------------------------------------
create function public.tutor_context(p_student_id uuid)
returns table (
  consent_status public.consent_status,
  voice_enabled boolean,
  camera_enabled boolean,
  visuals_enabled boolean,
  evening_pause boolean,
  daily_limit_enabled boolean,
  daily_limit_minutes smallint,
  allowed_from time,
  allowed_until time,
  today_seconds integer
)
language sql
stable
set search_path = ''
as $$
  select
    s.consent_status,
    ps.voice_enabled,
    ps.camera_enabled,
    ps.visuals_enabled,
    ps.evening_pause,
    ps.daily_limit_enabled,
    ps.daily_limit_minutes,
    ps.allowed_from,
    ps.allowed_until,
    coalesce(
      (select d.seconds from public.daily_activity d
       where d.student_id = s.id and d.day = private.paris_day(now())),
      0
    )
  from public.students s
  join public.parental_settings ps on ps.student_id = s.id
  where s.id = p_student_id;
$$;

revoke execute on function public.tutor_context(uuid) from public, anon, authenticated;
grant execute on function public.tutor_context(uuid) to service_role;
grant execute on function private.paris_day(timestamptz) to service_role;
