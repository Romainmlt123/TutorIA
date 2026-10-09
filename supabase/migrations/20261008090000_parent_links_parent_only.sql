-- Profil de l'élève (v2.8) : ce n'est pas à l'élève de retirer un parent relié (décision de
-- Romain, 08/10). Le lien ne se supprime plus que par le parent ; sous 15 ans, il porte aussi
-- l'accord parental. L'élève garde la lecture de ses liens.

drop policy parent_links_delete on public.parent_links;

create policy parent_links_delete on public.parent_links
  for delete to authenticated
  using (parent_id = (select auth.uid()));
