import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function TestConnection() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function checkConnection() {
      try {
        // Try to fetch the server timestamp
        const { data, error } = await supabase
          .from('users')
          .select('count()', { count: 'exact' });

        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
          console.error('Connection error:', error);
        } else {
          setStatus('connected');
          console.log('Connection successful!', data);
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Connection error:', err);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Status</h2>
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            status === 'checking'
              ? 'bg-yellow-500'
              : status === 'connected'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}
        />
        <span>
          {status === 'checking'
            ? 'Checking connection...'
            : status === 'connected'
            ? 'Connected to Supabase!'
            : 'Connection Error'}
        </span>
      </div>
      {status === 'error' && (
        <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>
      )}
      {status === 'connected' && (
        <p className="mt-2 text-green-700 text-sm">
          ✓ Successfully connected to your Supabase project
        </p>
      )}
    </div>
  );
} 