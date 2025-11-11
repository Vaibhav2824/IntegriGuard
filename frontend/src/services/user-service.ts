import { supabase } from '../lib/supabase'
import { Database } from '../lib/supabase-types'

type User = Database['public']['Tables']['users']['Row']

// Get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error(`Error fetching user profile for ID ${userId}:`, error)
    throw error
  }

  return data as User
}

// Create or update user profile
export async function upsertUserProfile(
  profile: Omit<User, 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting user profile:', error)
    throw error
  }

  return data as User
}

// Update user role
export async function updateUserRole(userId: string, role: User['role']) {
  const { data, error } = await supabase
    .from('users')
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating role for user ${userId}:`, error)
    throw error
  }

  return data as User
}

// Get all teachers
export async function getAllTeachers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'teacher')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching teachers:', error)
    throw error
  }

  return data as User[]
}

// Get all students
export async function getAllStudents() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching students:', error)
    throw error
  }

  return data as User[]
} 