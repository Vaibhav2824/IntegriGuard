import { useState } from 'react'
import { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type MutationOptions = {
  table: string
  onSuccess?: (data: any) => void
  onError?: (error: PostgrestError) => void
}

export function useSupabaseMutation({ table, onSuccess, onError }: MutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<PostgrestError | null>(null)

  // Insert a new record
  const insert = async <T>(data: T, options?: { returning?: 'minimal' | 'representation' }) => {
    try {
      setLoading(true)
      setError(null)

      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select(options?.returning === 'representation' ? '*' : undefined)

      if (error) {
        setError(error)
        onError?.(error)
        return { data: null, error }
      }

      onSuccess?.(result)
      return { data: result, error: null }
    } catch (err) {
      const error = err as PostgrestError
      setError(error)
      onError?.(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Update a record
  const update = async <T>(
    data: Partial<T>,
    filter: { column: string; value: any },
    options?: { returning?: 'minimal' | 'representation' }
  ) => {
    try {
      setLoading(true)
      setError(null)

      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq(filter.column, filter.value)
        .select(options?.returning === 'representation' ? '*' : undefined)

      if (error) {
        setError(error)
        onError?.(error)
        return { data: null, error }
      }

      onSuccess?.(result)
      return { data: result, error: null }
    } catch (err) {
      const error = err as PostgrestError
      setError(error)
      onError?.(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Upsert a record (insert if not exists, update if exists)
  const upsert = async <T>(
    data: T,
    options?: { returning?: 'minimal' | 'representation' }
  ) => {
    try {
      setLoading(true)
      setError(null)

      const { data: result, error } = await supabase
        .from(table)
        .upsert(data)
        .select(options?.returning === 'representation' ? '*' : undefined)

      if (error) {
        setError(error)
        onError?.(error)
        return { data: null, error }
      }

      onSuccess?.(result)
      return { data: result, error: null }
    } catch (err) {
      const error = err as PostgrestError
      setError(error)
      onError?.(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Delete a record
  const remove = async (
    filter: { column: string; value: any },
    options?: { returning?: 'minimal' | 'representation' }
  ) => {
    try {
      setLoading(true)
      setError(null)

      const { data: result, error } = await supabase
        .from(table)
        .delete()
        .eq(filter.column, filter.value)
        .select(options?.returning === 'representation' ? '*' : undefined)

      if (error) {
        setError(error)
        onError?.(error)
        return { data: null, error }
      }

      onSuccess?.(result)
      return { data: result, error: null }
    } catch (err) {
      const error = err as PostgrestError
      setError(error)
      onError?.(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  return {
    insert,
    update,
    upsert,
    remove,
    loading,
    error,
  }
} 