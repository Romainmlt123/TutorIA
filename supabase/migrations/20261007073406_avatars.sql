-- Avatar de l'élève (étape A4) : l'apparence de sa figurine et sa garde-robe, pour les retrouver
-- sur tous ses appareils. Aucune donnée personnelle : des rangs dans des palettes, des noms de
-- formes et des identifiants d'objets, jamais de photo. Les parents ne le voient pas.
-- Les objets gagnés sont calculés par l'app à partir de la progression (écrite par le serveur
-- seul) ; la base les garde pour toujours.

create table public.avatars (
  student_id uuid primary key default auth.uid() references public.students (id) on delete cascade,
  -- Apparence (AvatarLook, relue par normalizeLook) ; null tant que l'élève ne l'a pas créée.
  look jsonb check (jsonb_typeof(look) = 'object' and pg_column_size(look) <= 4096),
  -- Objets gagnés, et ceux déjà annoncés à l'élève (« Nouveau ! »).
  owned text[] not null default '{}'
    check (cardinality(owned) <= 64 and array_to_string(owned, ',') ~ '^([a-z0-9-]{1,40}(,|$))*$'),
  announced text[] not null default '{}'
    check (cardinality(announced) <= 64 and array_to_string(announced, ',') ~ '^([a-z0-9-]{1,40}(,|$))*$'),
  updated_at timestamptz not null default now()
);

create trigger avatars_touch
  before update on public.avatars
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Sécurité d'accès : l'élève seulement, sur sa propre ligne et ces trois colonnes.
-- ---------------------------------------------------------------------------
alter table public.avatars enable row level security;

revoke all on table public.avatars from anon, authenticated;
grant select, insert, update, delete on table public.avatars to service_role;
grant select on table public.avatars to authenticated;
grant insert (look, owned, announced), update (look, owned, announced) on table public.avatars
  to authenticated;

create policy avatars_select on public.avatars
  for select to authenticated
  using (student_id = (select auth.uid()));

create policy avatars_insert on public.avatars
  for insert to authenticated
  with check (student_id = (select auth.uid()));

create policy avatars_update on public.avatars
  for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));
