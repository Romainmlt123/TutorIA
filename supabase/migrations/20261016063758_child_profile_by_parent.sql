-- Famille (v2.18, F5) : le parent qui a validé le compte d'un enfant de moins de 15 ans peut
-- modifier son prénom et sa classe (décision de Romain, 16/10 : même règle que pour supprimer le
-- compte). Un élève plus âgé, inscrit lui-même, garde seul la main sur son profil.
-- La table n'est pas ouverte aux parents (ils pourraient alors modifier les autres réglages de
-- l'élève) : une fonction vérifie le droit, puis écrit ces deux colonnes seulement.

create function public.update_child_profile(
  p_student_id uuid,
  p_first_name text,
  p_grade public.grade
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent uuid := (select auth.uid());
  v_first_name text := btrim(coalesce(p_first_name, ''));
begin
  if v_parent is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.parental_consents c
    join public.students s on s.id = c.student_id
    join public.parent_links l on l.student_id = c.student_id and l.parent_id = c.parent_id
    where c.student_id = p_student_id
      and c.parent_id = v_parent
      and s.under_15
  ) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if char_length(v_first_name) not between 1 and 40 then
    raise exception 'invalid_first_name' using errcode = '22023';
  end if;
  if p_grade is null then
    raise exception 'invalid_grade' using errcode = '22023';
  end if;

  update public.profiles set first_name = v_first_name where id = p_student_id;
  update public.students set grade = p_grade where id = p_student_id;
end;
$$;

revoke execute on function public.update_child_profile(uuid, text, public.grade) from public, anon;
grant execute on function public.update_child_profile(uuid, text, public.grade) to authenticated;
