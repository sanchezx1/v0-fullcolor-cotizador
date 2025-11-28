/**
 * Shared CORS Configuration for Edge Functions
 * Restricts access to known domains only
 *
 * @module cors
 */

/**
 * Lista de orígenes permitidos para CORS
 * - Producción: dominios oficiales de FullColor
 * - Desarrollo: localhost y preview de Vercel
 */
const ALLOWED_ORIGINS = [
  // Producción
  'https://fullcolor.com.ec',
  'https://www.fullcolor.com.ec',

  // Desarrollo local
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',

  // Preview deployments de Vercel (se configura via variable de entorno)
  Deno.env.get('VERCEL_URL') ? `https://${Deno.env.get('VERCEL_URL')}` : null,

  // Origen adicional configurable
  Deno.env.get('ALLOWED_ORIGIN'),
].filter(Boolean) as string[];

/**
 * Obtiene los headers CORS apropiados basados en el origen de la petición
 *
 * @param req - Request object
 * @returns Headers object with CORS configuration
 *
 * @example
 * ```ts
 * const headers = getCorsHeaders(req);
 * return new Response(JSON.stringify(data), { headers });
 * ```
 */
export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin');

  // Determinar el origen permitido
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]; // Fallback al primer origen permitido (producción)

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

/**
 * Verifica si un origen está permitido
 *
 * @param origin - Origin to check
 * @returns true if origin is allowed, false otherwise
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Maneja requests OPTIONS (preflight CORS)
 *
 * @param req - Request object
 * @returns Response for OPTIONS request
 *
 * @example
 * ```ts
 * if (req.method === 'OPTIONS') {
 *   return handleCorsPreflightmcp__supabase(req);
 * }
 * ```
 */
export function handleCorsPreflight(req: Request): Response {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}
