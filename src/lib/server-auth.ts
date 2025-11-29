/**
 * Server-side authentication utilities for validating admin access
 *
 * Este módulo proporciona funciones helper para validar autenticación y
 * autorización de usuarios en server actions y API routes de Next.js.
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Error personalizado para problemas de autenticación
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = "AuthError"
  }
}

/**
 * Error personalizado para problemas de autorización
 */
export class AuthorizationError extends Error {
  constructor(
    message: string = "Not authorized",
    public statusCode: number = 403
  ) {
    super(message)
    this.name = "AuthorizationError"
  }
}

/**
 * Tipo de retorno para requireAdmin
 */
export interface AdminAuthResult {
  user: {
    id: string
    email?: string
  }
  supabase: ReturnType<typeof createServerClient>
}

/**
 * Valida que el usuario actual esté autenticado y tenga rol de admin.
 *
 * Esta función debe ser llamada al inicio de cualquier server action o
 * API route que requiera permisos de administrador.
 *
 * @throws {AuthError} Si el usuario no está autenticado
 * @throws {AuthorizationError} Si el usuario no tiene rol de admin
 * @returns {Promise<AdminAuthResult>} Objeto con datos del usuario y cliente de Supabase
 *
 * @example
 * ```typescript
 * 'use server'
 *
 * export async function deleteProduct(id: string) {
 *   const { user, supabase } = await requireAdmin()
 *
 *   // El código aquí solo se ejecuta si el usuario es admin
 *   await supabase.from('productos').delete().eq('id', id)
 * }
 * ```
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  // Obtener cookies del request
  const cookieStore = await cookies()

  // Crear cliente de Supabase para server-side
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Verificar que el usuario esté autenticado
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthError("Not authenticated - please log in")
  }

  // Verificar que el usuario tenga rol de admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError) {
    throw new AuthError("Failed to verify user permissions")
  }

  if (profile?.role !== "admin") {
    throw new AuthorizationError("Admin role required")
  }

  // Retornar usuario y cliente de Supabase para uso posterior
  return {
    user: {
      id: user.id,
      email: user.email,
    },
    supabase,
  }
}

/**
 * Valida que el usuario actual esté autenticado (sin verificar rol).
 *
 * Útil para endpoints que requieren autenticación pero no necesariamente
 * permisos de administrador.
 *
 * @throws {AuthError} Si el usuario no está autenticado
 * @returns {Promise<AdminAuthResult>} Objeto con datos del usuario y cliente de Supabase
 */
export async function requireAuth(): Promise<AdminAuthResult> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthError("Not authenticated - please log in")
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    supabase,
  }
}
