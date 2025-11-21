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
