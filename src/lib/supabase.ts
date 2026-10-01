
import { createClient } from "@supabase/supabase-js";

// This would ideally be in environment variables, but for demo purposes we'll define here
const supabaseUrl = "https://your-supabase-project-url.supabase.co";
const supabaseAnonKey = "your-supabase-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
