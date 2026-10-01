
import { useState, useEffect } from "react";
import { 
  Clock, 
  Users, 
  ChefHat, 
  Flame, 
  Share2, 
  Bookmark, 
  Star, 
  Printer,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import VoiceGuide from "./VoiceGuide";
import { getRecipeById, SpoonacularRecipeDetailed } from "@/services/spoonacularService";
import { useParams } from "react-router-dom";

interface Ingredient {
  name: string;
  amount: string;
}

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

interface RecipeDetailProps {
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  difficulty: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  author?: {
    name: string;
    image: string;
  };
  nutritionalInfo?: NutritionalInfo;
  apiRecipe?: boolean;
}

const RecipeDetail = ({
  title,
  description,
  image,
  prepTime,
  cookTime,
  servings,
  calories,
  difficulty,
  tags,
  ingredients,
  steps,
  author = {
    name: "Chef",
    image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
  },
  nutritionalInfo = {
    calories,
    protein: 25,
    carbs: 35,
    fat: 15,
    fiber: 8,
    sugar: 5
  },
  apiRecipe = false,
}: RecipeDetailProps) => {
  const [savedRecipe, setSavedRecipe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<SpoonacularRecipeDetailed | null>(null);
  const { id } = useParams();
  
  useEffect(() => {
    // Only fetch from API if apiRecipe flag is true
    if (apiRecipe && id) {
      const fetchRecipe = async () => {
        setLoading(true);
        try {
          const data = await getRecipeById(id);
          setRecipe(data);
          setError(null);
        } catch (err) {
          setError("Failed to load recipe. Please try again later.");
          console.error("Error fetching recipe:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchRecipe();
    }
  }, [id, apiRecipe]);
  
  const toggleSave = () => {
    setSavedRecipe(!savedRecipe);
  };

  // If loading from API but not ready yet
  if (apiRecipe && loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-12 bg-muted rounded-lg w-3/4 mx-auto"></div>
          <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // If error loading from API
  if (apiRecipe && error) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
        <p className="mb-6">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // When using API data, transform it to match our format
  let displayTitle = title;
  let displayImage = image;
  let displayDescription = description;
  let displayPrepTime = prepTime;
  let displayCookTime = cookTime;
  let displayServings = servings;
  let displayTags = tags;
  let displayCalories = calories;
  let displayIngredients = ingredients;
  let displaySteps = steps;
  let displayNutritionalInfo = nutritionalInfo;

  if (apiRecipe && recipe) {
    displayTitle = recipe.title;
    displayImage = recipe.image;
    displayDescription = recipe.summary.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
    displayPrepTime = Math.round(recipe.readyInMinutes / 3); // Estimate prep time
    displayCookTime = recipe.readyInMinutes;
    displayServings = recipe.servings;
    displayTags = [...(recipe.dishTypes || []), ...(recipe.diets || [])].slice(0, 5);
    
    // Get calories from nutrition data if available
    displayCalories = recipe.nutrition?.nutrients.find(n => n.name === "Calories")?.amount || calories;
    
    // Transform ingredients
    displayIngredients = recipe.extendedIngredients.map(ing => ({
      name: ing.name,
      amount: `${ing.amount} ${ing.unit}`,
    }));
    
    // Transform steps
    displaySteps = recipe.analyzedInstructions[0]?.steps.map(s => s.step) || [];
    
    // Transform nutritional info
    if (recipe.nutrition) {
      const findNutrient = (name: string) => {
        const nutrient = recipe.nutrition?.nutrients.find(n => n.name === name);
        return nutrient ? Math.round(nutrient.amount) : 0;
      };
      
      displayNutritionalInfo = {
        calories: findNutrient("Calories"),
        protein: findNutrient("Protein"),
        carbs: findNutrient("Carbohydrates"),
        fat: findNutrient("Fat"),
        fiber: findNutrient("Fiber"),
        sugar: findNutrient("Sugar")
      };
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden mb-8 animate-fade-in">
        <img 
          src={displayImage} 
          alt={displayTitle} 
          className="w-full h-[50vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {displayTags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-white/20 text-white hover:bg-white/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            {displayTitle}
          </h1>
          
          <p className="text-white/80 text-lg mb-4 max-w-3xl">
            {displayDescription}
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <img 
                src={author.image} 
                alt={author.name} 
                className="w-10 h-10 rounded-full border-2 border-white mr-2"
              />
              <span className="text-white">{author.name}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Prep Time</div>
                <div className="font-medium">{displayPrepTime} min</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <ChefHat className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Cook Time</div>
                <div className="font-medium">{displayCookTime} min</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Servings</div>
                <div className="font-medium">{displayServings}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Calories</div>
                <div className="font-medium">{displayNutritionalInfo.calories} kcal</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={toggleSave}
            >
              <Bookmark 
                className={`h-4 w-4 ${savedRecipe ? "fill-primary" : ""}`} 
              />
              {savedRecipe ? "Saved" : "Save"}
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>

          <Tabs defaultValue="ingredients" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ingredients" className="py-4">
              <ul className="space-y-2">
                {displayIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-medium">{ingredient.amount}</span>
                    <span>{ingredient.name}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="instructions" className="py-4">
              <ol className="space-y-6">
                {displaySteps.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <div 
                      className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary"
                    >
                      {index + 1}
                    </div>
                    <div className="pt-1">
                      <p>{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </TabsContent>
            
            <TabsContent value="nutrition" className="py-4">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Nutritional Information
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-background rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-primary">{displayNutritionalInfo.calories}</div>
                    <div className="text-sm text-muted-foreground">Calories (kcal)</div>
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-primary">{displayNutritionalInfo.protein}g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-primary">{displayNutritionalInfo.carbs}g</div>
                    <div className="text-sm text-muted-foreground">Carbohydrates</div>
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-primary">{displayNutritionalInfo.fat}g</div>
                    <div className="text-sm text-muted-foreground">Fat</div>
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-primary">{displayNutritionalInfo.fiber}g</div>
                    <div className="text-sm text-muted-foreground">Fiber</div>
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-primary">{displayNutritionalInfo.sugar}g</div>
                    <div className="text-sm text-muted-foreground">Sugar</div>
                  </div>
                </div>
                
                <div className="mt-6 text-sm text-muted-foreground">
                  <p>* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-8" />
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">Rate this recipe</h2>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="h-6 w-6 text-muted cursor-pointer hover:text-yellow-400 transition-default"
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <VoiceGuide steps={displaySteps} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
