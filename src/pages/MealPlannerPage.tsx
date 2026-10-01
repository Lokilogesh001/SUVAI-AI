import { useState, useCallback, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Utensils, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShoppingCart, 
  ChefHat, 
  Clock, 
  ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { userDataService } from "@/services/userDataService";
import { recipeService } from "@/services/recipes/recipeService";
import { recommendationEngine } from "@/services/recommendation/recommendationEngine";
import { MealPlanRow, MealType, GroceryCategory } from "@/types/database";
import { Recipe } from "@/types/recipe";
import { toast } from "sonner";

const MEAL_TYPES: { id: MealType; label: string; icon: string }[] = [
  { id: "breakfast", label: "Breakfast", icon: "🍳" },
  { id: "lunch", label: "Lunch", icon: "🥗" },
  { id: "dinner", label: "Dinner", icon: "🍲" },
  { id: "snack", label: "Snack", icon: "🍎" },
];

const MealPlannerPage = () => {
  const { t } = useLanguage();
  const { user, preferences, profile } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<MealPlanRow[]>([]);
  const [activeTab, setActiveTab] = useState("week");
  const [isLoading, setIsLoading] = useState(true);

  // Add meal modal
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);

  // Load recipes for picker & load user meal plans
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const recipes = recipeService.getAllSeedRecipes();
        if (isMounted) setAllRecipes(recipes);

        if (user) {
          const userMeals = await userDataService.getMealPlans(user.id);
          if (isMounted) setMeals(userMeals);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Compute week days
  const getWeekDays = useCallback(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [selectedDate]);

  const weekDays = getWeekDays();

  const getMealsForDayAndType = useCallback(
    (date: Date, type: MealType) => {
      const formatted = format(date, "yyyy-MM-dd");
      return meals.filter((m) => m.date === formatted && m.meal_type === type);
    },
    [meals]
  );

  const handleAddMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to save your meal plans");
      return;
    }

    const title = selectedRecipeId 
      ? allRecipes.find((r) => r.id === selectedRecipeId)?.title || mealName
      : mealName;

    if (!title.trim()) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const created = await userDataService.addMealPlan(
      user.id,
      dateStr,
      mealType,
      selectedRecipeId || undefined,
      title
    );

    setMeals((prev) => [...prev, created]);
    setIsAddingMeal(false);
    setMealName("");
    setSelectedRecipeId("");
    toast.success(`Added ${title} to ${mealType}`);
  };

  const handleDeleteMeal = async (planId: string) => {
    if (!user) return;
    setMeals((prev) => prev.filter((m) => m.id !== planId));
    await userDataService.deleteMealPlan(user.id, planId);
    toast.success("Meal removed from plan");
  };

  // Generate Personalized Weekly Plan respecting diet, allergies, cuisine preferences
  const handleAutoGenerateWeeklyPlan = async () => {
    if (!user) {
      toast.error("Please sign in to generate a personalized meal plan");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating personalized weekly plan...", {
      description: "Tailoring recipes to your dietary restrictions and favorite cuisines.",
    });

    try {
      const recommendations = await recommendationEngine.getRecommendations({
        userId: user.id,
        country: profile?.country || "IN",
        preferences: preferences,
        limit: 14,
      });

      if (recommendations.length === 0) {
        toast.error("Could not find recipes matching your strict dietary requirements.");
        return;
      }

      const newPlannedMeals: MealPlanRow[] = [];
      let recIndex = 0;

      for (const day of weekDays) {
        const dateStr = format(day, "yyyy-MM-dd");

        // Schedule lunch
        const lunchRecipe = recommendations[recIndex % recommendations.length];
        recIndex++;
        const lunchPlan = await userDataService.addMealPlan(
          user.id,
          dateStr,
          "lunch",
          lunchRecipe.id,
          lunchRecipe.title
        );
        newPlannedMeals.push(lunchPlan);

        // Schedule dinner
        const dinnerRecipe = recommendations[recIndex % recommendations.length];
        recIndex++;
        const dinnerPlan = await userDataService.addMealPlan(
          user.id,
          dateStr,
          "dinner",
          dinnerRecipe.id,
          dinnerRecipe.title
        );
        newPlannedMeals.push(dinnerPlan);
      }

      // Refresh meals state
      const updated = await userDataService.getMealPlans(user.id);
      setMeals(updated);
      toast.success("Weekly Meal Plan Generated!", {
        description: `Scheduled 14 meals customized for ${preferences?.diet || "your"} diet.`,
      });
    } catch (err: any) {
      toast.error("Error generating plan", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  // Export Weekly Plan Ingredients to Grocery List
  const handleExportToGroceryList = async () => {
    if (!user) return;
    const weekDateStrings = weekDays.map((d) => format(d, "yyyy-MM-dd"));
    const thisWeekMeals = meals.filter((m) => weekDateStrings.includes(m.date));

    if (thisWeekMeals.length === 0) {
      toast.info("No meals planned for this week to export.");
      return;
    }

    let addedCount = 0;
    for (const meal of thisWeekMeals) {
      if (meal.recipe_id) {
        const recipe = await recipeService.getRecipeById(meal.recipe_id);
        if (recipe && recipe.ingredients) {
          for (const ing of recipe.ingredients) {
            let cat: GroceryCategory = "Produce";
            const lower = ing.name.toLowerCase();
            if (lower.includes("chicken") || lower.includes("meat") || lower.includes("pork") || lower.includes("beef")) cat = "Meat";
            else if (lower.includes("salmon") || lower.includes("fish") || lower.includes("shrimp")) cat = "Seafood";
            else if (lower.includes("cheese") || lower.includes("milk") || lower.includes("butter") || lower.includes("yogurt")) cat = "Dairy";
            else if (lower.includes("flour") || lower.includes("rice") || lower.includes("pasta") || lower.includes("oil")) cat = "Pantry";

            await userDataService.addGroceryItem(
              user.id,
              ing.name,
              typeof ing.amount === "number" ? ing.amount : 1,
              ing.unit || "",
              cat
            );
            addedCount++;
          }
        }
      }
    }

    toast.success(`Exported ${addedCount} ingredients to your Grocery List!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="content-grid pt-24 md:pt-28 pb-16 space-y-8">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Weekly Meal Planner</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Plan and balance breakfast, lunch, dinner, and snacks tailored to your nutritional preferences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToGroceryList}
              className="gap-2 rounded-xl"
            >
              <ShoppingCart className="h-4 w-4" />
              Export to Grocery List
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleAutoGenerateWeeklyPlan}
              disabled={isGenerating}
              className="gap-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              {isGenerating ? "Synthesizing..." : "Auto-Generate Week"}
            </Button>

            <Button 
              size="sm" 
              onClick={() => setIsAddingMeal(true)}
              className="gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add Meal
            </Button>
          </div>
        </div>

        {/* Calendar Picker + View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Selector Card */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Select Week / Day
                </CardTitle>
                <CardDescription className="text-xs">
                  {format(selectedDate, "EEEE, MMMM do, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-xl border"
                />
              </CardContent>
            </Card>

            {/* Meal summary info */}
            <div className="p-4 rounded-2xl bg-card border text-xs space-y-2">
              <span className="font-semibold text-foreground block">Active Dietary Filter</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{preferences?.diet || "All diets"}</Badge>
                <Badge variant="secondary">{preferences?.preferred_cooking_time || "30-60"} min</Badge>
              </div>
            </div>
          </div>

          {/* Week & Day View Tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="bg-muted rounded-xl">
                  <TabsTrigger value="week">Week View</TabsTrigger>
                  <TabsTrigger value="day">Day Focus</TabsTrigger>
                </TabsList>

                <span className="text-xs text-muted-foreground font-medium">
                  Week of {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
                </span>
              </div>

              {/* WEEK VIEW */}
              <TabsContent value="week" className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {weekDays.map((day) => {
                    const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                    const dayFormatted = format(day, "yyyy-MM-dd");
                    const dayMeals = meals.filter((m) => m.date === dayFormatted);

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`rounded-2xl border p-3 flex flex-col justify-between min-h-[300px] cursor-pointer transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm" 
                            : "bg-card hover:border-primary/50"
                        }`}
                      >
                        {/* Day Header */}
                        <div className="border-b pb-2 mb-2 text-center">
                          <span className="text-xs font-bold text-foreground block">
                            {format(day, "EEE")}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {format(day, "MMM d")}
                          </span>
                        </div>

                        {/* Meal slots */}
                        <div className="space-y-2 flex-1">
                          {MEAL_TYPES.map(({ id: mType, label, icon }) => {
                            const slotMeals = dayMeals.filter((m) => m.meal_type === mType);

                            return (
                              <div key={mType} className="space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                  <span>{icon}</span> {label}
                                </span>

                                {slotMeals.length > 0 ? (
                                  slotMeals.map((meal) => (
                                    <div
                                      key={meal.id}
                                      className="p-1.5 rounded-lg bg-secondary/80 text-[11px] font-medium text-foreground flex items-center justify-between group"
                                    >
                                      {meal.recipe_id ? (
                                        <Link 
                                          to={`/recipe/${meal.recipe_id}`}
                                          className="hover:underline line-clamp-1 flex-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {meal.custom_name}
                                        </Link>
                                      ) : (
                                        <span className="line-clamp-1 flex-1">{meal.custom_name}</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteMeal(meal.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-1"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <div 
                                    className="p-1 text-[10px] text-muted-foreground/60 rounded border border-dashed text-center hover:border-primary/40"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDate(day);
                                      setMealType(mType);
                                      setIsAddingMeal(true);
                                    }}
                                  >
                                    + Add
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* DAY VIEW */}
              <TabsContent value="day" className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MEAL_TYPES.map(({ id: mType, label, icon }) => {
                    const slotMeals = getMealsForDayAndType(selectedDate, mType);

                    return (
                      <Card key={mType} className="shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="text-xl">{icon}</span>
                            {label}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs gap-1"
                            onClick={() => {
                              setMealType(mType);
                              setIsAddingMeal(true);
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {slotMeals.length > 0 ? (
                            slotMeals.map((meal) => (
                              <div
                                key={meal.id}
                                className="p-3 rounded-xl border bg-muted/30 flex items-center justify-between"
                              >
                                <div className="space-y-0.5">
                                  {meal.recipe_id ? (
                                    <Link
                                      to={`/recipe/${meal.recipe_id}`}
                                      className="font-semibold text-sm hover:text-primary transition-colors"
                                    >
                                      {meal.custom_name}
                                    </Link>
                                  ) : (
                                    <span className="font-semibold text-sm">{meal.custom_name}</span>
                                  )}
                                  <div className="text-[11px] text-muted-foreground">
                                    Planned for {format(selectedDate, "MMM d")}
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteMeal(meal.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground p-3 rounded-xl bg-muted/20 border border-dashed text-center">
                              No {label.toLowerCase()} planned for this day.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Add Meal Dialog */}
        <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Meal Plan</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddMealSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={format(selectedDate, "EEEE, MMMM do, yyyy")} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>Meal Slot</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.icon} {t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select from Recommended Recipes</Label>
                <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a discovered recipe..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {allRecipes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title} ({r.cuisine} &bull; {r.readyInMinutes}m)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t w-full" />
                <span className="absolute bg-background px-2 text-[10px] text-muted-foreground uppercase">
                  Or enter custom dish
                </span>
              </div>

              <div className="space-y-2">
                <Label>Custom Dish Name</Label>
                <Input
                  placeholder="e.g. Scrambled eggs with toast"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  disabled={Boolean(selectedRecipeId)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddingMeal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!mealName.trim() && !selectedRecipeId}>
                  Save to Schedule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MealPlannerPage;
