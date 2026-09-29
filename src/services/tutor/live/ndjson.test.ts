import { readNdjson } from './ndjson';

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
      controller.close();
    },
  });
}

describe('readNdjson', () => {
  it('reconstitue les événements même coupés entre deux morceaux', async () => {
    const events = [];
    for await (const event of readNdjson(
      streamOf(['{"type":"delta","text":"Pres', 'que !"}\n{"type":"do', 'ne"}\n']),
    )) {
      events.push(event);
    }
    expect(events).toEqual([{ type: 'delta', text: 'Presque !' }, { type: 'done' }]);
  });
});
