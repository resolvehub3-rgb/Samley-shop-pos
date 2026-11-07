import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

// Initialize client if credentials exist, otherwise null
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export interface ConnectionStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
  message: string;
}

export function getSupabaseStatus(): ConnectionStatus {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    url: supabaseUrl || 'Not configured in environment',
    hasAnonKey: Boolean(supabaseAnonKey && supabaseAnonKey !== 'your-anon-key'),
    message: configured
      ? 'Connected to configured Supabase project'
      : 'Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to connect real PostgreSQL & Auth.',
  };
}
