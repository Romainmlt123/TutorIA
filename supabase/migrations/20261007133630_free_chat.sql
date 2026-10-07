-- Chat libre (chantier 4) : l'élève retrouve ses discussions avec le tuteur dans un volet, comme
-- dans une messagerie. Chaque discussion a un titre court (donné par le serveur après le premier
-- échange), l'élève peut supprimer les siennes, et la purge de nuit retire les discussions vidées
-- par la conservation de 6 mois des messages. Les parents ne voient toujours aucune discussion.

alter table public.conversations
  add column title text check (char_length(title) between 1 and 80);

-- L'élève supprime une discussion (et ses messages, en cascade) ; la séance reste, pour ses
-- statistiques et le suivi des parents, sans aucun texte.
grant delete on table public.conversations to authenticated;

create policy conversations_delete on public.conversations
  for delete to authenticated
  using (student_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Purge de nuit : la même, avec les discussions vidées en plus.
-- ---------------------------------------------------------------------------
create or replace function private.purge_expired_data()
returns table (item text, deleted bigint)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_batch constant integer := 5000;
  v_count bigint;
  v_total bigint;
begin
  -- Messages du tuteur : 6 mois (un semestre).
  v_total := 0;
  loop
    delete from public.messages where id in (
      select id from public.messages where created_at < now() - interval '6 months' limit v_batch
    );
    get diagnostics v_count = row_count;
    v_total := v_total + v_count;
    exit when v_count < v_batch;
  end loop;
  item := 'messages'; deleted := v_total; return next;

  -- Discussions du tuteur vidées par la purge des messages : rien à rouvrir, on les retire.
  delete from public.conversations c
  where c.last_message_at < now() - interval '6 months'
    and not exists (select 1 from public.messages m where m.conversation_id = c.id);
  get diagnostics v_count = row_count;
  item := 'conversations'; deleted := v_count; return next;

  -- Signalements des réponses du tuteur : 6 mois.
  delete from public.tutor_reports where created_at < now() - interval '6 months';
  get diagnostics v_count = row_count;
  item := 'tutor_reports'; deleted := v_count; return next;

  -- Résumés de la semaine : 12 mois.
  delete from public.weekly_reports where generated_at < now() - interval '12 months';
  get diagnostics v_count = row_count;
  item := 'weekly_reports'; deleted := v_count; return next;

  -- Codes de liaison : 7 jours après leur expiration.
  delete from public.link_codes where expires_at < now() - interval '7 days';
  get diagnostics v_count = row_count;
  item := 'link_codes'; deleted := v_count; return next;

  -- Demandes de liaison sans réponse : 30 jours.
  delete from public.link_requests where created_at < now() - interval '30 days';
  get diagnostics v_count = row_count;
  item := 'link_requests'; deleted := v_count; return next;

  -- Limite de débit : fenêtres de plus de 48 h.
  delete from public.rate_limits where window_start < now() - interval '48 hours';
  get diagnostics v_count = row_count;
  item := 'rate_limits'; deleted := v_count; return next;

  -- Comptes d'élèves de moins de 15 ans jamais validés par un parent : 30 jours (affiché dans l'app).
  delete from auth.users where id in (
    select id from public.students
    where consent_status = 'pending' and created_at < now() - interval '30 days'
  );
  get diagnostics v_count = row_count;
  item := 'pending_students'; deleted := v_count; return next;

  -- Parents invités qui n'ont jamais finalisé leur compte : 30 jours.
  delete from auth.users where id in (
    select id from public.parents
    where terms_accepted_at is null and created_at < now() - interval '30 days'
  );
  get diagnostics v_count = row_count;
  item := 'unfinished_parents'; deleted := v_count; return next;
end;
$$;

revoke execute on function private.purge_expired_data() from public;
