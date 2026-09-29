import { handleExport } from '@server/account/account';

export function GET(request: Request): Promise<Response> {
  return handleExport(request);
}
