import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  curso: string;
  idade: number | null;
  created_at?: string;
}

export type AlunoInput = Omit<Aluno, 'id' | 'created_at'>;
