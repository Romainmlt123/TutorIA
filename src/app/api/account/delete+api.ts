import { handleDeleteAccount } from '@server/account/account';

export function POST(request: Request): Promise<Response> {
  return handleDeleteAccount(request);
}
