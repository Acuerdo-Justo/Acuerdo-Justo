import { supabase } from '../lib/supabase';

function getClient() {
  if (!supabase) {
    throw new Error('El acceso estará disponible cuando Supabase sea configurado.');
  }

  return supabase;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await getClient().auth.signOut();

  if (error) throw error;
}
