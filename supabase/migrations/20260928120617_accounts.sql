-- Comptes : profils élève et parent rattachés à Supabase Auth, liens parent-enfant,
-- codes de liaison, demandes de liaison, consentements, réglages parentaux et auto-évaluation.
-- Les mots de passe restent dans Supabase Auth : aucune table ne les voit.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Un profil par utilisateur Auth. Le rôle ne change jamais.
-- Le prénom est vide tant qu'un parent invité n'a pas finalisé son compte.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  first_name text check (
    first_name is null or (char_length(first_name) between 1 and 40 and first_name = btrim(first_name))
  ),
  created_at timestamptz not null default now()
);

-- Élève. Aucune date de naissance : un seul booléen « moins de 15 ans ».
create table public.students (
  id uuid primary key references public.profiles (id) on delete cascade,
  grade public.grade,
  under_15 boolean not null,
  consent_status public.consent_status not null,
  daily_minutes smallint check (daily_minutes in (10, 15, 20, 30)),
  goals public.learning_goal[] not null default '{}' check (cardinality(goals) <= 6),
  modes public.learning_mode[] not null default '{}' check (cardinality(modes) <= 4),
  moments public.study_moment[] not null default '{}' check (cardinality(moments) <= 4),
  reminder_enabled boolean not null default false,
  onboarding_completed_at timestamptz,
  terms_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint students_consent_matches_age check (
    (under_15 and consent_status in ('pending', 'granted'))
    or (not under_15 and consent_status = 'not_required')
  )
);

-- Parent. terms_accepted_at vide = parent invité qui n'a pas encore finalisé son compte.
create table public.parents (
  id uuid primary key references public.profiles (id) on delete cascade,
  weekly_report boolean not null default false,
  alerts boolean not null default true,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Plusieurs enfants par parent, plusieurs parents par enfant.
create table public.parent_links (
  parent_id uuid not null references public.parents (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  origin public.link_origin not null,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

create index parent_links_student_id_idx on public.parent_links (student_id);

-- Code de liaison à 6 chiffres créé par un parent (L5, L6). Seul son HMAC est stocké
-- (clé LINK_CODE_PEPPER, côté serveur). Valable 24 h, utilisable une seule fois.
-- Aucun droit côté app : tout passe par le serveur.
create table public.link_codes (
  id uuid primary key default private.uuid_v7(),
  parent_id uuid not null references public.parents (id) on delete cascade,
  child_first_name text not null check (
    char_length(child_first_name) between 1 and 40 and child_first_name = btrim(child_first_name)
  ),
  child_grade public.grade not null,
  code_hmac text not null check (code_hmac ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  used_at timestamptz,
  used_by uuid references public.students (id) on delete set null,
  constraint link_codes_valid_24h check (expires_at <= created_at + interval '24 hours'),
  -- used_by redevient vide si l'élève supprime son compte ; un code non utilisé n'a pas d'élève.
  constraint link_codes_used_by_requires_use check (used_at is not null or used_by is null)
);

-- Un code actif est unique : une collision à la création déclenche un nouveau tirage.
create unique index link_codes_active_code_idx on public.link_codes (code_hmac) where used_at is null;
create index link_codes_parent_id_idx on public.link_codes (parent_id);
create index link_codes_used_by_idx on public.link_codes (used_by);

-- Demande de liaison d'un élève vers un parent (invitation par e-mail ou parent déjà inscrit).
-- Une seule demande en attente par élève : une nouvelle demande remplace l'ancienne.
create table public.link_requests (
  student_id uuid primary key references public.students (id) on delete cascade,
  parent_id uuid not null references public.parents (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index link_requests_parent_id_idx on public.link_requests (parent_id);

-- Preuve du consentement parental (CNIL, moins de 15 ans) : qui, comment, quand.
-- Elle survit à la suppression du compte parent (parent_id devient vide).
create table public.parental_consents (
  id uuid primary key default private.uuid_v7(),
  student_id uuid not null references public.students (id) on delete cascade,
  parent_id uuid references public.parents (id) on delete set null,
  method public.link_origin not null,
  granted_at timestamptz not null default now()
);

create index parental_consents_student_id_idx on public.parental_consents (student_id);
create index parental_consents_parent_id_idx on public.parental_consents (parent_id);

-- Réglages parentaux (P4), un par élève, créés à l'inscription avec des valeurs ouvertes.
create table public.parental_settings (
  student_id uuid primary key references public.students (id) on delete cascade,
  daily_limit_enabled boolean not null default false,
  daily_limit_minutes smallint not null default 90 check (daily_limit_minutes between 15 and 240),
  allowed_from time not null default '17:00',
  allowed_until time not null default '21:00',
  evening_pause boolean not null default false,
  voice_enabled boolean not null default true,
  camera_enabled boolean not null default true,
  visuals_enabled boolean not null default true,
  weekly_goal_hours smallint not null default 4 check (weekly_goal_hours between 1 and 10),
  updated_by uuid references public.parents (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint parental_settings_window check (allowed_from < allowed_until)
);

create index parental_settings_updated_by_idx on public.parental_settings (updated_by);

-- Auto-évaluation par matière (O2). Réservée à l'élève : jamais montrée au parent, jamais envoyée à OpenAI.
create table public.self_assessments (
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id public.subject_id not null,
  level public.comfort_level not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, subject_id)
);

-- ---------------------------------------------------------------------------
-- Fonctions d'accès utilisées par les politiques RLS.
-- security definer : elles lisent parent_links sans repasser par sa propre RLS.
-- ---------------------------------------------------------------------------
create function private.linked_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select student_id from public.parent_links where parent_id = (select auth.uid());
$$;

create function private.linked_parent_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select parent_id from public.parent_links where student_id = (select auth.uid());
$$;

-- Élèves qui ont envoyé une demande de liaison au parent connecté (prénom affiché avant d'accepter).
create function private.requesting_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select student_id from public.link_requests where parent_id = (select auth.uid());
$$;

revoke execute on function private.linked_student_ids() from public;
revoke execute on function private.linked_parent_ids() from public;
revoke execute on function private.requesting_student_ids() from public;
grant execute on function private.linked_student_ids() to authenticated;
grant execute on function private.linked_parent_ids() to authenticated;
grant execute on function private.requesting_student_ids() to authenticated;

-- ---------------------------------------------------------------------------
-- Déclencheurs
-- ---------------------------------------------------------------------------

-- Inscription : crée le profil à partir des métadonnées envoyées par l'app (ou par l'invitation).
-- Ces métadonnées sont modifiables par l'utilisateur : elles ne servent qu'à la création,
-- jamais aux règles d'accès. Une valeur invalide refuse l'inscription.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role public.user_role := (meta ->> 'role')::public.user_role;
  v_first_name text := nullif(btrim(coalesce(meta ->> 'first_name', '')), '');
  v_under_15 boolean;
begin
  if v_role is null then
    raise exception 'signup metadata: role is required' using errcode = '22023';
  end if;

  insert into public.profiles (id, role, first_name) values (new.id, v_role, v_first_name);

  if v_role = 'student' then
    v_under_15 := (meta ->> 'under_15')::boolean;
    if v_first_name is null or v_under_15 is null then
      raise exception 'signup metadata: first_name and under_15 are required' using errcode = '22023';
    end if;

    insert into public.students (id, under_15, consent_status)
    values (new.id, v_under_15, case when v_under_15 then 'pending' else 'not_required' end::public.consent_status);

    insert into public.parental_settings (student_id) values (new.id);
  else
    insert into public.parents (id, weekly_report, terms_accepted_at)
    values (
      new.id,
      coalesce((meta ->> 'weekly_report')::boolean, false),
      case when (meta ->> 'terms_accepted')::boolean then now() end
    );
  end if;

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Le rôle d'un profil ne change jamais, même depuis le serveur.
create function private.prevent_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'profiles.role is immutable' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function private.prevent_role_change() from public;

create trigger profiles_role_immutable
  before update of role on public.profiles
  for each row execute function private.prevent_role_change();

-- Horodatage et auteur des réglages parentaux.
create function private.touch_parental_settings()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

revoke execute on function private.touch_parental_settings() from public;

create trigger parental_settings_touch
  before update on public.parental_settings
  for each row execute function private.touch_parental_settings();

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function private.touch_updated_at() from public;

create trigger self_assessments_touch
  before update on public.self_assessments
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Sécurité d'accès : RLS partout, une politique par action, droits par colonne.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.parents enable row level security;
alter table public.parent_links enable row level security;
alter table public.link_codes enable row level security;
alter table public.link_requests enable row level security;
alter table public.parental_consents enable row level security;
alter table public.parental_settings enable row level security;
alter table public.self_assessments enable row level security;

revoke all on table
  public.profiles, public.students, public.parents, public.parent_links, public.link_codes,
  public.link_requests, public.parental_consents, public.parental_settings, public.self_assessments
from anon, authenticated;

grant select, insert, update, delete on table
  public.profiles, public.students, public.parents, public.parent_links, public.link_codes,
  public.link_requests, public.parental_consents, public.parental_settings, public.self_assessments
to service_role;

-- profiles : soi-même, ses enfants liés, ses parents liés, les élèves qui demandent la liaison.
grant select on table public.profiles to authenticated;
grant update (first_name) on table public.profiles to authenticated;

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or id in (select private.linked_student_ids())
    or id in (select private.linked_parent_ids())
    or id in (select private.requesting_student_ids())
  );

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- students : l'élève modifie seulement ses réponses d'onboarding ; le parent lié lit.
grant select on table public.students to authenticated;
grant update (grade, daily_minutes, goals, modes, moments, reminder_enabled, onboarding_completed_at)
  on table public.students to authenticated;

create policy students_select on public.students
  for select to authenticated
  using (id = (select auth.uid()) or id in (select private.linked_student_ids()));

create policy students_update on public.students
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- parents : soi-même seulement.
grant select on table public.parents to authenticated;
grant update (weekly_report, alerts) on table public.parents to authenticated;

create policy parents_select on public.parents
  for select to authenticated
  using (id = (select auth.uid()));

create policy parents_update on public.parents
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- parent_links : lus et supprimables par l'un ou l'autre ; créés par le serveur.
grant select, delete on table public.parent_links to authenticated;

create policy parent_links_select on public.parent_links
  for select to authenticated
  using (parent_id = (select auth.uid()) or student_id = (select auth.uid()));

create policy parent_links_delete on public.parent_links
  for delete to authenticated
  using (parent_id = (select auth.uid()) or student_id = (select auth.uid()));

-- link_codes : aucun droit côté app (RLS active, aucune politique).

-- link_requests : l'élève annule, le parent refuse ; l'acceptation passe par le serveur.
grant select, delete on table public.link_requests to authenticated;

create policy link_requests_select on public.link_requests
  for select to authenticated
  using (student_id = (select auth.uid()) or parent_id = (select auth.uid()));

create policy link_requests_delete on public.link_requests
  for delete to authenticated
  using (student_id = (select auth.uid()) or parent_id = (select auth.uid()));

-- parental_consents : lecture seule pour l'élève concerné et le parent qui a validé.
grant select on table public.parental_consents to authenticated;

create policy parental_consents_select on public.parental_consents
  for select to authenticated
  using (student_id = (select auth.uid()) or parent_id = (select auth.uid()));

-- parental_settings : l'élève lit (pour les appliquer), le parent lié lit et modifie.
grant select on table public.parental_settings to authenticated;
grant update (
  daily_limit_enabled, daily_limit_minutes, allowed_from, allowed_until, evening_pause,
  voice_enabled, camera_enabled, visuals_enabled, weekly_goal_hours
) on table public.parental_settings to authenticated;

create policy parental_settings_select on public.parental_settings
  for select to authenticated
  using (student_id = (select auth.uid()) or student_id in (select private.linked_student_ids()));

create policy parental_settings_update on public.parental_settings
  for update to authenticated
  using (student_id in (select private.linked_student_ids()))
  with check (student_id in (select private.linked_student_ids()));

-- self_assessments : l'élève seulement.
grant select, insert, update, delete on table public.self_assessments to authenticated;

create policy self_assessments_select on public.self_assessments
  for select to authenticated
  using (student_id = (select auth.uid()));

create policy self_assessments_insert on public.self_assessments
  for insert to authenticated
  with check (student_id = (select auth.uid()));

create policy self_assessments_update on public.self_assessments
  for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

create policy self_assessments_delete on public.self_assessments
  for delete to authenticated
  using (student_id = (select auth.uid()));
