import { handleReport } from '@server/tutor/report';

export function POST(request: Request): Promise<Response> {
  return handleReport(request);
}
