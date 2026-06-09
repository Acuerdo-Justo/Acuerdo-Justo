import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = typeof supabaseUrl === 'string' && typeof supabaseAnonKey === 'string';

export const supabase =
  typeof supabaseUrl === 'string' && typeof supabaseAnonKey === 'string'
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
