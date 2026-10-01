import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  Heart, 
  Settings, 
  Calendar, 
  LogOut, 
  Save, 
  ChefHat, 
  Clock, 
  Flame, 
  Trash2, 
  History, 
  Sliders, 
  Globe 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { userDataService } from "@/services/userDataService";
import { recipeService } from "@/services/recipes/recipeService";
import { Recipe } from "@/types/recipe";
import { DietType, CookingSkill, CookingTimePreference, SpicePreference } from "@/types/database";
import { toast } from "sonner";

const ALL_CUISINES = [
  "Indian", "Italian", "Mexican", "Thai", "Japanese", 
  "Mediterranean", "Chinese", "French", "American", "Middle Eastern"
];

const COMMON_ALLERGIES = [
  "Peanuts", "Tree Nuts", "Dairy", "Gluten / Wheat", 
  "Shellfish", "Fish", "Eggs", "Soy"
];

const DISLIKED_OPTIONS = [
  "Cilantro", "Mushrooms", "Olives", "Eggplant", "Bell Peppers", "Onions", "Pork", "Beef"
];

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "IT", name: "Italy" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "TH", name: "Thailand" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

const ProfilePage = () => {
  const { t } = useLanguage();
  const { user, profile, preferences, updateProfile, updatePreferences, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState("preferences");
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [cookedRecipes, setCookedRecipes] = useState<Recipe[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form states for profile & preferences
  const [name, setName] = useState(profile?.name || user?.name || "");
  const [country, setCountry] = useState(profile?.country || user?.country || "IN");
  const [diet, setDiet] = useState<DietType>(preferences?.diet || "all");
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>(preferences?.favorite_cuisines || []);
  const [allergies, setAllergies] = useState<string[]>(preferences?.allergies || []);
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>(preferences?.disliked_ingredients || []);
  const [cookingTime, setCookingTime] = useState<CookingTimePreference>(preferences?.preferred_cooking_time || "30-60");
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>(preferences?.cooking_skill || "intermediate");
  const [spicePreference, setSpicePreference] = useState<SpicePreference>(preferences?.spice_preference || "medium");

  // Keep state synced when user context finishes loading
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setCountry(profile.country);
    }
    if (preferences) {
      setDiet(preferences.diet);
      setFavoriteCuisines(preferences.favorite_cuisines);
      setAllergies(preferences.allergies);
      setDislikedIngredients(preferences.disliked_ingredients);
      setCookingTime(preferences.preferred_cooking_time);
      setCookingSkill(preferences.cooking_skill);
      setSpicePreference(preferences.spice_preference);
    }
  }, [profile, preferences]);

  // Load saved recipes and cooking history from userDataService + recipeService
  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      if (!user) return;
      setIsLoadingData(true);
      try {
        const [savedIds, interactions] = await Promise.all([
          userDataService.getSavedRecipeIds(user.id),
          userDataService.getInteractions(user.id),
        ]);

        // Fetch recipe entities
        const recipePromises = savedIds.map((id) => recipeService.getRecipeById(id));
        const resolvedSaved = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[];

        // Extract cooked recipe IDs
        const cookedIds = Array.from(
          new Set(
            interactions
              .filter((i) => i.interaction_type === "cook")
              .map((i) => i.recipe_id)
          )
        );
        const resolvedCooked = (await Promise.all(cookedIds.map((id) => recipeService.getRecipeById(id)))).filter(Boolean) as Recipe[];

        if (isMounted) {
          setSavedRecipes(resolvedSaved);
          setCookedRecipes(resolvedCooked);
        }
      } catch (err) {
        console.error("Error loading profile user data:", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleToggleCuisine = (item: string) => {
    setFavoriteCuisines((prev) => 
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleToggleAllergy = (item: string) => {
    setAllergies((prev) => 
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleToggleDislike = (item: string) => {
    setDislikedIngredients((prev) => 
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleSavePreferences = async () => {
    await updateProfile({ name, country });
    await updatePreferences({
      diet,
      favorite_cuisines: favoriteCuisines,
      allergies,
      disliked_ingredients: dislikedIngredients,
      preferred_cooking_time: cookingTime,
      cooking_skill: cookingSkill,
      spice_preference: spicePreference,
    });
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    if (!user) return;
    await userDataService.unsaveRecipe(user.id, recipeId);
    setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    toast.success("Recipe removed from saved collection");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="content-grid pt-24 md:pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT: User Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border shadow-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                  {name ? name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                </div>

                <div>
                  <h2 className="text-xl font-bold">{name || "Chef"}</h2>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground font-medium">
                    <Globe className="h-3 w-3" />
                    <span>{COUNTRIES.find((c) => c.code === country)?.name || country}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-left">
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <span className="text-xs text-muted-foreground block">Saved</span>
                    <span className="text-lg font-bold text-primary">{savedRecipes.length}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <span className="text-xs text-muted-foreground block">Cooked</span>
                    <span className="text-lg font-bold text-emerald-600">{cookedRecipes.length}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 gap-2"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="p-4 rounded-xl border bg-card space-y-1.5 text-sm">
              <Link 
                to="/meal-planner" 
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Meal Planner
                </span>
                <span className="text-xs text-muted-foreground">&rarr;</span>
              </Link>
              <Link 
                to="/recipes" 
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary" />
                  Recipe Discovery
                </span>
                <span className="text-xs text-muted-foreground">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: Tabs for Preferences, Saved Recipes, History */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-3 max-w-md w-full">
                <TabsTrigger value="preferences" className="gap-2">
                  <Sliders className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="saved" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Saved ({savedRecipes.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  Cooked ({cookedRecipes.length})
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Preferences Editor */}
              <TabsContent value="preferences" className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Cooking Profile & Taste Intelligence</CardTitle>
                    <CardDescription>
                      Adjust your diet, preferred cuisines, and allergens. Any changes immediately calibrate your personalized recommendations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Display Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Country Context</label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Diet Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Dietary Restriction (Strict Constraint)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: "all", label: "No Restrictions" },
                          { id: "vegetarian", label: "Vegetarian" },
                          { id: "vegan", label: "Vegan" },
                          { id: "eggetarian", label: "Eggetarian" },
                          { id: "pescatarian", label: "Pescatarian" },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setDiet(d.id as DietType)}
                            className={`p-3 text-xs font-medium rounded-xl border text-center transition-all ${
                              diet === d.id 
                                ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20 font-semibold" 
                                : "hover:bg-muted"
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Favorite Cuisines */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Favorite Cuisines</label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_CUISINES.map((c) => {
                          const selected = favoriteCuisines.includes(c);
                          return (
                            <Badge
                              key={c}
                              variant={selected ? "default" : "outline"}
                              className="cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all"
                              onClick={() => handleToggleCuisine(c)}
                            >
                              {c}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Allergies */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-destructive">Allergens (Zero-Tolerance Exclusion)</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_ALLERGIES.map((a) => {
                          const selected = allergies.includes(a);
                          return (
                            <Badge
                              key={a}
                              variant={selected ? "destructive" : "outline"}
                              className="cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all"
                              onClick={() => handleToggleAllergy(a)}
                            >
                              {a}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Disliked Ingredients */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Disliked Ingredients (Soft Ranking Penalty)</label>
                      <div className="flex flex-wrap gap-2">
                        {DISLIKED_OPTIONS.map((ing) => {
                          const selected = dislikedIngredients.includes(ing);
                          return (
                            <Badge
                              key={ing}
                              variant={selected ? "secondary" : "outline"}
                              className={`cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all ${
                                selected ? "bg-stone-300 dark:bg-stone-700" : ""
                              }`}
                              onClick={() => handleToggleDislike(ing)}
                            >
                              {ing}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time, Skill, Spice */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Preferred Cook Time</label>
                        <Select value={cookingTime} onValueChange={(v) => setCookingTime(v as CookingTimePreference)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<15">&lt; 15 mins</SelectItem>
                            <SelectItem value="15-30">15–30 mins</SelectItem>
                            <SelectItem value="30-60">30–60 mins</SelectItem>
                            <SelectItem value="60+">60+ mins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Cooking Skill</label>
                        <Select value={cookingSkill} onValueChange={(v) => setCookingSkill(v as CookingSkill)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Spice Preference</label>
                        <Select value={spicePreference} onValueChange={(v) => setSpicePreference(v as SpicePreference)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="spicy">Spicy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                      <Button onClick={handleSavePreferences} className="gap-2 rounded-xl">
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 2: Saved Recipes */}
              <TabsContent value="saved" className="space-y-4 animate-fade-in">
                {isLoadingData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : savedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedRecipes.map((recipe) => (
                      <div 
                        key={recipe.id}
                        className="flex gap-4 p-3.5 bg-card border rounded-xl hover:shadow-md transition-all group"
                      >
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="h-24 w-24 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <Link 
                              to={`/recipe/${recipe.id}`} 
                              className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {recipe.title}
                            </Link>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {recipe.readyInMinutes}m
                              </span>
                              <span>&bull;</span>
                              <span>{recipe.cuisine}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {recipe.diet || "All diets"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleUnsaveRecipe(recipe.id)}
                              aria-label="Remove from saved"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 border border-dashed rounded-2xl">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold mb-1">Your recipe collection is empty</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                      Explore recipes and save the ones you want to cook later.
                    </p>
                    <Button asChild>
                      <Link to="/recipes">Discover Recipes</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: Cooking History */}
              <TabsContent value="history" className="space-y-4 animate-fade-in">
                {cookedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cookedRecipes.map((recipe) => (
                      <div 
                        key={recipe.id}
                        className="flex gap-4 p-3.5 bg-card border rounded-xl hover:shadow-sm transition-all"
                      >
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="h-20 w-20 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-block mb-1">
                            Cooked
                          </span>
                          <Link 
                            to={`/recipe/${recipe.id}`} 
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors block line-clamp-1"
                          >
                            {recipe.title}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1">
                            {recipe.cuisine} &bull; {recipe.readyInMinutes} mins
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 border border-dashed rounded-2xl">
                    <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold mb-1">No cooked recipes recorded yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                      When you prepare a recipe, click "Cook this" on the recipe detail page to help suvAI learn your taste.
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/recipes">Find something to cook</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
