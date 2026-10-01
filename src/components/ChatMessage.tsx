
import { ChefHat, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { t } = useLanguage();
  const isUser = message.role === "user";
  
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[80%] md:max-w-[70%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } gap-3`}
      >
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <ChefHat className="h-4 w-4" />}
        </div>

        <div
          className={`rounded-lg p-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card"
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
