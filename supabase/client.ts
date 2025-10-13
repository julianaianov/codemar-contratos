import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Cliente para operações administrativas (com service key)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey)
  : supabase;
