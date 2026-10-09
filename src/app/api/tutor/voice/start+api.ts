import { handleVoiceStart } from '@server/tutor/voice';

export function POST(request: Request): Promise<Response> {
  return handleVoiceStart(request);
}
