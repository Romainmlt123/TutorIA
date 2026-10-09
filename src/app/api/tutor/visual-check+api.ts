import { handleVisualCheck } from '@server/tutor/visualCheck';

export function POST(request: Request): Promise<Response> {
  return handleVisualCheck(request);
}
