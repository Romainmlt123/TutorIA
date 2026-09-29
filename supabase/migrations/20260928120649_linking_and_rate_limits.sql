-- Liaison parent-enfant, consentement et limite de débit partagée.
-- Ces fonctions sont appelées par les routes API avec la clé secrète : aucun droit pour l'app.

-- ---------------------------------------------------------------------------
-- Limite de débit partagée entre toutes les instances du serveur.
-- Compteur à fenêtre fixe : une ligne par (clé, fenêtre), incrémentée de façon atomique.
-- ---------------------------------------------------------------------------
create table public.rate_limits (
  key text not null check (char_length(key) between 1 and 200),
  window_start timestamptz not null,
  hits integer not null default 1 check (hits > 0),
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.rate_limits to service_role;

-- Renvoie true si l'appel est autorisé (au plus p_limit appels par fenêtre de p_window_seconds).
create function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language sql
volatile
set search_path = ''
as $$
  insert into public.rate_limits as r (key, window_start, hits)
  values (
    p_key,
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds),
    1
  )
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits <= p_limit;
$$;

-- ---------------------------------------------------------------------------
-- Consentement : passe un élève « en attente » à « validé » et garde la preuve.
-- ---------------------------------------------------------------------------
create function private.grant_consent(p_student_id uuid, p_parent_id uuid, p_method public.link_origin)
returns void
language sql
volatile
set search_path = ''
as $$
  with validated as (
    update public.students
    set consent_status = 'granted'
    where id = p_student_id and consent_status = 'pending'
    returning id
  )
  insert into public.parental_consents (student_id, parent_id, method)
  select id, p_parent_id, p_method from validated;
$$;

revoke execute on function private.grant_consent(uuid, uuid, public.link_origin) from public;
grant execute on function private.grant_consent(uuid, uuid, public.link_origin) to service_role;

-- Nombre maximal d'enfants reliés à un parent (formule Famille).
create function private.children_limit_reached(p_parent_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select count(*) >= 4 from public.parent_links where parent_id = p_parent_id;
$$;

revoke execute on function private.children_limit_reached(uuid) from public;
grant execute on function private.children_limit_reached(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Compte associé à une adresse e-mail (invitation d'un parent par un élève).
-- La réponse ne sort jamais du serveur : l'app ne sait pas si l'adresse existe.
-- ---------------------------------------------------------------------------
create function public.find_account_by_email(p_email text)
returns table (id uuid, role public.user_role)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, p.role
  from auth.users as u
  join public.profiles as p on p.id = u.id
  where u.email = lower(btrim(p_email))
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Code de liaison (L5, L6) : création par un parent.
-- Statuts : created, collision (même HMAC déjà actif : le serveur retire un code), children_limit.
-- ---------------------------------------------------------------------------
create function public.create_link_code(
  p_parent_id uuid,
  p_child_first_name text,
  p_child_grade public.grade,
  p_code_hmac text
)
returns table (status text, expires_at timestamptz)
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_expires_at timestamptz;
begin
  if private.children_limit_reached(p_parent_id) then
    return query select 'children_limit'::text, null::timestamptz;
    return;
  end if;

  begin
    insert into public.link_codes (parent_id, child_first_name, child_grade, code_hmac)
    values (p_parent_id, btrim(p_child_first_name), p_child_grade, p_code_hmac)
    returning link_codes.expires_at into v_expires_at;
  exception
    when unique_violation then
      return query select 'collision'::text, null::timestamptz;
      return;
  end;

  return query select 'created'::text, v_expires_at;
end;
$$;

-- ---------------------------------------------------------------------------
-- Code de liaison : utilisation par un élève (L2, profil, O5).
-- Statuts : linked, already_linked, invalid (inconnu, expiré ou déjà utilisé),
-- name_mismatch (prénom différent de celui saisi par le parent), children_limit, not_student.
-- ---------------------------------------------------------------------------
create function public.redeem_link_code(p_student_id uuid, p_code_hmac text)
returns table (status text, parent_id uuid)
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_code public.link_codes%rowtype;
  v_student_name text;
begin
  select * into v_code
  from public.link_codes as c
  where c.code_hmac = p_code_hmac and c.used_at is null
  for update;

  if not found or v_code.expires_at <= now() then
    return query select 'invalid'::text, null::uuid;
    return;
  end if;

  select p.first_name into v_student_name
  from public.profiles as p
  where p.id = p_student_id and p.role = 'student';

  if v_student_name is null then
    return query select 'not_student'::text, null::uuid;
    return;
  end if;

  if private.name_key(v_student_name) <> private.name_key(v_code.child_first_name) then
    return query select 'name_mismatch'::text, null::uuid;
    return;
  end if;

  if exists (
    select 1 from public.parent_links as l
    where l.parent_id = v_code.parent_id and l.student_id = p_student_id
  ) then
    update public.link_codes set used_at = now(), used_by = p_student_id where id = v_code.id;
    return query select 'already_linked'::text, v_code.parent_id;
    return;
  end if;

  if private.children_limit_reached(v_code.parent_id) then
    return query select 'children_limit'::text, null::uuid;
    return;
  end if;

  insert into public.parent_links (parent_id, student_id, origin)
  values (v_code.parent_id, p_student_id, 'link_code');

  update public.link_codes set used_at = now(), used_by = p_student_id where id = v_code.id;

  -- La classe saisie par le parent complète le profil si l'élève ne l'a pas encore donnée.
  update public.students set grade = coalesce(grade, v_code.child_grade) where id = p_student_id;

  perform private.grant_consent(p_student_id, v_code.parent_id, 'link_code');

  delete from public.link_requests as r
  where r.student_id = p_student_id and r.parent_id = v_code.parent_id;

  return query select 'linked'::text, v_code.parent_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Demande de liaison : acceptation par le parent (P1 ou validation après invitation).
-- Statuts : linked, not_found, account_not_ready, children_limit.
-- ---------------------------------------------------------------------------
create function public.accept_link_request(p_parent_id uuid, p_student_id uuid)
returns text
language plpgsql
volatile
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.parents where id = p_parent_id and terms_accepted_at is not null
  ) then
    return 'account_not_ready';
  end if;

  if not exists (
    select 1 from public.link_requests where student_id = p_student_id and parent_id = p_parent_id
  ) then
    return 'not_found';
  end if;

  if private.children_limit_reached(p_parent_id) then
    return 'children_limit';
  end if;

  delete from public.link_requests where student_id = p_student_id and parent_id = p_parent_id;

  insert into public.parent_links (parent_id, student_id, origin)
  values (p_parent_id, p_student_id, 'request')
  on conflict do nothing;

  perform private.grant_consent(p_student_id, p_parent_id, 'request');

  return 'linked';
end;
$$;

-- ---------------------------------------------------------------------------
-- Parent invité : prénom et acceptation des conditions, après le choix du mot de passe.
-- ---------------------------------------------------------------------------
create function public.finalize_parent_account(p_parent_id uuid, p_first_name text)
returns void
language sql
volatile
set search_path = ''
as $$
  update public.profiles set first_name = btrim(p_first_name) where id = p_parent_id and role = 'parent';
  update public.parents set terms_accepted_at = coalesce(terms_accepted_at, now()) where id = p_parent_id;
$$;

-- ---------------------------------------------------------------------------
-- Droits : serveur uniquement.
-- ---------------------------------------------------------------------------
revoke execute on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.find_account_by_email(text) from public, anon, authenticated;
revoke execute on function public.create_link_code(uuid, text, public.grade, text) from public, anon, authenticated;
revoke execute on function public.redeem_link_code(uuid, text) from public, anon, authenticated;
revoke execute on function public.accept_link_request(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.finalize_parent_account(uuid, text) from public, anon, authenticated;

grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
grant execute on function public.find_account_by_email(text) to service_role;
grant execute on function public.create_link_code(uuid, text, public.grade, text) to service_role;
grant execute on function public.redeem_link_code(uuid, text) to service_role;
grant execute on function public.accept_link_request(uuid, uuid) to service_role;
grant execute on function public.finalize_parent_account(uuid, text) to service_role;
