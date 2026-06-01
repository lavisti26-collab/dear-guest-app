import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabaseUrl = typeof rawSupabaseUrl === 'string' ? rawSupabaseUrl.trim() : '';
const supabaseAnonKey = typeof rawSupabaseAnonKey === 'string' ? rawSupabaseAnonKey.trim() : '';

const isValidSupabaseUrl = (value: string) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const hasSupabaseConfig = isValidSupabaseUrl(supabaseUrl) && supabaseAnonKey.length > 0;

if (!hasSupabaseConfig) {
  console.error(
    '🚨 Supabase environment variables are missing or invalid! Check Netlify Dashboard Variable Configuration.'
  );
  if (supabaseUrl && !isValidSupabaseUrl(supabaseUrl)) {
    console.error(`🚨 VITE_SUPABASE_URL is invalid: ${supabaseUrl}`);
  }
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn('Using VITE_SUPABASE_PUBLISHABLE_KEY as fallback for VITE_SUPABASE_ANON_KEY. Consider renaming to VITE_SUPABASE_ANON_KEY.');
}

export const cloudUrl = hasSupabaseConfig ? supabaseUrl : '';

// Create the client only when configuration exists to avoid throwing at module import time.
// Some public pages should render with a graceful error message when Supabase isn't configured.
let _supabase: ReturnType<typeof createClient<Database>> | null = null;
if (hasSupabaseConfig) {
  try {
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error('🚨 Failed to initialize Supabase client.', error);
    _supabase = null;
  }
}

export const supabase = _supabase;
