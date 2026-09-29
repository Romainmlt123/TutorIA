import { handleRedeemLinkCode } from '@server/account/linkCodes';

export function POST(request: Request): Promise<Response> {
  return handleRedeemLinkCode(request);
}
