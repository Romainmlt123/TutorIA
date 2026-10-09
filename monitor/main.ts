/**
 * Surveillant du vocal : petit service Node toujours allumé (EAS Hosting tourne sur des Workers, qui
 * ne gardent pas une connexion ouverte 10 min). Le serveur intermédiaire lui confie chaque appel
 * créé (POST /watch) ; il s'y branche (connexion « sideband » de l'API Realtime), applique les
 * règles de `callMonitor.ts` et raccroche si besoin. Il ne garde rien : ni transcription, ni photo,
 * et ses journaux ne contiennent que l'identifiant de l'appel et la raison.
 *
 * Lancement : npm run monitor (Node 24, qui exécute le TypeScript directement).
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import OpenAI from 'openai';
import { z } from 'zod';

import { MODERATION_MODEL, verdictOf } from '../server/guards/moderationRules.ts';
import { createCallMonitor, type HangupReason, type Watch } from './callMonitor.ts';

const env = z
  .object({
    OPENAI_API_KEY: z.string().min(1),
    VOICE_MONITOR_TOKEN: z.string().min(32),
    PORT: z.coerce.number().int().default(8787),
  })
  .parse(process.env);

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
/** Le serveur intermédiaire attend la réponse : la connexion à l'appel doit s'ouvrir vite. */
const ATTACH_TIMEOUT_MS = 4_000;
const MAX_BODY_BYTES = 8_000;

/**
 * WebSocket intégré à Node (undici) : il accepte des en-têtes, que les types du navigateur, chargés
 * pour l'app, ne connaissent pas.
 */
const NodeWebSocket = WebSocket as unknown as new (
  url: string,
  init: { headers: Record<string, string> },
) => WebSocket;

const watchSchema = z.object({
  callId: z.string().regex(/^rtc_[A-Za-z0-9_-]{1,100}$/),
  instructionsHash: z.string().regex(/^[0-9a-f]{64}$/),
  tools: z.array(z.string().max(64)).max(10),
  maxSeconds: z.number().int().min(1).max(600),
  allowedTexts: z.array(z.string().max(200)).max(5),
  maxPhotos: z.number().int().min(0).max(10),
  notes: z.object({
    distress: z.string().max(800),
    offTopic: z.string().max(800),
    tutorCut: z.string().max(800),
  }),
});

/** Appels suivis : raccrochés si le service s'arrête, plutôt que laissés sans surveillance. */
const calls = new Map<string, { stop: (reason: HangupReason) => Promise<void> }>();

function log(level: 'info' | 'error', message: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, message, ...fields });
  if (level === 'error') console.error(line);
  else console.info(line);
}

function sha256(text: string): Promise<string> {
  return Promise.resolve(createHash('sha256').update(text).digest('hex'));
}

async function hangup(callId: string, reason: HangupReason) {
  log('info', 'hangup', { callId, reason });
  try {
    await openai.realtime.calls.hangup(callId);
  } catch (error) {
    // Appel déjà terminé côté OpenAI : rien d'autre à faire.
    log('error', 'hangup.failed', { callId, error: String(error) });
  }
}

/** Se branche sur l'appel ; résout quand la connexion est ouverte, rejette sinon. */
function watchCall(watch: Watch): Promise<void> {
  const socket = new NodeWebSocket(
    `wss://api.openai.com/v1/realtime?call_id=${encodeURIComponent(watch.callId)}`,
    { headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } },
  );
  const monitor = createCallMonitor(watch, {
    sha256,
    moderateText: async (text) =>
      verdictOf(
        (await openai.moderations.create({ model: MODERATION_MODEL, input: text })).results[0],
      ),
    moderateImage: async (dataUrl) =>
      verdictOf(
        (
          await openai.moderations.create({
            model: MODERATION_MODEL,
            // OpenAI renvoie les photos en « image/jpg », type non standard : on le remet en « image/jpeg ».
            input: [
              {
                type: 'image_url',
                image_url: { url: dataUrl.replace(/^data:image\/jpg;/, 'data:image/jpeg;') },
              },
            ],
          })
        ).results[0],
      ),
    silence: (responding) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      if (responding) socket.send(JSON.stringify({ type: 'response.cancel' }));
      socket.send(JSON.stringify({ type: 'output_audio_buffer.clear' }));
    },
    retrieveItem: (itemId) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'conversation.item.retrieve', item_id: itemId }));
      }
    },
    instruct: (itemId, note) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      socket.send(
        JSON.stringify({
          type: 'conversation.item.create',
          item: {
            id: itemId,
            type: 'message',
            role: 'system',
            content: [{ type: 'input_text', text: note }],
          },
        }),
      );
      socket.send(JSON.stringify({ type: 'response.create' }));
    },
    hangup: (reason) => hangup(watch.callId, reason),
    onError: (error) =>
      log('error', 'monitor.check', { callId: watch.callId, error: String(error) }),
  });
  const limit = setTimeout(() => void monitor.stop('time_limit'), watch.maxSeconds * 1000);
  calls.set(watch.callId, monitor);

  socket.addEventListener('message', ({ data }) => {
    let event: object;
    try {
      event = JSON.parse(String(data)) as object;
    } catch (error) {
      log('error', 'monitor.event', { callId: watch.callId, error: String(error) });
      return;
    }
    void monitor.push(event);
  });
  socket.addEventListener('close', () => {
    clearTimeout(limit);
    calls.delete(watch.callId);
    log('info', 'call.closed', { callId: watch.callId });
  });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error('Connexion à l’appel trop lente'));
    }, ATTACH_TIMEOUT_MS);
    socket.addEventListener('open', () => {
      clearTimeout(timer);
      resolve();
    });
    socket.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error('Connexion à l’appel impossible'));
    });
  });
}

function isAuthorized(request: IncomingMessage): boolean {
  const given = Buffer.from(request.headers.authorization ?? '');
  const expected = Buffer.from(`Bearer ${env.VOICE_MONITOR_TOKEN}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function readBody(request: IncomingMessage): Promise<unknown> {
  let body = '';
  for await (const chunk of request) {
    body += String(chunk);
    if (body.length > MAX_BODY_BYTES) throw new RangeError('Corps trop volumineux');
  }
  return JSON.parse(body) as unknown;
}

function reply(response: ServerResponse, status: number, body: object) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    reply(response, 200, { ok: true, calls: calls.size });
    return;
  }
  if (request.method !== 'POST' || request.url !== '/watch') {
    reply(response, 404, { error: 'not_found' });
    return;
  }
  if (!isAuthorized(request)) {
    reply(response, 401, { error: 'unauthorized' });
    return;
  }
  readBody(request)
    .then(async (body) => {
      const watch = watchSchema.safeParse(body);
      if (!watch.success) {
        reply(response, 400, { error: 'bad_request' });
        return;
      }
      try {
        await watchCall(watch.data);
        log('info', 'call.watched', { callId: watch.data.callId });
        reply(response, 200, { ok: true });
      } catch (error) {
        log('error', 'call.attach', { callId: watch.data.callId, error: String(error) });
        reply(response, 502, { error: 'attach_failed' });
      }
    })
    .catch((error: unknown) => {
      log('error', 'request.body', { error: String(error) });
      reply(response, 400, { error: 'bad_request' });
    });
});

/** Arrêt (déploiement, redémarrage) : les appels suivis sont raccrochés, jamais laissés seuls. */
async function shutdown() {
  log('info', 'shutdown', { calls: calls.size });
  server.close();
  await Promise.all([...calls.values()].map((call) => call.stop('time_limit')));
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());

server.listen(env.PORT, () => log('info', 'listening', { port: env.PORT }));
