import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabasePublishableKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabasePublishableKey && 
  !supabasePublishableKey.includes("YOUR_KEY_HERE") &&
  !supabasePublishableKey.includes("YOUR_SUPABASE_PUBLISHABLE_KEY") &&
  !supabasePublishableKey.includes("your_supabase_publishable_anon_key")
);

export const supabaseConfigError: string | null = !isSupabaseConfigured
  ? "Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file."
  : null;

// Clean Vite-compatible browser client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://fgdhnuzpllustcprsxdb.supabase.co",
  supabasePublishableKey || "placeholder-publishable-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
