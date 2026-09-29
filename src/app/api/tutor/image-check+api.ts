import { errorResponse } from '@server/http';
import { serverLog } from '@server/log';
import { getAdminClient, type AdminClient } from '@server/supabase';
import { requireTutorAccess } from '@server/tutor/access';
import { handleImageCheck } from '@server/tutor/image';

/** Photo d'exercice : élève autorisé (consentement, caméra activée par le parent), puis modération. */
export async function POST(request: Request): Promise<Response> {
  let admin: AdminClient;
  try {
    admin = getAdminClient();
  } catch (error) {
    serverLog.error('config', error);
    return errorResponse('upstream');
  }
  const access = await requireTutorAccess(request, admin, 'image');
  if (!access.ok) return access.response;
  return handleImageCheck(request);
}
