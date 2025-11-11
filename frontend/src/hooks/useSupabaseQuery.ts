import { useEffect, useState } from 'react'
import { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type QueryOptions<T> = {
  table: string
  columns?: string
  filter?: {
    column: string
    operator: string
    value: any
  }[]
  orderBy?: {
    column: string
    ascending?: boolean
  }
  limit?: number
  single?: boolean
  enabled?: boolean
}

export function useSupabaseQuery<T>({
  table,
  columns = '*',
  filter = [],
  orderBy,
  limit,
  single = false,
  enabled = true,
}: QueryOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        setLoading(true)
        
        // Start building the query
        let query = supabase.from(table).select(columns)
        
        // Apply filters
        filter.forEach(({ column, operator, value }) => {
          switch (operator) {
            case 'eq':
              query = query.eq(column, value)
              break
            case 'neq':
              query = query.neq(column, value)
              break
            case 'gt':
              query = query.gt(column, value)
              break
            case 'lt':
              query = query.lt(column, value)
              break
            case 'gte':
              query = query.gte(column, value)
              break
            case 'lte':
              query = query.lte(column, value)
              break
            case 'like':
              query = query.like(column, value)
              break
            case 'ilike':
              query = query.ilike(column, value)
              break
            case 'in':
              query = query.in(column, value)
              break
            default:
              query = query.eq(column, value)
          }
        })
        
        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
        }
        
        // Apply limit
        if (limit) {
          query = query.limit(limit)
        }
        
        // Execute the query
        const { data, error } = single
          ? await query.single()
          : await query
        
        if (error) {
          setError(error)
          setData(null)
        } else {
          setData(data as T)
          setError(null)
        }
      } catch (err) {
        console.error('Error in useSupabaseQuery:', err)
        setError(err as PostgrestError)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [table, columns, JSON.stringify(filter), orderBy?.column, orderBy?.ascending, limit, single, enabled])

  return { data, error, loading }
} 