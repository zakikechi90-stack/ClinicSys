"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  profile: Tables<"profiles"> | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      setState((prev) => ({ ...prev, error: error.message, loading: false }))
      return null
    }
    return data
  }, [supabase])

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const profile = await fetchProfile(user.id)
        if (profile && !profile.is_active) {
          await supabase.auth.signOut()
          setState({ user: null, profile: null, loading: false, error: "Votre compte a été désactivé par l'administrateur" })
        } else {
          setState({ user, profile, loading: false, error: null })
        }
      } else {
        setState({ user: null, profile: null, loading: false, error: null })
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (profile && !profile.is_active) {
            await supabase.auth.signOut()
            setState({ user: null, profile: null, loading: false, error: "Votre compte a été désactivé par l'administrateur" })
          } else {
            setState({ user: session.user, profile, loading: false, error: null })
          }
        } else if (event === "SIGNED_OUT") {
          setState({ user: null, profile: null, loading: false, error: null })
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (profile && !profile.is_active) {
            await supabase.auth.signOut()
            setState({ user: null, profile: null, loading: false, error: "Votre compte a été désactivé par l'administrateur" })
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      throw error
    }

    const profile = await fetchProfile(data.user.id)
    if (profile && !profile.is_active) {
      await supabase.auth.signOut()
      const errorMsg = "Votre compte a été désactivé par l'administrateur"
      setState({ user: null, profile: null, loading: false, error: errorMsg })
      throw new Error(errorMsg)
    }
    setState({ user: data.user, profile, loading: false, error: null })
    return { user: data.user, profile }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setState({ user: null, profile: null, loading: false, error: null })
  }

  return {
    ...state,
    signIn,
    signOut,
    isAdmin: state.profile?.role === "admin",
    isDoctor: state.profile?.role === "doctor",
    isNurse: state.profile?.role === "nurse",
    isReception: state.profile?.role === "reception",
    isChef: state.profile?.role === "chef",
  }
}
