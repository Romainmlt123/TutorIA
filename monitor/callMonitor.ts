import type { Verdict } from '../server/guards/moderationRules.ts';

/** Pourquoi le surveillant raccroche : journalisé, sans aucun contenu de l'appel. */
export type HangupReason =
  | 'session_changed'
  | 'injected_item'
  | 'tutor_flagged'
  | 'photo_flagged'
  | 'too_many_photos'
  | 'student_flagged'
  | 'moderation_error'
  | 'time_limit';

/** Ce que le serveur intermédiaire confie au surveillant pour un appel. */
export type Watch = {
  callId: string;
  /** Empreinte SHA-256 des consignes fixées par le serveur à la création de l'appel. */
  instructionsHash: string;
  /** Outils proposés au tuteur, par nom. */
  tools: string[];
  /** Durée maximale de l'appel : 10 min, ou moins s'il reste moins de temps dans la limite du jour. */
  maxSeconds: number;
  /** Seuls textes que l'app écrit dans la conversation (la légende d'une photo). */
  allowedTexts: string[];
  maxPhotos: number;
  /** Consignes glissées au tuteur quand la voix de l'élève est signalée (server/tutor/prompt.ts). */
  notes: { distress: string; offTopic: string; tutorCut: string };
};

export type Effects = {
  sha256(text: string): Promise<string>;
  moderateText(text: string): Promise<Verdict>;
  moderateImage(dataUrl: string): Promise<Verdict>;
  /**
   * Coupe la parole du tuteur : l'audio pas encore joué, et la réponse en cours s'il y en a une
   * (`responding`). L'audio se joue après la fin de la réponse : il est vidé dans tous les cas.
   */
  silence(responding: boolean): void;
  /**
   * Redemande un élément de la conversation : les événements annoncent une photo sans son image,
   * que seul `conversation.item.retrieved` contient.
   */
  retrieveItem(itemId: string): void;
  /** Glisse une consigne au tuteur (message système `itemId`), puis lui demande de répondre. */
  instruct(itemId: string, note: string): void;
  hangup(reason: HangupReason): Promise<void>;
  /** Erreur imprévue pendant un contrôle : journalisée, l'appel est raccroché. */
  onError(error: unknown): void;
};

/** Événement reçu sur la connexion du serveur à l'appel (API Realtime), réduit à ce qui est lu. */
type CallEvent = {
  type?: string;
  delta?: string;
  item_id?: string;
  transcript?: string;
  response_id?: string;
  session?: {
    instructions?: string;
    tools?: { name?: string }[];
    audio?: { input?: { transcription?: object | null } };
  };
  item?: CallItem;
};

type CallItem = {
  id?: string;
  type?: string;
  role?: string;
  output?: string;
  content?: { type?: string; text?: string; image_url?: string }[];
};

/** Fin de phrase : le texte du tuteur est modéré à chaque phrase terminée, sans attendre la fin. */
const SENTENCE_END = /[.!?…:\n]\s*$/;
/** Propos déplacés de l'élève : le tuteur le recentre deux fois, l'appel s'arrête à la troisième. */
const MAX_STUDENT_STRIKES = 3;
/**
 * Phrase du tuteur signalée : il est coupé aussitôt et revient aux révisions ; l'appel s'arrête au
 * deuxième signalement. La modération signale aussi des refus (« pas de violence ») : raccrocher dès
 * le premier serait trop brutal.
 */
const MAX_TUTOR_STRIKES = 2;

/** Seule réponse d'outil que l'app renvoie : le visuel a-t-il été montré ? */
function isVisualResult(output: string | undefined): boolean {
  try {
    const value: unknown = JSON.parse(output ?? '');
    return (
      typeof value === 'object' &&
      value !== null &&
      Object.keys(value).length === 1 &&
      typeof (value as { shown?: unknown }).shown === 'boolean'
    );
  } catch {
    return false;
  }
}

/**
 * Surveillant d'un appel vocal : il lit tous les événements de l'appel et raccroche dès qu'une règle
 * est enfreinte. Les consignes et les outils ne doivent pas changer ; l'app n'ajoute à la
 * conversation que des photos (modérées ici, après les avoir redemandées), leur légende et le résultat des visuels ; la voix du
 * tuteur est modérée phrase par phrase, celle de l'élève à chaque phrase dite. Les événements sont traités un par un, dans l'ordre.
 */
export function createCallMonitor(watch: Watch, effects: Effects) {
  let ended = false;
  let photos = 0;
  const seenItems = new Set<string>();
  /** Photos annoncées, en attente de leur image (redemandée à OpenAI) pour être modérées. */
  const awaitingImages = new Set<string>();
  /** Consignes glissées par le surveillant : ce sont les seuls messages système permis. */
  const ownItems = new Set<string>();
  let strikes = 0;
  /** Une réponse du tuteur est en cours : une consigne sans interruption attend sa fin. */
  let responding = false;
  let tutorStrikes = 0;
  /** Texte dit par le tuteur dans chaque réponse en cours : la modération lit la réponse entière. */
  const spoken = new Map<string, string>();
  /** Réponses du tuteur coupées par le surveillant : leurs derniers morceaux sont ignorés. */
  const cutResponses = new Set<string>();
  let queue = Promise.resolve();

  const stop = async (reason: HangupReason) => {
    if (ended) return;
    ended = true;
    effects.silence(responding);
    await effects.hangup(reason);
  };

  /** Un verdict négatif raccroche ; une modération indisponible aussi (on ne laisse pas passer). */
  const moderate = async (check: () => Promise<Verdict>, reason: HangupReason) => {
    let verdict: Verdict;
    try {
      verdict = await check();
    } catch (error) {
      effects.onError(error);
      await stop('moderation_error');
      return;
    }
    if (verdict !== 'ok') await stop(reason);
  };

  const checkSession = async (session: NonNullable<CallEvent['session']>) => {
    const hash = await effects.sha256(session.instructions ?? '');
    const tools = (session.tools ?? []).map((tool) => tool.name ?? '').sort();
    const expected = [...watch.tools].sort();
    const sameTools =
      tools.length === expected.length && tools.every((name, i) => name === expected[i]);
    // Sans transcription, le surveillant n'entendrait plus l'élève.
    const transcribed = Boolean(session.audio?.input?.transcription);
    if (hash !== watch.instructionsHash || !sameTools || !transcribed) {
      await stop('session_changed');
    }
  };

  const checkImage = (dataUrl: string) =>
    moderate(() => effects.moderateImage(dataUrl), 'photo_flagged');

  /** L'élément redemandé arrive avec ses images : celles d'une photo annoncée sont modérées. */
  const checkRetrieved = async (item: CallItem) => {
    if (!item.id || !awaitingImages.delete(item.id)) return;
    for (const part of item.content ?? []) {
      if (part.type === 'input_image' && part.image_url) await checkImage(part.image_url);
      if (ended) return;
    }
  };

  const checkItem = async (item: CallItem) => {
    // Un même élément est annoncé plusieurs fois (ajouté, puis terminé) : contrôlé une seule fois.
    if (item.id) {
      if (seenItems.has(item.id)) return;
      seenItems.add(item.id);
    }
    if (item.id && ownItems.has(item.id)) return;
    if (item.type === 'function_call') return;
    if (item.type === 'function_call_output') {
      if (!isVisualResult(item.output)) await stop('injected_item');
      return;
    }
    if (item.type !== 'message') {
      await stop('injected_item');
      return;
    }
    const content = item.content ?? [];
    if (item.role === 'assistant') {
      // Une réponse du modèle arrive vide puis se remplit ; un message « du tuteur » écrit par l'app
      // arriverait déjà rempli.
      if (content.length > 0) await stop('injected_item');
      return;
    }
    if (item.role !== 'user') {
      await stop('injected_item');
      return;
    }
    for (const part of content) {
      if (part.type === 'input_audio') continue;
      if (part.type === 'input_text' && watch.allowedTexts.includes(part.text ?? '')) continue;
      if (part.type === 'input_image') {
        photos += 1;
        if (photos > watch.maxPhotos) {
          await stop('too_many_photos');
          return;
        }
        if (part.image_url) await checkImage(part.image_url);
        else if (item.id) {
          awaitingImages.add(item.id);
          effects.retrieveItem(item.id);
        } else await stop('injected_item');
        if (ended) return;
        continue;
      }
      await stop('injected_item');
      return;
    }
  };

  const checkSpeech = async (responseId: string, delta: string, done: boolean) => {
    if (cutResponses.has(responseId)) return;
    const text = (spoken.get(responseId) ?? '') + delta;
    if (done) spoken.delete(responseId);
    else spoken.set(responseId, text);
    if (!text.trim() || !(done || SENTENCE_END.test(text))) return;
    let verdict: Verdict;
    try {
      verdict = await effects.moderateText(text);
    } catch (error) {
      effects.onError(error);
      await stop('moderation_error');
      return;
    }
    if (verdict === 'ok') return;
    tutorStrikes += 1;
    // La réponse coupée n'est plus modérée : le reste de son texte ne sera pas dit.
    spoken.delete(responseId);
    cutResponses.add(responseId);
    if (tutorStrikes >= MAX_TUTOR_STRIKES) await stop('tutor_flagged');
    else instruct(watch.notes.tutorCut, true);
  };

  let pendingNote: string | null = null;

  const sendNote = (note: string) => {
    const itemId = `monitor_${ownItems.size + 1}`;
    ownItems.add(itemId);
    effects.instruct(itemId, note);
  };

  /**
   * Glisse une consigne au tuteur : tout de suite en le coupant (propos déplacés), ou après sa
   * réponse en cours (détresse : on ne coupe pas un tuteur qui répond déjà avec douceur).
   */
  const instruct = (note: string, interrupt: boolean) => {
    if (interrupt || !responding) {
      if (interrupt) effects.silence(responding);
      sendNote(note);
    } else pendingNote = note;
  };

  /**
   * Voix de l'élève, transcrite pour le surveillant seulement : une détresse fait répondre le tuteur
   * avec douceur (3114, 119) sans raccrocher ; des propos déplacés le font recentrer, puis raccrocher.
   */
  const checkStudent = async (transcript: string) => {
    if (!transcript.trim()) return;
    let verdict: Verdict;
    try {
      verdict = await effects.moderateText(transcript);
    } catch (error) {
      effects.onError(error);
      await stop('moderation_error');
      return;
    }
    if (verdict === 'distress') instruct(watch.notes.distress, false);
    else if (verdict === 'flagged') {
      strikes += 1;
      if (strikes >= MAX_STUDENT_STRIKES) await stop('student_flagged');
      else instruct(watch.notes.offTopic, true);
    }
  };

  const handle = async (event: CallEvent) => {
    if (ended) return;
    switch (event.type) {
      case 'session.created':
      case 'session.updated':
        if (event.session) await checkSession(event.session);
        break;
      case 'conversation.item.added':
      case 'conversation.item.created':
      case 'conversation.item.done':
        if (event.item) await checkItem(event.item);
        break;
      case 'response.created':
        responding = true;
        break;
      case 'response.done':
        responding = false;
        if (pendingNote) {
          sendNote(pendingNote);
          pendingNote = null;
        }
        break;
      case 'conversation.item.input_audio_transcription.completed':
        await checkStudent(event.transcript ?? '');
        break;
      case 'conversation.item.retrieved':
        if (event.item) await checkRetrieved(event.item);
        break;
      case 'response.output_audio_transcript.delta':
      case 'response.output_text.delta':
        await checkSpeech(event.response_id ?? '', event.delta ?? '', false);
        break;
      case 'response.output_audio_transcript.done':
      case 'response.output_text.done':
        await checkSpeech(event.response_id ?? '', '', true);
        break;
    }
  };

  return {
    /** Ajoute un événement à la file : ils sont contrôlés dans l'ordre d'arrivée. */
    push(event: CallEvent) {
      queue = queue
        .then(() => handle(event))
        .catch(async (error: unknown) => {
          effects.onError(error);
          await stop('moderation_error');
        });
      return queue;
    },
    stop,
    get ended() {
      return ended;
    },
  };
}
