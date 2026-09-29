import { handleDeleteChild } from '@server/account/account';

export function POST(request: Request): Promise<Response> {
  return handleDeleteChild(request);
}
