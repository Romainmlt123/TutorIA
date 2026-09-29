import { handleVoiceEnd } from '@server/tutor/voice';

export function POST(request: Request): Promise<Response> {
  return handleVoiceEnd(request);
}
