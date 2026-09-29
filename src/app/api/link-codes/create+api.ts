import { handleCreateLinkCode } from '@server/account/linkCodes';

export function POST(request: Request): Promise<Response> {
  return handleCreateLinkCode(request);
}
