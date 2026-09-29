import { handleWeeklyReport } from '@server/tutor/summaries';

export function POST(request: Request): Promise<Response> {
  return handleWeeklyReport(request);
}
