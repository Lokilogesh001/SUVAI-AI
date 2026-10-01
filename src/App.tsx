
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import RecipePage from "./pages/RecipePage";
import RecipeCategoryPage from "./pages/RecipeCategoryPage";
import ProfilePage from "./pages/ProfilePage";
import MealPlannerPage from "./pages/MealPlannerPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route element={<ProtectedRoute requireAuth={false} />}>
                <Route path="/auth" element={<AuthPage />} />
              </Route>
              
              {/* Routes accessible to both authenticated and unauthenticated users */}
              <Route path="/" element={<Index />} />
              <Route path="/recipe/:id" element={<RecipePage />} />
              <Route path="/recipes" element={<RecipeCategoryPage />} />
              <Route path="/meal-planner" element={<MealPlannerPage />} />
              
              {/* Protected routes (require authentication) */}
              <Route element={<ProtectedRoute requireAuth={true} />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
