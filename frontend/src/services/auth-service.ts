import { supabase } from '../lib/supabase'
import type { AuthError, Session, User } from '@supabase/supabase-js'
import { Database } from '../lib/supabase-types'

type UserProfile = Database['public']['Tables']['users']['Row']

export type AuthResponse = {
  user: User | null
  session: Session | null
  error: AuthError | null
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  userData: Partial<UserProfile>
): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          ...userData,
        })

      if (profileError) throw profileError
    }

    return {
      user: authData.user,
      session: authData.session,
      error: null,
    }
  } catch (error) {
    console.error('Error in signUp:', error)
    return {
      user: null,
      session: null,
      error: error as AuthError,
    }
  }
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return {
      user: data.user,
      session: data.session,
      error: null,
    }
  } catch (error) {
    console.error('Error in signIn:', error)
    return {
      user: null,
      session: null,
      error: error as AuthError,
    }
  }
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error in signOut:', error)
    return { error: error as AuthError }
  }
}

// Reset password
export async function resetPassword(
  email: string
): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error in resetPassword:', error)
    return { error: error as AuthError }
  }
}

// Update password
export async function updatePassword(
  newPassword: string
): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error in updatePassword:', error)
    return { error: error as AuthError }
  }
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error in getCurrentSession:', error)
    return null
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
} 