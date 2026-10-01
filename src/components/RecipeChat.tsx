
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/ChatMessage";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface RecipeChatProps {
  cuisineType?: string;
  dietType?: string;
}

const RecipeChat = ({ cuisineType = "all", dietType = "all" }: RecipeChatProps) => {
  const { t, currentLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      id: uuidv4(),
      role: "assistant",
      content: "Hi there! Tell me what ingredients you have, and I'll suggest personalized recipes for you. You can also specify if you're looking for a particular cuisine type or dietary preference.",
    }]);
  }, [currentLanguage]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [inputValue]);

  // Mock function to generate recipe based on ingredients
  const generateRecipe = async (ingredients: string, cuisine: string, diet: string) => {
    setIsLoading(true);
    
    // In a real implementation, this would make an API call to an AI service
    // Simulating network latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let cuisineInfo = cuisine !== "all" ? `for ${cuisine} cuisine` : "";
    let dietInfo = diet !== "all" ? `that is ${diet}` : "";
    
    const response = `Based on your ingredients (${ingredients}), ${cuisineInfo} ${dietInfo}, here's a recipe suggestion:

## ${cuisine !== "all" ? cuisine.charAt(0).toUpperCase() + cuisine.slice(1) : "Custom"} ${diet === "vegetarian" ? "Vegetarian" : diet === "non-vegetarian" ? "Non-Vegetarian" : ""} Dish

### Ingredients:
- ${ingredients}
- Salt and pepper to taste
- 2 tablespoons olive oil
${diet !== "vegetarian" ? "- 200g chicken or beef\n" : ""}
- 1 onion, diced
- 2 cloves garlic, minced
- Fresh herbs

### Instructions:
1. Heat olive oil in a pan over medium heat.
${diet !== "vegetarian" ? "2. Cook the meat until browned, about 5-7 minutes.\n" : ""}
2. Add onions and garlic, sauté until translucent.
3. Add your main ingredients and stir well.
4. Season with salt, pepper, and herbs.
5. Simmer for 15-20 minutes until everything is cooked through.
6. Serve hot and enjoy!

Would you like me to suggest alternative recipes or make any modifications to this one?`;
    
    setIsLoading(false);
    return response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    try {
      const response = await generateRecipe(inputValue, cuisineType, dietType);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating recipe:", error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I couldn't generate a recipe at this time. Please try again later.",
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm h-[600px] flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 mb-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form 
        onSubmit={handleSubmit} 
        className="border-t p-4 flex gap-2 items-end"
      >
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("assistant.ingredients")}
          className="min-h-10 resize-none"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="flex-shrink-0"
          disabled={isLoading || !inputValue.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default RecipeChat;
