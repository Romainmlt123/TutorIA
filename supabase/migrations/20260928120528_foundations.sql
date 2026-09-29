-- Fondations : schéma privé, identifiants UUID v7, jour à l'heure de Paris,
-- énumérations partagées et droits par défaut fermés.

-- ---------------------------------------------------------------------------
-- Droits par défaut : rien n'est ouvert automatiquement à l'API.
-- Chaque migration accorde explicitement ce dont l'app a besoin, table par table.
-- ---------------------------------------------------------------------------
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Schéma privé : fonctions internes (politiques RLS, déclencheurs).
-- Il n'est pas exposé par l'API (config.toml : api.schemas).
-- ---------------------------------------------------------------------------
create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;
alter default privileges in schema private revoke execute on functions from public;

-- unaccent : comparaison des prénoms sans tenir compte des accents ni de la casse.
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------------
-- UUID v7 (RFC 9562) : 48 bits d'horodatage en millisecondes, puis de l'aléatoire.
-- Triés par date de création : index compacts, pagination et partitionnement par période.
-- Postgres 17 n'a pas uuidv7() : à remplacer par la fonction native en Postgres 18.
-- ---------------------------------------------------------------------------
create function private.uuid_v7()
returns uuid
language sql
volatile
parallel safe
set search_path = ''
as $$
  select encode(
    set_bit(
      set_bit(
        overlay(
          uuid_send(gen_random_uuid())
          placing substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3)
          from 1 for 6
        ),
        52, 1
      ),
      53, 1
    ),
    'hex'
  )::uuid;
$$;

revoke execute on function private.uuid_v7() from public;
grant execute on function private.uuid_v7() to authenticated, service_role;

-- Jour civil à Paris : référence unique pour les séries, les agrégats et les limites de temps.
create function private.paris_day(p_at timestamptz)
returns date
language sql
stable
parallel safe
set search_path = ''
as $$
  select (p_at at time zone 'Europe/Paris')::date;
$$;

revoke execute on function private.paris_day(timestamptz) from public;
grant execute on function private.paris_day(timestamptz) to authenticated, service_role;

-- Clé de comparaison d'un prénom : sans espaces autour, sans accents, en minuscules.
create function private.name_key(p_name text)
returns text
language sql
stable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, btrim(p_name)));
$$;

revoke execute on function private.name_key(text) from public;
grant execute on function private.name_key(text) to service_role;

-- ---------------------------------------------------------------------------
-- Énumérations. Une nouvelle valeur s'ajoute par ALTER TYPE … ADD VALUE, sans migration de données.
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('student', 'parent');

create type public.grade as enum (
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '6e', '5e', '4e', '3e',
  '2de', '1re', 'Tle'
);

create type public.subject_id as enum (
  'maths', 'francais', 'histoire-geo', 'anglais', 'svt', 'physique-chimie'
);

-- Auto-évaluation de l'onboarding (Galère, Bof, Ça va, À l'aise) : jamais une note.
create type public.comfort_level as enum ('struggling', 'meh', 'ok', 'confident');

create type public.learning_goal as enum (
  'raise_grades', 'understand', 'prepare_tests', 'national_exam', 'get_ahead', 'homework_faster'
);

create type public.learning_mode as enum ('written', 'voice', 'visual', 'quiz');

create type public.study_moment as enum ('morning', 'after_school', 'evening', 'weekend');

-- not_required : 15 ans ou plus. pending : en attente d'un parent. granted : validé.
create type public.consent_status as enum ('not_required', 'pending', 'granted');

-- Origine d'un lien parent-enfant, qui est aussi la méthode du consentement.
create type public.link_origin as enum ('link_code', 'request');
