
import { useState } from "react";
import Navbar from "@/components/Navbar";
import RecipeChat from "@/components/RecipeChat";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const ChatbotPage = () => {
  const { t } = useLanguage();
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [dietType, setDietType] = useState("all");

  const cuisines = [
    { name: t("assistant.all"), value: "all" },
    { name: "Italian", value: "italian" },
    { name: "Indian", value: "indian" },
    { name: "Chinese", value: "chinese" },
    { name: "Mexican", value: "mexican" },
    { name: "Thai", value: "thai" },
    { name: "Mediterranean", value: "mediterranean" },
    { name: "Japanese", value: "japanese" },
    { name: "French", value: "french" },
    { name: "American", value: "american" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("assistant.title")}</h1>
          <p className="text-muted-foreground">
            {t("assistant.subtitle")}
          </p>
          <Separator className="my-6" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("assistant.cuisine")}</label>
            <Select 
              value={selectedCuisine} 
              onValueChange={setSelectedCuisine}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("assistant.cuisine")} />
              </SelectTrigger>
              <SelectContent>
                {cuisines.map((cuisine) => (
                  <SelectItem key={cuisine.value} value={cuisine.value}>
                    {cuisine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("assistant.diet")}</label>
            <div className="flex gap-2">
              <Button 
                variant={dietType === "all" ? "default" : "outline"} 
                onClick={() => setDietType("all")}
                className="flex-1"
              >
                {t("assistant.all")}
              </Button>
              <Button 
                variant={dietType === "vegetarian" ? "default" : "outline"} 
                onClick={() => setDietType("vegetarian")}
                className="flex-1"
              >
                {t("assistant.vegetarian")}
              </Button>
              <Button 
                variant={dietType === "non-vegetarian" ? "default" : "outline"} 
                onClick={() => setDietType("non-vegetarian")}
                className="flex-1"
              >
                {t("assistant.nonvegetarian")}
              </Button>
            </div>
          </div>
        </div>
        
        <RecipeChat cuisineType={selectedCuisine} dietType={dietType} />
      </div>
    </div>
  );
};

export default ChatbotPage;
