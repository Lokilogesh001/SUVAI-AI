import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Grid2X2, List, ChefHat, Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { recipeService } from "@/services/recipes/recipeService";
import { Recipe } from "@/types/recipe";

const CUISINES = [
  "all", "Indian", "Italian", "Mexican", "Thai", "Japanese", 
  "Chinese", "Mediterranean", "Spanish", "Turkish", "French", 
  "British", "American", "Middle Eastern", "Vietnamese", "Greek", "Asian"
];

const DIETS = [
  { id: "all", label: "All Diets" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "non-vegetarian", label: "Non-Vegetarian" },
  { id: "pescatarian", label: "Pescatarian" },
];

const RecipeCategoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get("q") || "";
  const cuisineParam = searchParams.get("cuisine") || "all";
  const dietParam = searchParams.get("diet") || "all";
  const maxTimeParam = searchParams.get("maxTime") || "";
  const ingredientsParam = searchParams.get("ingredients") || "";

  const [query, setQuery] = useState(queryParam);
  const [selectedCuisine, setSelectedCuisine] = useState(cuisineParam);
  const [selectedDiet, setSelectedDiet] = useState(dietParam);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state if searchParams change
  useEffect(() => {
    setQuery(queryParam);
    setSelectedCuisine(cuisineParam);
    setSelectedDiet(dietParam);
  }, [queryParam, cuisineParam, dietParam]);

  useEffect(() => {
    let mounted = true;

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const results = await recipeService.search({
          query: queryParam || undefined,
          cuisine: cuisineParam !== "all" ? cuisineParam : undefined,
          diet: dietParam !== "all" ? dietParam : undefined,
          maxReadyTime: maxTimeParam ? parseInt(maxTimeParam, 10) : undefined,
          includeIngredients: ingredientsParam ? ingredientsParam.split(",") : undefined,
          number: 16,
        });

        if (mounted) {
          setRecipes(results);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    performSearch();
    return () => {
      mounted = false;
    };
  }, [queryParam, cuisineParam, dietParam, maxTimeParam, ingredientsParam]);

  const handleApplyFilter = (key: string, value: string) => {
    const updated = new URLSearchParams(searchParams);
    if (value === "all" || !value) {
      updated.delete(key);
    } else {
      updated.set(key, value);
    }
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilter("q", query.trim());
  };

  const clearAllFilters = () => {
    setQuery("");
    setSelectedCuisine("all");
    setSelectedDiet("all");
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(queryParam || (cuisineParam && cuisineParam !== "all") || (dietParam && dietParam !== "all") || maxTimeParam || ingredientsParam);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="content-grid pt-24 md:pt-28 pb-16 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Recipe Catalog</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Search and filter authentic global recipes by cuisine, ingredients, and dietary restrictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-9 w-9 rounded-xl"
              aria-label="Grid view"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-9 w-9 rounded-xl"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 md:p-6 rounded-2xl border bg-card shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by recipe name or ingredients..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <Button type="submit" className="rounded-xl h-11 px-5 font-medium">
              Search
            </Button>
          </form>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-44">
              <Select 
                value={selectedCuisine} 
                onValueChange={(val) => {
                  setSelectedCuisine(val);
                  handleApplyFilter("cuisine", val);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="All Cuisines" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c === "all" ? "All Cuisines" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Diet pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
              {DIETS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setSelectedDiet(d.id);
                    handleApplyFilter("diet", d.id);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedDiet === d.id
                      ? "bg-primary text-primary-foreground font-semibold border-primary"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-destructive gap-1 ml-auto"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Found {recipes.length} recipe{recipes.length === 1 ? "" : "s"}</span>
          {ingredientsParam && (
            <span>Filtering by ingredients: <strong className="text-foreground">{ingredientsParam}</strong></span>
          )}
        </div>

        {/* Recipes Grid / List Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="aspect-[16/10] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {recipes.map((recipe) => (
              viewMode === "grid" ? (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  image={recipe.image}
                  cookTime={recipe.readyInMinutes}
                  calories={recipe.calories}
                  cuisine={recipe.cuisine}
                  diet={recipe.diet}
                  tags={recipe.tags}
                />
              ) : (
                <div 
                  key={recipe.id}
                  className="flex gap-4 p-4 rounded-2xl border bg-card hover:shadow-md transition-all group"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-28 w-28 md:h-36 md:w-36 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">{recipe.cuisine}</Badge>
                        {recipe.diet && recipe.diet !== "all" && (
                          <Badge variant="secondary" className="text-[10px] capitalize">{recipe.diet}</Badge>
                        )}
                      </div>
                      <Link to={`/recipe/${recipe.id}`} className="font-bold text-base md:text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {recipe.title}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {recipe.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-2">
                      <span>{recipe.readyInMinutes} mins &bull; {recipe.calories} kcal</span>
                      <Link to={`/recipe/${recipe.id}`} className="font-semibold text-primary hover:underline">
                        View Details &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 border border-dashed rounded-3xl space-y-4">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">No recipes matched your search</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Try loosening your filters or searching for common culinary staples like pasta, rice, or chicken.
              </p>
            </div>
            <Button variant="outline" onClick={clearAllFilters}>
              Reset All Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipeCategoryPage;
