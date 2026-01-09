"use client"

import { supabase } from "@/src/services/supabaseClient"
export { supabase }

export async function signIn(email: string, password: string) {
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, fullName?: string, redirectTo?: string) {
  const emailRedirectTo =
    redirectTo ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/mi-cuenta`
      : undefined)

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: fullName ? { full_name: fullName } : undefined,
    },
  })

  if (error) throw error

  // Detectar si el email ya existe
  // Cuando un email ya está registrado, Supabase retorna user pero identities está vacío
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    const duplicateError = new Error('Este correo ya está registrado. Por favor inicia sesión o usa otro correo.')
    duplicateError.name = 'UserAlreadyExists'
    throw duplicateError
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Envía un email de recuperación de contraseña
 * @param email - Email del usuario
 * @param redirectTo - URL a donde redirigir después del reset (opcional)
 */
export async function resetPasswordForEmail(email: string, redirectTo?: string) {
  const redirectUrl =
    redirectTo ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/auth/reset-password`
      : undefined)

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  if (error) throw error
  return data
}

/**
 * Actualiza la contraseña del usuario autenticado
 * @param newPassword - Nueva contraseña
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}
