import { useState, useRef, useEffect } from "react";
import { Send, ChefHat, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/ChatMessage";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  recipeAssistantService, 
  AssistantMessage 
} from "@/services/assistant/recipeAssistantService";
import { Recipe } from "@/types/recipe";

interface RecipeChatProps {
  cuisineType?: string;
  dietType?: string;
}

const RecipeChat = ({ cuisineType = "all", dietType = "all" }: RecipeChatProps) => {
  const { t } = useLanguage();
  const { preferences, profile } = useAuth();

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Hello! I am your **suvAI Culinary Assistant** 👨‍🍳\n\nTell me what ingredients you have in your kitchen (e.g. *"I have chicken, tomatoes, and rice"*), ask for quick substitutions (*"I don't have yogurt"*), or request meals that fit your diet.`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Dynamic textarea sizing
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [inputValue]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: AssistantMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const result = await recipeAssistantService.processMessage(
        text,
        messages,
        preferences,
        profile?.country
      );

      const assistantMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.response,
        suggestedRecipes: result.suggestedRecipes,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I had trouble processing that request. Please try listing your ingredients again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-2xl border bg-card shadow-sm h-[650px] flex flex-col overflow-hidden">
      {/* Messages View */}
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <ChatMessage message={message} />

              {/* Display Recipe Cards inside assistant stream */}
              {message.suggestedRecipes && message.suggestedRecipes.length > 0 && (
                <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {message.suggestedRecipes.map((recipe: Recipe) => (
                    <div
                      key={recipe.id}
                      className="flex gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-all group"
                    >
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-16 w-16 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <Link
                            to={`/recipe/${recipe.id}`}
                            className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1"
                          >
                            {recipe.title}
                          </Link>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {recipe.readyInMinutes}m
                            </span>
                            <span>&bull;</span>
                            <span>{recipe.cuisine}</span>
                          </div>
                        </div>

                        <Link
                          to={`/recipe/${recipe.id}`}
                          className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 mt-1 hover:underline"
                        >
                          View Recipe &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ChefHat className="h-4 w-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/50 border text-xs text-muted-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Crafting recipe recommendations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-muted/20 border-t flex items-center gap-2 overflow-x-auto hide-scrollbar text-xs">
        <span className="text-muted-foreground shrink-0 font-medium text-[11px]">Try asking:</span>
        <button
          type="button"
          onClick={() => handleSend("I have chicken, tomatoes, and rice")}
          className="px-2.5 py-1 rounded-full border bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 shrink-0 transition-colors"
        >
          🍗 "Chicken, tomatoes, and rice"
        </button>
        <button
          type="button"
          onClick={() => handleSend("What can I substitute for yogurt?")}
          className="px-2.5 py-1 rounded-full border bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 shrink-0 transition-colors"
        >
          🥛 "Substitute for yogurt"
        </button>
        <button
          type="button"
          onClick={() => handleSend("Quick meals under 20 minutes")}
          className="px-2.5 py-1 rounded-full border bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 shrink-0 transition-colors"
        >
          ⏱️ "Quick meals under 20 mins"
        </button>
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t bg-card flex gap-2 items-end"
      >
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask for recipe suggestions, substitutions, or enter ingredients..."
          className="min-h-10 resize-none rounded-xl"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl"
          disabled={isLoading || !inputValue.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default RecipeChat;
