import { useEffect, useState } from 'react';
import { PostgrestError, PostgrestFilterBuilder } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase-types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

interface QueryState<T> {
  data: T[] | null;
  error: PostgrestError | null;
  isLoading: boolean;
}

interface QueryOptions<T> {
  select?: string;
  filter?: (query: PostgrestFilterBuilder<Database, T>) => PostgrestFilterBuilder<Database, T>;
  enabled?: boolean;
}

export function useSupabaseQuery<
  TName extends TableName,
  TRow extends Tables[TName]['Row']
>(tableName: TName, options: QueryOptions<TRow> = {}) {
  const [state, setState] = useState<QueryState<TRow>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const { select = '*', filter, enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let query = supabase.from(tableName).select(select);

    if (filter) {
      query = filter(query);
    }

    const fetchData = async () => {
      try {
        const { data, error } = await query;

        if (error) {
          setState({ data: null, error, isLoading: false });
          return;
        }

        setState({ data, error: null, isLoading: false });
      } catch (error) {
        const pgError = error as PostgrestError;
        setState({ data: null, error: pgError, isLoading: false });
      }
    };

    void fetchData();
  }, [tableName, select, filter, enabled]);

  const refetch = async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true }));
    let query = supabase.from(tableName).select(select);

    if (filter) {
      query = filter(query);
    }

    try {
      const { data, error } = await query;

      if (error) {
        setState({ data: null, error, isLoading: false });
        return;
      }

      setState({ data, error: null, isLoading: false });
    } catch (error) {
      const pgError = error as PostgrestError;
      setState({ data: null, error: pgError, isLoading: false });
    }
  };

  return {
    ...state,
    refetch,
  };
} 