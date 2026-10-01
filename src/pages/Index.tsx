import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FeaturedRecipes from "@/components/FeaturedRecipes";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const Index = () => {
  const { t } = useLanguage();
  
  const categories = [
    { id: "all", name: t("recipes.category.all") },
    { id: "breakfast", name: t("recipes.category.breakfast") },
    { id: "lunch", name: t("recipes.category.lunch") },
    { id: "dinner", name: t("recipes.category.dinner") },
    { id: "desserts", name: t("recipes.category.desserts") },
    { id: "vegetarian", name: t("recipes.category.vegetarian") },
    { id: "vegan", name: t("recipes.category.vegan") },
    { id: "gluten-free", name: t("recipes.category.glutenfree") },
    { id: "keto", name: t("recipes.category.keto") },
    { id: "quick", name: t("recipes.category.quick") },
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > window.innerHeight * 0.5) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToRecipes = () => {
    const recipesSection = document.getElementById("recipes");
    recipesSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    
    if (categoryId === activeCategory) {
      toast.info(`Refreshing ${category?.name || 'recipes'}`, {
        duration: 2000
      });
    } else {
      setActiveCategory(categoryId);
      toast.success(`Showing ${category?.name || 'recipes'}`, {
        description: "Loading new recipes...",
        duration: 3000
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=2000"
            alt="Beautiful plated food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        
        <div 
          className={`container relative z-10 px-4 max-w-4xl text-center transform transition-all duration-1000 ${
            isHeaderVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <Badge 
            variant="outline" 
            className="mb-4 py-1.5 px-6 bg-white/10 backdrop-blur text-white border-white/20 text-sm font-medium mx-auto"
          >
            {t("hero.badge")}
          </Badge>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t("hero.title").split("AI").map((part, i, arr) => 
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}<span className="text-gradient bg-gradient-to-r from-blue-400 to-violet-400">AI</span>
                </span>
              ) : part
            )}
          </h1>
          
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full font-medium">
              <Sparkles className="mr-2 h-5 w-5" />
              {t("hero.button.start")}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full bg-white/10 text-white border-white/20 backdrop-blur hover:bg-white/20 font-medium"
              onClick={scrollToRecipes}
            >
              {t("hero.button.recipes")}
              <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <section id="recipes" className="section-padding bg-secondary/30 py-16">
        <div className="content-grid">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 animate-fade-in">
            <div>
              <Badge className="mb-2" variant="outline">
                {t("recipes.badge")}
              </Badge>
              <h2 className="text-3xl font-bold">{t("recipes.title")}</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {t("recipes.subtitle")}
              </p>
            </div>
            
            <Button variant="ghost" className="mt-4 md:mt-0">
              {t("recipes.button.all")}
            </Button>
          </div>
          
          <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar animate-fade-in">
            <div className="flex gap-2">
              {categories.map((category) => {
                let icon = null;
                let extraClasses = "";
                
                if (category.id === "vegetarian") extraClasses = "bg-green-100 border-green-200 text-green-800";
                if (category.id === "vegan") extraClasses = "bg-emerald-100 border-emerald-200 text-emerald-800";
                
                return (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    className={`rounded-full whitespace-nowrap ${
                      activeCategory !== category.id && extraClasses ? extraClasses : ""
                    }`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {icon}
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <FeaturedRecipes category={activeCategory} />
        </div>
      </section>
      
      <section className="section-padding bg-background py-12">
        <div className="content-grid">
          <div className="bg-gradient-to-r from-primary/90 to-primary rounded-2xl p-8 md:p-12 text-white relative overflow-hidden animate-scale-in">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mb-6">
                {t("cta.subtitle")}
              </p>
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 hover:text-primary rounded-full font-medium"
              >
                {t("cta.button")}
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="py-12 border-t">
        <div className="content-grid">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <ChefHat className="h-8 w-8" />
              <span className="text-2xl font-semibold text-gradient">{t("app.name")}</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-default">
                {t("footer.about")}
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-default">
                {t("footer.features")}
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-default">
                {t("footer.recipes")}
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-default">
                {t("footer.contact")}
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-default">
                {t("footer.privacy")}
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-default">
                {t("footer.terms")}
              </a>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} {t("app.name")}. {t("footer.rights")}.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
