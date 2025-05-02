import { createClient } from '@supabase/supabase-js';

// ✅ Frontend (client) tarafında sadece NEXT_PUBLIC_ olanlara erişilebilir
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl) throw new Error('❌ Missing SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('❌ Missing SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
