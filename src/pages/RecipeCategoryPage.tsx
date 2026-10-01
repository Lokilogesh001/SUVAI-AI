import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag, Grid2X2, List, ChefHat, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/RecipeCard";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchRecipes, SpoonacularRecipe } from "@/services/spoonacularService";
import { useLanguage } from "@/contexts/LanguageContext";

const RECIPE_DATA = [
  {
    id: "1",
    title: "Pan-Seared Salmon with Lemon Butter",
    description: "Perfectly seared salmon fillets with a rich lemon butter sauce and fresh herbs.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 25,
    calories: 450,
    tags: ["Seafood", "Keto", "High Protein"],
    cuisine: "french",
    dietType: "non-vegetarian"
  },
  {
    id: "2",
    title: "Mediterranean Quinoa Bowl",
    description: "Nutritious quinoa topped with fresh vegetables, feta cheese, and a light vinaigrette.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 30,
    calories: 380,
    tags: ["Healthy", "Bowl"],
    cuisine: "mediterranean",
    dietType: "vegetarian"
  },
  {
    id: "3",
    title: "Classic Tiramisu",
    description: "Traditional Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 240,
    calories: 420,
    tags: ["Dessert", "Italian", "No-Bake"],
    cuisine: "italian",
    dietType: "vegetarian"
  },
  {
    id: "4",
    title: "Spicy Thai Basil Chicken",
    description: "A quick and flavorful stir-fry with chicken, Thai basil, and plenty of chili for heat.",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 20,
    calories: 410,
    tags: ["Asian", "Spicy", "Quick"],
    cuisine: "thai",
    dietType: "non-vegetarian"
  },
  {
    id: "5",
    title: "Avocado & Egg Breakfast Toast",
    description: "Creamy avocado spread on artisan toast topped with perfectly poached eggs.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 15,
    calories: 320,
    tags: ["Breakfast", "Vegetarian", "Quick"],
    cuisine: "american",
    dietType: "vegetarian"
  },
  {
    id: "6",
    title: "Butter Chicken",
    description: "Creamy and rich North Indian curry with tender chicken pieces in a tomato-based sauce.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 40,
    calories: 550,
    tags: ["Indian", "Curry", "Spicy"],
    cuisine: "indian",
    dietType: "non-vegetarian"
  },
  {
    id: "7",
    title: "Vegetable Pad Thai",
    description: "Classic Thai noodle dish with fresh vegetables, eggs, and a tangy tamarind sauce.",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 25,
    calories: 390,
    tags: ["Thai", "Noodles", "Stir-fry"],
    cuisine: "thai",
    dietType: "vegetarian"
  },
  {
    id: "8",
    title: "Beef Tacos",
    description: "Authentic Mexican tacos with seasoned ground beef, fresh salsa, and all the toppings.",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 30,
    calories: 480,
    tags: ["Mexican", "Street Food", "Spicy"],
    cuisine: "mexican",
    dietType: "non-vegetarian"
  },
  {
    id: "9",
    title: "Japanese Miso Ramen",
    description: "Rich and savory miso broth with fresh ramen noodles, soft-boiled eggs, and tender pork belly.",
    image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 45,
    calories: 520,
    tags: ["Japanese", "Soup", "Comfort Food"],
    cuisine: "japanese",
    dietType: "non-vegetarian"
  },
  {
    id: "10",
    title: "Mushroom Risotto",
    description: "Creamy Italian risotto with mixed wild mushrooms, white wine, and freshly grated Parmesan.",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 35,
    calories: 480,
    tags: ["Italian", "Vegetarian", "Comfort Food"],
    cuisine: "italian",
    dietType: "vegetarian"
  },
  {
    id: "11",
    title: "Greek Moussaka",
    description: "Traditional layered casserole with eggplant, spiced ground lamb, and creamy béchamel sauce.",
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 75,
    calories: 520,
    tags: ["Greek", "Casserole", "Comfort Food"],
    cuisine: "mediterranean",
    dietType: "non-vegetarian"
  },
  {
    id: "12",
    title: "Vegetable Biryani",
    description: "Fragrant basmati rice with mixed vegetables, aromatic spices, and fried onions.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 50,
    calories: 420,
    tags: ["Indian", "Rice", "Aromatic"],
    cuisine: "indian",
    dietType: "vegetarian"
  },
  {
    id: "13",
    title: "Chicken Fajitas",
    description: "Sizzling hot strips of marinated chicken with bell peppers and onions, served with warm tortillas.",
    image: "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 25,
    calories: 450,
    tags: ["Mexican", "Quick", "Family Meal"],
    cuisine: "mexican",
    dietType: "non-vegetarian"
  },
  {
    id: "14",
    title: "Berry Açaí Bowl",
    description: "Refreshing smoothie bowl with açaí, mixed berries, banana, and crunchy granola topping.",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 10,
    calories: 290,
    tags: ["Breakfast", "Vegan", "Healthy"],
    cuisine: "american",
    dietType: "vegetarian"
  },
  {
    id: "15",
    title: "Beef Bourguignon",
    description: "Classic French stew with tender beef, red wine, mushrooms, and pearl onions.",
    image: "https://images.unsplash.com/photo-1608877907149-a206d75ba011?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 180,
    calories: 590,
    tags: ["French", "Stew", "Slow-cooked"],
    cuisine: "french",
    dietType: "non-vegetarian"
  },
  {
    id: "16",
    title: "Sushi Rolls",
    description: "Fresh and delicate sushi rolls with premium seafood, vegetables, and seasoned rice.",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 60,
    calories: 350,
    tags: ["Japanese", "Seafood", "Elegant"],
    cuisine: "japanese",
    dietType: "non-vegetarian"
  }
];

const RecipeCategoryPage = () => {
  const { t } = useLanguage();
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [dietType, setDietType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiRecipes, setApiRecipes] = useState<SpoonacularRecipe[]>([]);
  const [useApi, setUseApi] = useState(true);

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

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const cuisine = selectedCuisine !== "all" ? selectedCuisine : undefined;
        const diet = dietType !== "all" ? dietType : undefined;
        
        const results = await searchRecipes({
          cuisine,
          diet,
          number: 16
        });
        
        setApiRecipes(results);
        setError(null);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes. Using sample data instead.");
        setUseApi(false);
      } finally {
        setLoading(false);
      }
    };

    if (useApi) {
      fetchRecipes();
    }
  }, [selectedCuisine, dietType, useApi]);

  const transformedApiRecipes = apiRecipes.map(recipe => ({
    id: recipe.id.toString(),
    title: recipe.title,
    description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : '',
    image: recipe.image,
    cookTime: recipe.readyInMinutes || 30,
    calories: recipe.nutrition?.nutrients.find(n => n.name === "Calories")?.amount || 400,
    tags: [...(recipe.dishTypes || []), ...(recipe.diets || [])].slice(0, 3),
    cuisine: selectedCuisine !== "all" ? selectedCuisine : "various",
    dietType: dietType !== "all" ? dietType : "various"
  }));

  const filteredRecipes = useApi && !error ? transformedApiRecipes : RECIPE_DATA.filter((recipe) => {
    const cuisineMatch = selectedCuisine === "all" || recipe.cuisine === selectedCuisine;
    const dietMatch = dietType === "all" || recipe.dietType === dietType;
    return cuisineMatch && dietMatch;
  });

  const loadingPlaceholders = Array(8).fill(0).map((_, index) => ({
    id: `loading-${index}`,
    isLoading: true
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <ChefHat className="h-8 w-8" />
              {t("nav.recipes")}
            </h1>
            <p className="text-muted-foreground">
              {t("recipes.subtitle")}
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">API Error</h3>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t("assistant.cuisine")}
            </label>
            <Select 
              value={selectedCuisine} 
              onValueChange={(value) => {
                setSelectedCuisine(value);
                setUseApi(true);
              }}
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
                onClick={() => {
                  setDietType("all");
                  setUseApi(true);
                }}
                className="flex-1"
              >
                {t("assistant.all")}
              </Button>
              <Button 
                variant={dietType === "vegetarian" ? "default" : "outline"} 
                onClick={() => {
                  setDietType("vegetarian");
                  setUseApi(true);
                }}
                className="flex-1"
              >
                {t("assistant.vegetarian")}
              </Button>
              <Button 
                variant={dietType === "non-vegetarian" ? "default" : "outline"} 
                onClick={() => {
                  setDietType("non-vegetarian");
                  setUseApi(true);
                }}
                className="flex-1"
              >
                {t("assistant.nonvegetarian")}
              </Button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"}>
            {loadingPlaceholders.map((placeholder) => (
              <div key={placeholder.id} className="animate-pulse">
                {viewMode === "grid" ? (
                  <div className="rounded-xl overflow-hidden">
                    <div className="aspect-square bg-muted"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-muted rounded-full"></div>
                        <div className="h-6 w-16 bg-muted rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex border rounded-xl overflow-hidden">
                    <div className="w-1/3 h-40 bg-muted"></div>
                    <div className="w-2/3 p-4 space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-muted rounded-full"></div>
                        <div className="h-6 w-16 bg-muted rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find more recipes
            </p>
          </div>
        ) : (
          <div className={`animate-fade-in ${
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
          }`}>
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id}>
                {viewMode === "grid" ? (
                  <RecipeCard
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image}
                    cookTime={recipe.cookTime}
                    calories={recipe.calories}
                    tags={recipe.tags}
                  />
                ) : (
                  <Link to={`/recipe/${recipe.id}`} className="block">
                    <div className="flex border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                      <div 
                        className="w-1/3 h-40"
                        style={{ 
                          backgroundImage: `url(${recipe.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <div className="w-2/3 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {recipe.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {recipe.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span>{recipe.cookTime} min</span>
                          <span>{recipe.calories} kcal</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCategoryPage;
