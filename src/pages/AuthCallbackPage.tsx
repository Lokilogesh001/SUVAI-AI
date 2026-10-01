import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ChefHat, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Handles OAuth return from Supabase Auth (e.g. Google sign-in)
 */
export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, preferences, refreshProfile } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // Supabase JS client parses hash tokens / code parameters automatically
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          // Refresh profile and preferences from the database
          await refreshProfile();

          // Get return destination
          const redirectParam = searchParams.get("redirect");
          
          // Check if onboarding is completed
          const hasSelectedCuisines = 
            preferences?.favorite_cuisines && 
            preferences.favorite_cuisines.length > 0;

          if (isMounted) {
            if (redirectParam && redirectParam !== "/auth") {
              navigate(redirectParam, { replace: true });
            } else if (!hasSelectedCuisines) {
              navigate("/onboarding", { replace: true });
            } else {
              navigate("/", { replace: true });
            }
          }
        } else {
          // If no session yet, wait briefly for Supabase onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              if (currentSession?.user && isMounted) {
                await refreshProfile();
                const redirectParam = searchParams.get("redirect");
                if (redirectParam && redirectParam !== "/auth") {
                  navigate(redirectParam, { replace: true });
                } else {
                  navigate("/", { replace: true });
                }
              }
            }
          );

          // Timeout fallback in case of failed/cancelled OAuth
          const timer = setTimeout(() => {
            if (isMounted && !user) {
              setErrorMessage("Could not finalize your session. Please try signing in again.");
            }
          }, 6000);

          return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
          };
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        if (isMounted) {
          setErrorMessage(err.message || "Authentication callback encountered an error.");
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, searchParams, refreshProfile, user, preferences]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Authentication Notice</h2>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Button onClick={() => navigate("/auth", { replace: true })} className="w-full">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <ChefHat className="h-6 w-6" />
        </div>
        <span className="text-3xl font-extrabold tracking-tight">
          suv<span className="text-primary">AI</span>
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Connecting your account...</h2>
        <p className="text-xs text-muted-foreground max-w-xs">
          Finalizing secure authentication and loading your personalized culinary preferences.
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
