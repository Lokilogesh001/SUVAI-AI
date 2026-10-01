import { useState, useEffect } from "react";
import { 
  Clock, 
  Users, 
  ChefHat, 
  Flame, 
  Bookmark, 
  ShoppingCart, 
  Calendar, 
  CheckCircle, 
  Sparkles, 
  Info,
  Share2,
  Utensils 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VoiceGuide from "./VoiceGuide";
import RecipeCard from "./RecipeCard";
import { useAuth } from "@/contexts/AuthContext";
import { userDataService } from "@/services/userDataService";
import { recipeService } from "@/services/recipes/recipeService";
import { Recipe, RecipeIngredient } from "@/types/recipe";
import { MealType, GroceryCategory } from "@/types/database";
import { toast } from "sonner";

interface RecipeDetailProps {
  recipe: Recipe;
}

const RecipeDetail = ({ recipe }: RecipeDetailProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);
  const [hasCooked, setHasCooked] = useState(false);
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);

  // Add to Meal Plan modal
  const [isMealPlanOpen, setIsMealPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [planType, setPlanType] = useState<MealType>("dinner");

  // Track initial interaction (view) and check if saved
  useEffect(() => {
    let mounted = true;
    if (user && recipe.id) {
      userDataService.recordInteraction(user.id, recipe.id, "view");
      userDataService.getSavedRecipeIds(user.id).then((ids) => {
        if (mounted) setIsSaved(ids.includes(recipe.id));
      });
    }

    // Load similar recipes from same cuisine or diet
    recipeService.search({ cuisine: recipe.cuisine, number: 4 }).then((results) => {
      if (mounted) {
        setSimilarRecipes(results.filter((r) => r.id !== recipe.id).slice(0, 3));
      }
    });

    return () => {
      mounted = false;
    };
  }, [user, recipe.id, recipe.cuisine]);

  const handleToggleSave = async () => {
    if (!user) {
      toast.info("Sign in to save this recipe", {
        action: { label: "Sign In", onClick: () => navigate(`/auth?redirect=/recipe/${recipe.id}`) },
      });
      return;
    }

    if (isSaved) {
      await userDataService.unsaveRecipe(user.id, recipe.id);
      setIsSaved(false);
      toast.success("Removed from saved recipes");
    } else {
      await userDataService.saveRecipe(user.id, recipe.id);
      setIsSaved(true);
      toast.success("Saved to your favorites");
    }
  };

  const handleCookThis = async () => {
    if (!user) {
      toast.info("Sign in to track your cooking history", {
        action: { label: "Sign In", onClick: () => navigate(`/auth?redirect=/recipe/${recipe.id}`) },
      });
      return;
    }

    await userDataService.recordInteraction(user.id, recipe.id, "cook");
    setHasCooked(true);
    toast.success("Awesome chef! Recorded to your cooking history 🎉", {
      description: "suvAI will use this to improve future recipe recommendations.",
    });
  };

  const handleAddAllToGrocery = async () => {
    if (!user) {
      toast.info("Sign in to add ingredients to your grocery list", {
        action: { label: "Sign In", onClick: () => navigate(`/auth?redirect=/recipe/${recipe.id}`) },
      });
      return;
    }

    for (const ing of recipe.ingredients) {
      let cat: GroceryCategory = "Produce";
      const l = ing.name.toLowerCase();
      if (l.includes("chicken") || l.includes("meat") || l.includes("beef") || l.includes("pork")) cat = "Meat";
      else if (l.includes("salmon") || l.includes("fish") || l.includes("shrimp") || l.includes("seafood")) cat = "Seafood";
      else if (l.includes("cheese") || l.includes("milk") || l.includes("butter") || l.includes("yogurt") || l.includes("cream")) cat = "Dairy";
      else if (l.includes("flour") || l.includes("oil") || l.includes("rice") || l.includes("pasta") || l.includes("sugar") || l.includes("salt")) cat = "Pantry";

      await userDataService.addGroceryItem(
        user.id,
        ing.name,
        typeof ing.amount === "number" ? ing.amount : 1,
        ing.unit || "",
        cat
      );
    }

    toast.success(`Added ${recipe.ingredients.length} ingredients to your Grocery List!`, {
      action: {
        label: "View Grocery List",
        onClick: () => navigate("/grocery"),
      },
    });
  };

  const handleSaveMealPlan = async () => {
    if (!user) return;
    await userDataService.addMealPlan(user.id, planDate, planType, recipe.id, recipe.title);
    setIsMealPlanOpen(false);
    toast.success(`Scheduled ${recipe.title} for ${planType} on ${planDate}!`, {
      action: {
        label: "View Planner",
        onClick: () => navigate("/meal-planner"),
      },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Recipe link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero Visual Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border">
        <div className="aspect-[21/9] md:aspect-[24/10] w-full relative">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        {/* Hero Overlay Details */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
              {recipe.cuisine} Cuisine
            </span>
            {recipe.diet && recipe.diet !== "all" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 backdrop-blur-md capitalize">
                {recipe.diet}
              </span>
            )}
            {recipe.tags?.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="hidden sm:inline-block px-3 py-1 rounded-full text-xs bg-white/10 backdrop-blur-md">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {recipe.title}
          </h1>

          <p className="text-white/85 text-sm md:text-base max-w-3xl line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </div>

      {/* Metrics & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-card border shadow-sm">
        {/* Quick Numbers */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-6">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Cook Time</div>
              <div className="font-semibold text-sm">{recipe.readyInMinutes} mins</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Servings</div>
              <div className="font-semibold text-sm">{recipe.servings} persons</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Flame className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Calories</div>
              <div className="font-semibold text-sm">{recipe.calories} kcal</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSave}
            className="gap-2 rounded-xl"
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
            {isSaved ? "Saved" : "Save Recipe"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMealPlanOpen(true)}
            className="gap-2 rounded-xl"
          >
            <Calendar className="h-4 w-4" />
            Add to Meal Plan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddAllToGrocery}
            className="gap-2 rounded-xl"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Grocery
          </Button>

          <Button
            variant={hasCooked ? "secondary" : "default"}
            size="sm"
            onClick={handleCookThis}
            className={`gap-2 rounded-xl ${hasCooked ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : ""}`}
          >
            <CheckCircle className="h-4 w-4" />
            {hasCooked ? "Cooked!" : "Cook This"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-xl"
            aria-label="Share recipe"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content: Left (Tabs) & Right (Voice Guide) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="ingredients" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md bg-muted rounded-xl">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>

            {/* TAB 1: Ingredients */}
            <TabsContent value="ingredients" className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Required Ingredients</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddAllToGrocery}
                    className="text-xs text-primary gap-1"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add all to grocery
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recipe.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-foreground">{ing.name}</span>
                      <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded-md border">
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Instructions */}
            <TabsContent value="instructions" className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
                <h2 className="text-lg font-bold">Step-by-Step Cooking Guide</h2>

                <div className="space-y-4">
                  {recipe.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Nutrition */}
            <TabsContent value="nutrition" className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Nutritional Breakdown (per serving)</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/40 border text-center">
                    <span className="text-2xl font-black text-primary">{recipe.nutrition?.calories || recipe.calories}</span>
                    <span className="text-xs text-muted-foreground block mt-1">Calories (kcal)</span>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border text-center">
                    <span className="text-2xl font-black text-emerald-600">{recipe.nutrition?.protein || 24}g</span>
                    <span className="text-xs text-muted-foreground block mt-1">Protein</span>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border text-center">
                    <span className="text-2xl font-black text-amber-600">{recipe.nutrition?.carbs || 36}g</span>
                    <span className="text-xs text-muted-foreground block mt-1">Carbohydrates</span>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border text-center">
                    <span className="text-2xl font-black text-rose-600">{recipe.nutrition?.fat || 16}g</span>
                    <span className="text-xs text-muted-foreground block mt-1">Fat</span>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border text-center">
                    <span className="text-2xl font-black text-indigo-600">{recipe.nutrition?.fiber || 4}g</span>
                    <span className="text-xs text-muted-foreground block mt-1">Fiber</span>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border text-center">
                    <span className="text-2xl font-black text-stone-600 dark:text-stone-300">{recipe.nutrition?.sugar || 3}g</span>
                    <span className="text-xs text-muted-foreground block mt-1">Sugar</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: Voice Guide Assistant */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <VoiceGuide steps={recipe.instructions} />

            <div className="p-5 rounded-2xl border bg-muted/20 space-y-3">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Chef Advice
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Need ingredient replacements? Open our <Link to="/assistant" className="text-primary font-semibold hover:underline">Recipe Assistant</Link> to ask for live substitutions and cooking adaptations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Recipes Recommendations */}
      {similarRecipes.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Similar Dishes You Might Enjoy</h2>
              <p className="text-sm text-muted-foreground">More recommendations matching {recipe.cuisine} flavor profiles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarRecipes.map((similar) => (
              <RecipeCard
                key={similar.id}
                id={similar.id}
                title={similar.title}
                description={similar.description}
                image={similar.image}
                cookTime={similar.readyInMinutes}
                calories={similar.calories}
                cuisine={similar.cuisine}
                diet={similar.diet}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add to Meal Plan Dialog */}
      <Dialog open={isMealPlanOpen} onOpenChange={setIsMealPlanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Meal Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Recipe</label>
              <div className="p-3 rounded-xl bg-muted font-medium text-sm">
                {recipe.title}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Plan Date</label>
              <input
                type="date"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border bg-background text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Meal Type</label>
              <Select value={planType} onValueChange={(v) => setPlanType(v as MealType)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                  <SelectItem value="lunch">🥗 Lunch</SelectItem>
                  <SelectItem value="dinner">🍲 Dinner</SelectItem>
                  <SelectItem value="snack">🍎 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsMealPlanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMealPlan}>
              Schedule Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeDetail;
