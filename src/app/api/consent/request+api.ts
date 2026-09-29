import { handleConsentRequest } from '@server/account/consent';

export function POST(request: Request): Promise<Response> {
  return handleConsentRequest(request);
}
