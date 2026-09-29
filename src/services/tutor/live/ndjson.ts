import type { TutorStreamEvent } from '../api-contract';

/** Lit un flux NDJSON (une ligne JSON par événement), morceau par morceau. */
export async function* readNdjson(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<TutorStreamEvent, void, void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = done ? '' : (lines.pop() ?? '');
      for (const line of lines) {
        if (line.trim()) yield JSON.parse(line) as TutorStreamEvent;
      }
      if (done) return;
    }
  } finally {
    reader.releaseLock();
  }
}
