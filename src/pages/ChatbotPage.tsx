import Navbar from "@/components/Navbar";
import RecipeChat from "@/components/RecipeChat";
import { ChefHat, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ChatbotPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-4xl mx-auto px-4 pt-24 pb-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Kitchen Companion</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Recipe & Cooking Assistant</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Input ingredients you have at home, request emergency substitutions, or customize recipes to match your dietary goals.
          </p>
        </div>

        <RecipeChat />
      </div>
    </div>
  );
};

export default ChatbotPage;
