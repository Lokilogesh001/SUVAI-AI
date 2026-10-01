import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import RecipePage from "./pages/RecipePage";
import RecipeCategoryPage from "./pages/RecipeCategoryPage";
import ProfilePage from "./pages/ProfilePage";
import MealPlannerPage from "./pages/MealPlannerPage";
import GroceryPage from "./pages/GroceryPage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";
import ChatbotVisibilityGuard from "./components/ChatbotVisibilityGuard";

import SupabaseConnectionError from "./components/SupabaseConnectionError";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseConnectionError />
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <ChatbotVisibilityGuard />
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              {/* Public & Guest accessible routes */}
              <Route path="/" element={<Index />} />
              <Route path="/recipes" element={<RecipeCategoryPage />} />
              <Route path="/recipe/:id" element={<RecipePage />} />
              <Route path="/meal-planner" element={<MealPlannerPage />} />
              <Route path="/grocery" element={<GroceryPage />} />
              <Route path="/assistant" element={<Navigate to="/" replace />} />

              {/* Authentication routes */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route element={<ProtectedRoute requireAuth={false} />}>
                <Route path="/auth" element={<AuthPage />} />
              </Route>

              {/* Protected user routes */}
              <Route element={<ProtectedRoute requireAuth={true} />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
