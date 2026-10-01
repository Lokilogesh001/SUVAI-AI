import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Search, 
  Clock, 
  ChefHat, 
  ArrowRight, 
  Flame, 
  Plus, 
  X, 
  Compass, 
  ShieldCheck 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { recommendationEngine } from "@/services/recommendation/recommendationEngine";
import { recipeService } from "@/services/recipes/recipeService";
import { userDataService } from "@/services/userDataService";
import { RecommendedRecipe, Recipe } from "@/types/recipe";

const POPULAR_CUISINES = [
  { name: "Indian", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", count: "Spiced & Aromatic" },
  { name: "Italian", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", count: "Artisan & Rustic" },
  { name: "Mexican", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", count: "Bold & Vibrant" },
  { name: "Thai", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", count: "Sweet & Fiery" },
  { name: "Japanese", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", count: "Umami & Pure" },
  { name: "Mediterranean", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", count: "Fresh & Heart-Healthy" },
];

const QUICK_PROMPTS = [
  "Chicken and rice",
  "Quick vegetarian dinner",
  "Something spicy",
  "High protein pasta",
  "Under 20 minutes",
];

const Index = () => {
  const { t } = useLanguage();
  const { user, preferences, profile } = useAuth();
  const navigate = useNavigate();

  // Search input
  const [searchQuery, setSearchQuery] = useState("");

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedRecipe[]>([]);
  const [quickMeals, setQuickMeals] = useState<Recipe[]>([]);
  const [trending, setTrending] = useState<Recipe[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  // Pantry "Cook with what you have"
  const [pantryIngredients, setPantryIngredients] = useState<string[]>(["Chicken", "Tomato", "Garlic"]);
  const [newIngredient, setNewIngredient] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDiscoveryData = async () => {
      setIsLoadingRecs(true);
      try {
        // 1. Fetch user interactions for behavior-aware scoring
        const interactions = user ? await userDataService.getInteractions(user.id) : [];

        // 2. Run hybrid recommendation engine
        const recs = await recommendationEngine.getRecommendations({
          userId: user?.id,
          country: profile?.country || "IN",
          preferences,
          interactions,
          availableIngredients: pantryIngredients,
          limit: 6,
        });

        // 3. Quick meals (under 30 minutes)
        const allRecipes = recipeService.getAllSeedRecipes();
        const quick = allRecipes.filter((r) => r.readyInMinutes <= 25).slice(0, 4);

        // 4. Discovery / Trending (diversified recipes)
        const trend = allRecipes.filter((r) => !recs.some((rc) => rc.id === r.id)).slice(0, 4);

        if (mounted) {
          setRecommendations(recs);
          setQuickMeals(quick);
          setTrending(trend.length > 0 ? trend : allRecipes.slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading homepage discovery:", err);
      } finally {
        if (mounted) setIsLoadingRecs(false);
      }
    };

    loadDiscoveryData();
    return () => {
      mounted = false;
    };
  }, [user, preferences, profile, pantryIngredients]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/recipes?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newIngredient.trim();
    if (!val) return;
    if (!pantryIngredients.some((i) => i.toLowerCase() === val.toLowerCase())) {
      setPantryIngredients([...pantryIngredients, val]);
    }
    setNewIngredient("");
  };

  const handleRemoveIngredient = (ing: string) => {
    setPantryIngredients(pantryIngredients.filter((i) => i !== ing));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* 1. HERO SECTION: Food Photography + Natural Language Search */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Visual Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=85"
            alt="Artisanal food preparation"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-stone-950/40 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 max-w-4xl text-center space-y-6 text-white my-auto">
          <Badge 
            variant="outline" 
            className="py-1 px-4 bg-white/10 backdrop-blur-md text-amber-300 border-white/20 text-xs font-semibold tracking-wide uppercase mx-auto inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Global Recipe Intelligence
          </Badge>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15]">
            Discover what to cook today.
          </h1>

          <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Recipes calibrated to your exact taste, ingredients on hand, dietary constraints, and kitchen time.
          </p>

          {/* Natural Language Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form onSubmit={handleHeroSearch} className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-stone-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="What are you craving? (e.g. 'Quick vegetarian dinner' or 'Chicken biryani')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-32 rounded-2xl bg-white/95 text-stone-900 placeholder:text-stone-500 text-sm md:text-base border-0 shadow-2xl focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                className="absolute right-2 h-10 px-5 rounded-xl font-medium shadow-md"
              >
                Discover
              </Button>
            </form>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <span className="text-xs text-stone-400 font-medium">Try searching:</span>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => navigate(`/recipes?q=${encodeURIComponent(prompt)}`)}
                  className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 backdrop-blur transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PERSONALIZED RECOMMENDATIONS SECTION ("Made for you") */}
      <section className="section-padding content-grid">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Personalized Recommendations</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Made for You</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user 
                ? `Customized for your ${preferences?.diet || "current"} diet, ${profile?.country || "local"} region, and kitchen habits.` 
                : "Personalized suggestions tailored to diverse dietary needs and seasonal culinary trends."}
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="rounded-xl gap-1 shrink-0">
            <Link to="/recipes">
              View All Recipes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoadingRecs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-[16/10] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <RecipeCard
                key={rec.id}
                id={rec.id}
                title={rec.title}
                description={rec.description}
                image={rec.image}
                cookTime={rec.readyInMinutes}
                calories={rec.calories}
                cuisine={rec.cuisine}
                diet={rec.diet}
                tags={rec.tags}
                reasons={rec.reasons}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. INGREDIENT SECTION: "Cook with what you have" */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="content-grid max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="bg-background text-primary border-primary/20">
              Zero Waste Cooking
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Cook with What You Have</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Add the ingredients currently in your fridge or pantry to find immediate recipes that maximize them.
            </p>
          </div>

          {/* Interactive Tag Collector */}
          <div className="p-6 rounded-2xl bg-card border shadow-sm space-y-4">
            <form onSubmit={handleAddIngredient} className="flex gap-2">
              <Input
                placeholder="Type an ingredient (e.g. Potato, Onion, Rice)..."
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className="rounded-xl h-11"
              />
              <Button type="submit" className="rounded-xl gap-1 shrink-0 h-11 px-5">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Your Ingredients:</span>
              {pantryIngredients.map((ing) => (
                <Badge
                  key={ing}
                  variant="secondary"
                  className="py-1 px-3 text-xs rounded-lg gap-1.5 bg-primary/10 text-primary border-primary/20"
                >
                  <span>{ing}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {pantryIngredients.length === 0 && (
                <span className="text-xs text-muted-foreground italic">No ingredients added yet.</span>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button
                size="sm"
                onClick={() => navigate(`/recipes?ingredients=${encodeURIComponent(pantryIngredients.join(","))}`)}
                disabled={pantryIngredients.length === 0}
                className="gap-2 rounded-xl"
              >
                Find Recipes with These ({pantryIngredients.length})
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUICK MEALS: Ready in 25 Minutes or Less */}
      <section className="section-padding content-grid">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <Clock className="h-4 w-4" />
              <span>Fast Weeknight Feasts</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ready in 25 Minutes or Less</h2>
            <p className="text-sm text-muted-foreground mt-1">High-flavor meals that don't take your entire evening</p>
          </div>

          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link to="/recipes?maxTime=25">
              Explore Quick Meals &rarr;
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickMeals.map((meal) => (
            <RecipeCard
              key={meal.id}
              id={meal.id}
              title={meal.title}
              description={meal.description}
              image={meal.image}
              cookTime={meal.readyInMinutes}
              calories={meal.calories}
              cuisine={meal.cuisine}
              diet={meal.diet}
            />
          ))}
        </div>
      </section>

      {/* 5. EXPLORE CUISINES: Visual Heritage Cards */}
      <section className="py-16 bg-muted/20 border-t">
        <div className="content-grid space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Explore Global Cuisines</h2>
            <p className="text-sm text-muted-foreground">Discover iconic culinary traditions and authentic preparations</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_CUISINES.map((cuisine) => (
              <Link
                key={cuisine.name}
                to={`/recipes?cuisine=${encodeURIComponent(cuisine.name.toLowerCase())}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={cuisine.image}
                  alt={cuisine.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">{cuisine.name}</h3>
                  <p className="text-[11px] text-white/80 line-clamp-1">{cuisine.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. DISCOVERY & TRENDING (Breaks Recommendation Bubbles) */}
      <section className="section-padding content-grid">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <Compass className="h-4 w-4" />
              <span>Expand Your Palate</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Trending Across the World</h2>
            <p className="text-sm text-muted-foreground mt-1">Dishes beyond your typical feed to inspire culinary adventure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((trendRecipe) => (
            <RecipeCard
              key={trendRecipe.id}
              id={trendRecipe.id}
              title={trendRecipe.title}
              description={trendRecipe.description}
              image={trendRecipe.image}
              cookTime={trendRecipe.readyInMinutes}
              calories={trendRecipe.calories}
              cuisine={trendRecipe.cuisine}
              diet={trendRecipe.diet}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card text-muted-foreground">
        <div className="content-grid flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">suvAI</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="hover:text-foreground">Discover</Link>
            <Link to="/recipes" className="hover:text-foreground">Recipes</Link>
            <Link to="/meal-planner" className="hover:text-foreground">Meal Planner</Link>
            <Link to="/grocery" className="hover:text-foreground">Grocery</Link>
            <Link to="/assistant" className="hover:text-foreground">Assistant</Link>
          </div>

          <div className="text-xs">
            &copy; {new Date().getFullYear()} suvAI. Personalized Culinary Platform.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
