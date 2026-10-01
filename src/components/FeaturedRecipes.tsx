import { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";
import { getRandomRecipes, searchRecipes } from "@/services/spoonacularService";
import { toast } from "sonner";

interface FeaturedRecipesProps {
  category?: string;
}

// Sample data for fallback
const FEATURED_RECIPES = [
  {
    id: "1",
    title: "Pan-Seared Salmon with Lemon Butter",
    description: "Perfectly seared salmon fillets with a rich lemon butter sauce and fresh herbs.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 25,
    calories: 450,
    tags: ["Seafood", "Keto", "High Protein"],
    isFeatured: true,
  },
  {
    id: "2",
    title: "Mediterranean Quinoa Bowl",
    description: "Nutritious quinoa topped with fresh vegetables, feta cheese, and a light vinaigrette.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 30,
    calories: 380,
    tags: ["Vegetarian", "Healthy", "Bowl"],
  },
  {
    id: "3",
    title: "Classic Tiramisu",
    description: "Traditional Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 240,
    calories: 420,
    tags: ["Dessert", "Italian", "No-Bake"],
  },
  {
    id: "4",
    title: "Spicy Thai Basil Chicken",
    description: "A quick and flavorful stir-fry with chicken, Thai basil, and plenty of chili for heat.",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 20,
    calories: 410,
    tags: ["Asian", "Spicy", "Quick"],
  },
  {
    id: "5",
    title: "Avocado & Egg Breakfast Toast",
    description: "Creamy avocado spread on artisan toast topped with perfectly poached eggs.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 15,
    calories: 320,
    tags: ["Breakfast", "Vegetarian", "Quick"],
  },
  {
    id: "6",
    title: "Japanese Miso Ramen",
    description: "Rich and savory miso broth with fresh ramen noodles, soft-boiled eggs, and tender pork belly.",
    image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 45,
    calories: 520,
    tags: ["Japanese", "Soup", "Comfort Food"],
  },
  {
    id: "7",
    title: "Berry Açaí Bowl",
    description: "Refreshing smoothie bowl with açaí, mixed berries, banana, and crunchy granola topping.",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 10,
    calories: 290,
    tags: ["Breakfast", "Vegan", "Healthy"],
  },
  {
    id: "8",
    title: "Mushroom Risotto",
    description: "Creamy Italian risotto with mixed wild mushrooms, white wine, and freshly grated Parmesan.",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    cookTime: 35,
    calories: 480,
    tags: ["Italian", "Vegetarian", "Comfort Food"],
  },
];

const FeaturedRecipes = ({ category = "all" }: FeaturedRecipesProps) => {
  const [recipes, setRecipes] = useState(FEATURED_RECIPES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        
        let data;
        
        switch(category) {
          case "all":
            data = await getRandomRecipes(8);
            break;
          
          case "breakfast":
          case "lunch":
          case "dinner":
          case "desserts":
            // For meal types, use direct search
            const searchTerm = category === "desserts" ? "dessert" : category;
            data = await searchRecipes({ query: searchTerm, number: 8 });
            break;
          
          case "vegetarian":
          case "vegan":
            // For dietary preferences, use diet parameter
            data = await searchRecipes({ 
              diet: category, 
              number: 8 
            });
            break;
          
          case "gluten-free":
            // Special handling for gluten-free
            data = await searchRecipes({ 
              diet: "glutenFree", 
              number: 8 
            });
            break;
          
          case "keto":
            // Keto diet search
            data = await searchRecipes({ 
              diet: "ketogenic", 
              number: 8 
            });
            break;
          
          case "quick":
            // Fetch quick recipes (ready in under 30 minutes)
            const quickRecipes = await getRandomRecipes(12);
            data = quickRecipes.filter(recipe => recipe.readyInMinutes <= 30).slice(0, 8);
            break;
          
          default:
            // For any other category
            data = await getRandomRecipes(8);
        }
        
        if (data && data.length > 0) {
          // Transform API data to match our card format
          const transformedData = data.map(recipe => ({
            id: recipe.id.toString(),
            title: recipe.title,
            description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : '',
            image: recipe.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200`,
            cookTime: recipe.readyInMinutes || 30,
            calories: recipe.nutrition?.nutrients.find(n => n.name === "Calories")?.amount || 400,
            tags: [...(recipe.dishTypes || []), ...(recipe.diets || [])].slice(0, 3),
            isFeatured: recipe.veryPopular || false
          }));
          
          setRecipes(transformedData);
          setError(null);
          
          if (transformedData.length === 0) {
            toast.info("No recipes found for this category, showing default recipes");
          }
        } else {
          // If no results, keep using sample data
          toast.info("No recipes found for this category, showing default recipes");
          setError("No recipes found. Using sample data instead.");
        }
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes. Using sample data instead.");
        toast.error("Error loading recipes, showing default recipes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, [category]); // Re-fetch when category changes
  
  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(8).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    console.log(error); // Log error but don't show to user, use fallback data instead
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description}
            image={recipe.image}
            cookTime={recipe.cookTime}
            calories={recipe.calories}
            tags={recipe.tags}
            isFeatured={recipe.isFeatured}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedRecipes;
