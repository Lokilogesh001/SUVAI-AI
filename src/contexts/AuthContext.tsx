import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { authService, AuthUserData, SignUpParams } from "@/services/auth/authService";
import { UserProfile, UserPreferences } from "@/types/database";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  user: AuthUserData | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  signIn: (email: string, password: string, redirectPath?: string) => Promise<boolean>;
  signUp: (params: SignUpParams) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadUserData = useCallback(async (currentUserId: string, fallbackUser?: AuthUserData) => {
    try {
      const [fetchedProfile, fetchedPrefs] = await Promise.all([
        authService.fetchUserProfile(currentUserId),
        authService.fetchUserPreferences(currentUserId),
      ]);

      if (fetchedProfile) {
        setProfile(fetchedProfile);
      } else if (fallbackUser) {
        setProfile({
          id: fallbackUser.id,
          name: fallbackUser.name,
          country: fallbackUser.country,
          avatar_url: fallbackUser.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      if (fetchedPrefs) {
        setPreferences(fetchedPrefs);
      } else {
        // Default initial preference schema for new user
        setPreferences({
          user_id: currentUserId,
          diet: "all",
          favorite_cuisines: ["Italian", "Indian", "Mexican"],
          allergies: [],
          disliked_ingredients: [],
          preferred_cooking_time: "30-60",
          cooking_skill: "intermediate",
          calorie_preference: "moderate",
          spice_preference: "medium",
        });
      }
    } catch (err) {
      console.error("Error loading user profile or preferences from Supabase:", err);
    }
  }, []);

  // Initialize and restore active Supabase session
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        if (!isSupabaseConfigured) {
          setIsLoading(false);
          return;
        }

        const initialUser = await authService.getInitialSession();
        if (mounted && initialUser) {
          setUser(initialUser);
          await loadUserData(initialUser.id, initialUser);
        }
      } catch (err) {
        console.error("Session restoration error:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    // Listen to Supabase Auth state changes
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return;

          if (session?.user) {
            const authUser: AuthUserData = {
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
            setUser(authUser);
            await loadUserData(authUser.id, authUser);
          } else {
            setUser(null);
            setProfile(null);
            setPreferences(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string, redirectPath: string = "/"): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authUser = await authService.signIn(email, password);
      setUser(authUser);
      await loadUserData(authUser.id, authUser);
      toast.success("Welcome back!", {
        description: `Signed in as ${authUser.name || authUser.email}`,
      });
      navigate(redirectPath);
      return true;
    } catch (error: any) {
      console.error("Sign in failed:", error);
      toast.error("Sign in failed", {
        description: error.message || "Invalid email or password",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (params: SignUpParams): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authUser = await authService.signUp(params);
      setUser(authUser);
      await loadUserData(authUser.id, authUser);
      toast.success("Account created successfully!", {
        description: "Let's personalize your culinary experience.",
      });
      navigate("/onboarding");
      return true;
    } catch (error: any) {
      console.error("Sign up failed:", error);
      toast.error("Sign up failed", {
        description: error.message || "Could not complete registration",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await authService.signInWithGoogle();
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast.error("Google sign in failed", {
        description: error.message || "Could not authenticate with Google",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await authService.resetPassword(email);
      toast.success("Password reset email sent", {
        description: "Check your inbox for password reset instructions.",
      });
      return true;
    } catch (error: any) {
      toast.error("Password reset failed", {
        description: error.message || "Please check the email address and try again.",
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setPreferences(null);
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Error signing out");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id, user);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>): Promise<boolean> => {
    if (!user || !preferences) return false;
    try {
      const merged: UserPreferences = {
        ...preferences,
        ...updates,
        user_id: user.id,
      };
      await authService.saveUserPreferences(merged);
      setPreferences(merged);
      toast.success("Preferences updated", {
        description: "Recommendations have been refreshed based on your new preferences.",
      });
      return true;
    } catch (err: any) {
      toast.error("Failed to save preferences", { description: err.message });
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    try {
      await authService.updateUserProfile(user.id, updates);
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
      if (updates.name) {
        setUser({ ...user, name: updates.name });
      }
      toast.success("Profile updated");
      return true;
    } catch (err: any) {
      toast.error("Failed to update profile", { description: err.message });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        preferences,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        signOut,
        refreshProfile,
        updatePreferences,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
