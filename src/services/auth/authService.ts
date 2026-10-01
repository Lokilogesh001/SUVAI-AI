import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile, UserPreferences } from "@/types/database";

const LOCAL_USER_KEY = "suvai_local_user";
const LOCAL_PROFILE_KEY = "suvai_local_profile";
const LOCAL_PREFS_KEY = "suvai_local_preferences";

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

export const authService = {
  async getInitialSession() {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      return stored ? (JSON.parse(stored) as AuthUserData) : null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    return {
      id: session.user.id,
      email: session.user.email || "",
      name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Chef",
      country: session.user.user_metadata?.country || "US",
      avatar_url: session.user.user_metadata?.avatar_url,
    };
  },

  async signIn(email: string, password: string): Promise<AuthUserData> {
    if (!isSupabaseConfigured) {
      // Local demo mode authentication
      const existing = localStorage.getItem(LOCAL_PROFILE_KEY);
      const profile = existing ? JSON.parse(existing) : null;
      
      const user: AuthUserData = {
        id: profile?.id || "demo-user-id",
        email,
        name: profile?.name || email.split("@")[0],
        country: profile?.country || "US",
        avatar_url: profile?.avatar_url,
      };

      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      return user;
    }

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
      name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Chef",
      country: data.user.user_metadata?.country || "US",
      avatar_url: data.user.user_metadata?.avatar_url,
    };
  },

  async signUp(params: SignUpParams): Promise<AuthUserData> {
    if (!isSupabaseConfigured) {
      const user: AuthUserData = {
        id: "user-" + Date.now(),
        email: params.email,
        name: params.name,
        country: params.country,
      };

      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify({
        id: user.id,
        name: user.name,
        country: user.country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      return user;
    }

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

  async signInWithGoogle(): Promise<void> {
    if (!isSupabaseConfigured) {
      const user: AuthUserData = {
        id: "google-demo-user",
        email: "google.user@example.com",
        name: "Google Explorer",
        country: "US",
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth",
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(email: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth?reset=true",
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(LOCAL_USER_KEY);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) {
      const local = localStorage.getItem(LOCAL_PROFILE_KEY);
      return local ? JSON.parse(local) : null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Could not fetch profile from Supabase:", error.message);
      return null;
    }

    return data;
  },

  async fetchUserPreferences(userId: string): Promise<UserPreferences | null> {
    if (!isSupabaseConfigured) {
      const local = localStorage.getItem(LOCAL_PREFS_KEY);
      return local ? JSON.parse(local) : null;
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Could not fetch user preferences from Supabase:", error.message);
      return null;
    }

    return data;
  },

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(preferences));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn("Error saving preferences to Supabase:", error.message);
      }
    }
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        console.warn("Error updating profile in Supabase:", error.message);
      }
    }

    const existing = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify({ ...parsed, ...updates }));
    }
  }
};
