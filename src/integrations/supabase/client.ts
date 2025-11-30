import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rkypiocczfhoawzpufui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreXBpb2NjemZob2F3enB1ZnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDM2NTMsImV4cCI6MjA4MDAxOTY1M30.3R9KW-Eh1nGVsYjUIKffJGw7ZCqT9uW9qXZL_vWvZZ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
