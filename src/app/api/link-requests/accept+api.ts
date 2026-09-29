import { handleAcceptLinkRequest } from '@server/account/consent';

export function POST(request: Request): Promise<Response> {
  return handleAcceptLinkRequest(request);
}
