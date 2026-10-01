import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile, UserPreferences } from "@/types/database";

export interface AuthUserData {
  id: string;
  email: string;
  name: string;
  country: string;
  avatar_url?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  country: string;
}

const assertSupabaseReady = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase connection failed. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured in .env."
    );
  }
};

export const authService = {
  /**
   * Restores active authenticated session from Supabase Auth
   */
  async getInitialSession(): Promise<AuthUserData | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    return {
      id: session.user.id,
      email: session.user.email || "",
      name:
        session.user.user_metadata?.name ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0] ||
        "Chef",
      country: session.user.user_metadata?.country || "US",
      avatar_url: session.user.user_metadata?.avatar_url,
    };
  },

  /**
   * Real Supabase Password Sign In
   */
  async signIn(email: string, password: string): Promise<AuthUserData> {
    assertSupabaseReady();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Unable to log in. Please try again.");
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      name:
        data.user.user_metadata?.name ||
        data.user.user_metadata?.full_name ||
        data.user.email?.split("@")[0] ||
        "Chef",
      country: data.user.user_metadata?.country || "US",
      avatar_url: data.user.user_metadata?.avatar_url,
    };
  },

  /**
   * Real Supabase User Registration (triggers profile & preferences creation)
   */
  async signUp(params: SignUpParams): Promise<AuthUserData> {
    assertSupabaseReady();

    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          name: params.name,
          full_name: params.name,
          country: params.country,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Registration failed. Please check your details.");
    }

    return {
      id: data.user.id,
      email: data.user.email || params.email,
      name: params.name,
      country: params.country,
      avatar_url: data.user.user_metadata?.avatar_url,
    };
  },

  /**
   * Real Supabase Google OAuth
   */
  async signInWithGoogle(redirectPath?: string): Promise<void> {
    assertSupabaseReady();

    const redirectUrl = redirectPath 
      ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Supabase Password Reset Request
   */
  async resetPassword(email: string): Promise<void> {
    assertSupabaseReady();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Supabase Sign Out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error.message);
      }
    }
  },

  /**
   * Fetch user profile from Supabase profiles table
   */
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch profile from Supabase:", error.message);
      throw new Error(`Failed to load profile from database: ${error.message}`);
    }

    return data;
  },

  /**
   * Fetch user preferences from Supabase user_preferences table
   */
  async fetchUserPreferences(userId: string): Promise<UserPreferences | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch user preferences from Supabase:", error.message);
      throw new Error(`Failed to load preferences from database: ${error.message}`);
    }

    return data;
  },

  /**
   * Persist user preferences to Supabase user_preferences table
   */
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    assertSupabaseReady();

    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error saving preferences to Supabase:", error.message);
      throw new Error(`Failed to save preferences to Supabase: ${error.message}`);
    }
  },

  /**
   * Update profile fields in Supabase profiles table
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    assertSupabaseReady();

    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile in Supabase:", error.message);
      throw new Error(`Failed to update profile in Supabase: ${error.message}`);
    }
  }
};
