import { handleChat } from '@server/tutor/chat';

export function POST(request: Request): Promise<Response> {
  return handleChat(request);
}
