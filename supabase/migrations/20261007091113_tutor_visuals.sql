-- Visuels du tuteur (chantier 3) : graphique, diagramme, figure ou tableau blanc décrit par le
-- tuteur et validé par le serveur, gardé avec son message. Le serveur le relit pour que le tuteur
-- se souvienne de ce qu'il a montré. Comme les messages : écrit par le serveur seul, lu par l'élève
-- seulement (jamais par les parents), effacé au bout de 6 mois avec eux.

alter table public.messages
  add column visual jsonb
    check (visual is null or (jsonb_typeof(visual) = 'object' and pg_column_size(visual) <= 8192));
