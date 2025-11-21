'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/src/services/supabaseClient"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthState {
  status: AuthStatus
  user: User | null
  session: Session | null
  role: string | null
}

async function getProfileRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.warn("Error obteniendo rol de perfil:", error)
    return null
  }

  return data?.role ?? null
}

export function useAuthSession() {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
    session: null,
    role: null,
  })

  const loadSession = useCallback(async (initialSession?: Session | null) => {
    try {
      const sessionResult = initialSession
        ? { data: { session: initialSession }, error: null }
        : await supabase.auth.getSession()

      if (sessionResult.error) {
        console.warn("Error obteniendo sesion:", sessionResult.error)
        await supabase.auth.signOut().catch(() => undefined)
        setState({
          status: "unauthenticated",
          user: null,
          session: null,
          role: null,
        })
        return
      }

      const sessionToUse = sessionResult.data.session

      if (!sessionToUse?.user) {
        setState({
          status: "unauthenticated",
          user: null,
          session: null,
          role: null,
        })
        return
      }

      const role = await getProfileRole(sessionToUse.user.id)

      setState({
        status: "authenticated",
        user: sessionToUse.user,
        session: sessionToUse,
        role,
      })
    } catch (error) {
      console.error("No pudimos cargar la sesion activa:", error)
      await supabase.auth.signOut().catch(() => undefined)
      setState({
        status: "unauthenticated",
        user: null,
        session: null,
        role: null,
      })
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const hydrate = async () => {
      if (!isMounted) return
      await loadSession()
    }

    hydrate()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      if (session?.user) {
        loadSession(session)
      } else {
        setState({
          status: "unauthenticated",
          user: null,
          session: null,
          role: null,
        })
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [loadSession])

  const isAuthenticated = useMemo(() => state.status === "authenticated" && !!state.user, [state])
  const isAdmin = useMemo(() => state.role === "admin", [state.role])

  return {
    ...state,
    isAuthenticated,
    isAdmin,
    refresh: loadSession,
  }
}
