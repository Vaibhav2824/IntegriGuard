import { useState } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase-types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

interface MutationState<T> {
  data: T | null;
  error: PostgrestError | null;
  isLoading: boolean;
}

interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: PostgrestError) => void;
}

export function useSupabaseMutation<
  TName extends TableName,
  TRow extends Tables[TName]['Row'],
  TInsert extends Tables[TName]['Insert'],
  TUpdate extends Tables[TName]['Update']
>(tableName: TName, options: MutationOptions<TRow> = {}) {
  const [state, setState] = useState<MutationState<TRow>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const insert = async (data: TInsert) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        setState({ data: null, error, isLoading: false });
        options.onError?.(error);
        throw error;
      }

      setState({ data: result, error: null, isLoading: false });
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const pgError = error as PostgrestError;
      setState({ data: null, error: pgError, isLoading: false });
      options.onError?.(pgError);
      throw error;
    }
  };

  const update = async (id: string, data: TUpdate) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setState({ data: null, error, isLoading: false });
        options.onError?.(error);
        throw error;
      }

      setState({ data: result, error: null, isLoading: false });
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const pgError = error as PostgrestError;
      setState({ data: null, error: pgError, isLoading: false });
      options.onError?.(pgError);
      throw error;
    }
  };

  const remove = async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setState({ data: null, error, isLoading: false });
        options.onError?.(error);
        throw error;
      }

      setState({ data: result, error: null, isLoading: false });
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const pgError = error as PostgrestError;
      setState({ data: null, error: pgError, isLoading: false });
      options.onError?.(pgError);
      throw error;
    }
  };

  return {
    ...state,
    insert,
    update,
    remove,
  };
} 