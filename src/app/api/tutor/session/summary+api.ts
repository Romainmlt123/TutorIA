import { handleSessionSummary } from '@server/tutor/summaries';

export function POST(request: Request): Promise<Response> {
  return handleSessionSummary(request);
}
