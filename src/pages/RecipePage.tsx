import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RecipeDetail from "@/components/RecipeDetail";
import { useLanguage } from "@/contexts/LanguageContext";

// Sample recipes data for fallback
const sampleRecipes = {
  "1": {
    id: "1",
    title: "Pan-Seared Salmon with Lemon Butter",
    description: "Perfectly seared salmon fillets with a rich lemon butter sauce, flavored with garlic and fresh herbs for a restaurant-quality meal at home.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    calories: 450,
    difficulty: "Medium",
    tags: ["Seafood", "Keto", "High Protein", "Dinner"],
    ingredients: [
      { name: "salmon fillets", amount: "4 (6oz)" },
      { name: "salt", amount: "1 tsp" },
      { name: "black pepper", amount: "½ tsp" },
      { name: "olive oil", amount: "2 tbsp" },
      { name: "unsalted butter", amount: "3 tbsp" },
      { name: "garlic cloves, minced", amount: "3" },
      { name: "lemon, juiced", amount: "1" },
      { name: "fresh dill, chopped", amount: "2 tbsp" },
      { name: "lemon wedges", amount: "for serving" },
    ],
    steps: [
      "Pat the salmon fillets dry with a paper towel. Season both sides with salt and black pepper.",
      "Heat olive oil in a large skillet over medium-high heat until shimmering.",
      "Add the salmon to the skillet, skin-side down (if applicable). Cook for 4-5 minutes without moving to get a crispy skin.",
      "Flip the salmon and cook for an additional 3-4 minutes, or until it reaches your desired level of doneness.",
      "Reduce heat to medium-low. Add butter and garlic to the pan and let the butter melt.",
      "Spoon the garlic butter over the salmon repeatedly for about 1 minute.",
      "Add lemon juice and sprinkle with fresh dill.",
      "Remove from heat and let rest for 1-2 minutes.",
      "Serve with lemon wedges and additional fresh herbs if desired.",
    ],
    author: {
      name: "Chef Michael",
      image: "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
    },
    nutritionalInfo: {
      calories: 450,
      protein: 35,
      carbs: 3,
      fat: 32,
      fiber: 1,
      sugar: 0
    }
  },
  "2": {
    id: "2",
    title: "Mediterranean Quinoa Bowl",
    description: "A vibrant and nutritious bowl featuring protein-rich quinoa, colorful vegetables, tangy feta cheese, and a light Mediterranean dressing.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    calories: 380,
    difficulty: "Easy",
    tags: ["Vegetarian", "Healthy", "Bowl", "Lunch"],
    ingredients: [
      { name: "quinoa", amount: "1 cup" },
      { name: "vegetable broth", amount: "2 cups" },
      { name: "cucumber, diced", amount: "1" },
      { name: "cherry tomatoes, halved", amount: "1 cup" },
      { name: "red bell pepper, diced", amount: "1" },
      { name: "red onion, thinly sliced", amount: "½" },
      { name: "kalamata olives, pitted", amount: "½ cup" },
      { name: "feta cheese, crumbled", amount: "½ cup" },
      { name: "extra virgin olive oil", amount: "3 tbsp" },
      { name: "lemon juice", amount: "2 tbsp" },
      { name: "garlic clove, minced", amount: "1" },
      { name: "dried oregano", amount: "1 tsp" },
      { name: "salt", amount: "to taste" },
      { name: "black pepper", amount: "to taste" },
      { name: "fresh parsley, chopped", amount: "¼ cup" },
    ],
    steps: [
      "Rinse quinoa under cold water until water runs clear.",
      "In a medium saucepan, bring vegetable broth to a boil. Add quinoa, reduce heat, cover, and simmer for 15 minutes until tender and liquid is absorbed.",
      "Fluff quinoa with a fork and let cool to room temperature.",
      "In a small bowl, whisk together olive oil, lemon juice, garlic, oregano, salt, and pepper to make the dressing.",
      "In a large bowl, combine cooled quinoa, cucumber, tomatoes, bell pepper, red onion, and olives.",
      "Drizzle with the dressing and toss gently to combine.",
      "Fold in crumbled feta cheese and fresh parsley.",
      "Taste and adjust seasoning if needed.",
      "Serve chilled or at room temperature.",
    ],
    author: {
      name: "Chef Sophia",
      image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
    },
    nutritionalInfo: {
      calories: 380,
      protein: 12,
      carbs: 45,
      fat: 18,
      fiber: 6,
      sugar: 3
    }
  },
  "3": {
    id: "3",
    title: "Classic Tiramisu",
    description: "An authentic Italian dessert with layers of coffee-soaked ladyfingers and creamy mascarpone, dusted with cocoa for a perfect finish.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    prepTime: 30,
    cookTime: 0,
    servings: 8,
    calories: 420,
    difficulty: "Medium",
    tags: ["Dessert", "Italian", "No-Bake"],
    ingredients: [
      { name: "egg yolks", amount: "6" },
      { name: "granulated sugar", amount: "¾ cup" },
      { name: "mascarpone cheese", amount: "16 oz" },
      { name: "heavy cream", amount: "1½ cups" },
      { name: "vanilla extract", amount: "1 tsp" },
      { name: "strong brewed coffee, cooled", amount: "1½ cups" },
      { name: "coffee liqueur (optional)", amount: "¼ cup" },
      { name: "ladyfinger cookies", amount: "24-30" },
      { name: "unsweetened cocoa powder", amount: "for dusting" },
      { name: "dark chocolate, shaved", amount: "for garnish" },
    ],
    steps: [
      "In a heatproof bowl, whisk egg yolks and sugar together until pale yellow.",
      "Set the bowl over a pot of simmering water (double boiler) and continue whisking for about 10 minutes, until the mixture thickens slightly. Remove from heat and let cool.",
      "In a separate bowl, beat the mascarpone cheese until smooth, then fold it into the cooled egg mixture.",
      "In another bowl, whip the heavy cream and vanilla extract until stiff peaks form.",
      "Gently fold the whipped cream into the mascarpone-egg mixture until fully incorporated.",
      "In a shallow dish, combine the cooled coffee and coffee liqueur (if using).",
      "Quickly dip each ladyfinger into the coffee mixture (don't soak them), and arrange in a single layer in a 9x13 inch dish.",
      "Spread half of the mascarpone mixture over the ladyfingers.",
      "Repeat with another layer of dipped ladyfingers and the remaining mascarpone mixture.",
      "Cover and refrigerate for at least 4 hours, preferably overnight.",
      "Before serving, dust generously with cocoa powder and garnish with shaved chocolate.",
    ],
    author: {
      name: "Chef Marco",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
    },
    nutritionalInfo: {
      calories: 420,
      protein: 7,
      carbs: 36,
      fat: 28,
      fiber: 1,
      sugar: 25
    }
  },
  "4": {
    id: "4",
    title: "Spicy Thai Basil Chicken",
    description: "A vibrant stir-fry dish packed with the aromatic flavors of Thai basil, chili, and garlic, creating the perfect balance of spicy, sweet, and savory.",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    calories: 410,
    difficulty: "Easy",
    tags: ["Asian", "Spicy", "Quick", "Dinner"],
    ingredients: [
      { name: "boneless chicken thighs, thinly sliced", amount: "1 lb" },
      { name: "vegetable oil", amount: "2 tbsp" },
      { name: "garlic cloves, minced", amount: "4" },
      { name: "Thai bird's eye chilies, minced", amount: "3-5" },
      { name: "shallots, thinly sliced", amount: "3" },
      { name: "red bell pepper, sliced", amount: "1" },
      { name: "fish sauce", amount: "2 tbsp" },
      { name: "oyster sauce", amount: "1 tbsp" },
      { name: "soy sauce", amount: "1 tbsp" },
      { name: "brown sugar", amount: "2 tsp" },
      { name: "Thai basil leaves", amount: "2 cups" },
      { name: "lime juice", amount: "1 tbsp" },
      { name: "cooked jasmine rice", amount: "for serving" },
    ],
    steps: [
      "Heat a wok or large skillet over high heat. Add the vegetable oil and swirl to coat.",
      "Add the minced garlic, chilies, and shallots. Stir-fry for 30 seconds until fragrant.",
      "Add the sliced chicken and stir-fry for 3-4 minutes until it begins to brown.",
      "Add the bell pepper and continue stir-frying for another 2 minutes.",
      "In a small bowl, mix together the fish sauce, oyster sauce, soy sauce, and brown sugar. Pour into the wok.",
      "Continue to stir-fry for 1-2 minutes until the chicken is fully cooked and the sauce has thickened slightly.",
      "Remove from heat and stir in the Thai basil leaves and lime juice. The heat will wilt the basil.",
      "Serve immediately over jasmine rice.",
    ],
    author: {
      name: "Chef Niran",
      image: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
    },
    nutritionalInfo: {
      calories: 410,
      protein: 32,
      carbs: 15,
      fat: 24,
      fiber: 2,
      sugar: 6
    }
  },
  "5": {
    id: "5",
    title: "Avocado & Egg Breakfast Toast",
    description: "A nourishing breakfast featuring creamy avocado spread on artisanal bread, topped with perfectly poached eggs and a sprinkle of microgreens.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    prepTime: 10,
    cookTime: 5,
    servings: 2,
    calories: 320,
    difficulty: "Easy",
    tags: ["Breakfast", "Vegetarian", "Quick", "Healthy"],
    ingredients: [
      { name: "ripe avocados", amount: "1 large" },
      { name: "lemon juice", amount: "1 tsp" },
      { name: "red pepper flakes", amount: "¼ tsp" },
      { name: "salt", amount: "to taste" },
      { name: "black pepper", amount: "to taste" },
      { name: "large eggs", amount: "2" },
      { name: "white vinegar", amount: "1 tbsp" },
      { name: "artisan bread slices", amount: "2" },
      { name: "extra virgin olive oil", amount: "1 tsp" },
      { name: "microgreens or fresh herbs", amount: "for garnish" },
    ],
    steps: [
      "Toast the bread slices until golden brown. Drizzle with a little olive oil.",
      "In a small bowl, mash the avocado with lemon juice, salt, and pepper.",
      "Fill a medium pot with water (about 3 inches deep) and add vinegar. Bring to a gentle simmer.",
      "Crack an egg into a small bowl. Create a gentle whirlpool in the simmering water and carefully slip the egg into the center.",
      "Cook for 3 minutes for a runny yolk. Repeat with the second egg.",
      "Using a slotted spoon, remove the poached eggs and place on a paper towel to drain excess water.",
      "Spread the mashed avocado evenly on the toast slices.",
      "Top each toast with a poached egg, sprinkle with red pepper flakes, additional salt and pepper to taste.",
      "Garnish with microgreens or fresh herbs and serve immediately.",
    ],
    author: {
      name: "Chef Emma",
      image: "https://images.unsplash.com/photo-1607631568661-fde17d7c224c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
    },
    nutritionalInfo: {
      calories: 320,
      protein: 14,
      carbs: 25,
      fat: 20,
      fiber: 8,
      sugar: 2
    }
  }
};

const RecipePage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  
  // In a real app, you'd fetch the recipe data based on the ID
  console.log("Recipe ID:", id);
  
  // Check if we should use the API or sample data
  const useApiRecipe = id && !isNaN(Number(id));
  
  // If using API, we'll pass the minimum required props and let RecipeDetail handle the rest
  // Otherwise, get the recipe from the sampleRecipes object based on the id
  const recipe = useApiRecipe 
    ? {
        title: "Loading...",
        description: "Loading recipe details...",
        image: "https://placeholder.pics/svg/400x300/DEDEDE/555555/Loading...",
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        calories: 0,
        difficulty: "Medium",
        tags: [],
        ingredients: [],
        steps: [],
      }
    : id && sampleRecipes[id] 
        ? sampleRecipes[id] 
        : sampleRecipes["1"];
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <RecipeDetail {...recipe} apiRecipe={useApiRecipe} />
      </main>
    </div>
  );
};

export default RecipePage;
