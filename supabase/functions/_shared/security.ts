import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, ...rest] = authHeader.trim().split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') {
    return null;
  }
  const token = rest.join(' ').trim();
  return token.length > 0 ? token : null;
}

export type PrivilegedContext =
  | { type: 'service' }
  | { type: 'admin'; userId: string };

type RequirePrivilegedAccessParams = {
  req: Request;
  supabase: SupabaseClient<any, 'public', any>;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceKey: string | null;
};

export async function requirePrivilegedAccess({
  req,
  supabase,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceKey
}: RequirePrivilegedAccessParams): Promise<PrivilegedContext> {
  const authHeader = req.headers.get('Authorization');
  const parsedToken = extractBearerToken(authHeader);

  if (!parsedToken) {
    throw new HttpError(401, 'Solicitud no autorizada');
  }

  if (supabaseServiceKey && parsedToken === supabaseServiceKey) {
    return { type: 'service' };
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new HttpError(500, 'Configuración de Supabase incompleta');
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${parsedToken}`
      }
    }
  });

  const {
    data: userData,
    error: userError
  } = await authClient.auth.getUser();

  if (userError || !userData?.user) {
    throw new HttpError(401, 'Sesión inválida');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    throw new HttpError(403, 'Acceso restringido');
  }

  return { type: 'admin', userId: userData.user.id };
}
