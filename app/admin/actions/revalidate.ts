'use server'

import { revalidateCache } from '@/src/lib/data'
import { requireAdmin } from '@/src/lib/server-auth'

/**
 * Server action que revalida el cache del dashboard de productos.
 *
 * IMPORTANTE: Esta acción requiere permisos de administrador.
 * Solo usuarios con rol 'admin' pueden ejecutar esta función.
 *
 * @throws {AuthError} Si el usuario no está autenticado
 * @throws {AuthorizationError} Si el usuario no tiene rol de admin
 */
export async function triggerDashboardRevalidation() {
  // Validar que el usuario es admin antes de permitir la operación
  await requireAdmin()

  // Ejecutar la revalidación del cache
  await revalidateCache()

  return {
    success: true,
    message: 'Cache revalidated successfully',
    timestamp: new Date().toISOString()
  }
}
