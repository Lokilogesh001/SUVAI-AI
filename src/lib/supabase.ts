import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Detect if real Supabase credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("your-supabase-project-url") &&
  !supabaseAnonKey.includes("your-supabase-anon-key")
);

// Fallback dummy URL/key for build and unconfigured environments so createClient does not throw
const validUrl = isSupabaseConfigured ? supabaseUrl : "https://dummyproject.supabase.co";
const validKey = isSupabaseConfigured ? supabaseAnonKey : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummyKeyForDevelopmentOnly";

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
