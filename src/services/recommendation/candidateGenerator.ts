import { Recipe } from "@/types/recipe";
import { recipeService } from "../recipes/recipeService";
import { RecommendationContext } from "./types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Comprehensive, conservative allergen dictionary (Section 14)
const ALLERGEN_KEYWORD_MAP: Record<string, string[]> = {
  peanuts: ["peanut", "groundnut", "peanut butter", "peanut oil", "arachis", "satay"],
  "tree nuts": ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "macadamia", "brazil nut", "chestnut", "praline", "marzipan"],
  dairy: ["milk", "butter", "cheese", "cream", "yogurt", "ghee", "paneer", "heavy cream", "parmesan", "feta", "casein", "whey", "curd", "cheddar", "mozzarella"],
  "gluten / wheat": ["flour", "wheat", "bread", "pasta", "spaghetti", "noodle", "semolina", "barley", "rye", "couscous", "breadcrumb", "gluten"],
  gluten: ["flour", "wheat", "bread", "pasta", "spaghetti", "noodle", "semolina", "barley", "rye", "couscous", "breadcrumb", "gluten"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "mussel", "clam", "oyster", "squid", "calamari", "scallop", "crayfish"],
  fish: ["salmon", "tuna", "cod", "tilapia", "anchovy", "fish sauce", "sardine", "halibut", "mackerel", "trout", "bass", "snapper"],
  eggs: ["egg", "eggs", "yolk", "egg white", "mayonnaise", "albumen"],
  soy: ["soy", "soya", "tofu", "edamame", "soy sauce", "tamari", "miso", "tempeh"],
  sesame: ["sesame", "tahini", "sesame oil", "sesame seed"],
};

export async function generateCandidates(context: RecommendationContext): Promise<Recipe[]> {
  const candidatePoolMap = new Map<string, Recipe>();

  // 1. Gather a wide pool of candidate recipes from Supabase
  if (isSupabaseConfigured) {
    try {
      const preferredDiet = context.preferences?.diet;
      const cuisines = context.preferences?.favorite_cuisines || [];

      // A. Query favorite cuisine matches
      if (cuisines.length > 0) {
        for (const cuisine of cuisines.slice(0, 3)) {
          const results = await recipeService.search({ cuisine, number: 18 });
          results.forEach((r) => candidatePoolMap.set(r.id, r));
        }
      }

      // B. Query diet-specific candidates
      if (preferredDiet && preferredDiet !== "all") {
        const dietResults = await recipeService.search({ diet: preferredDiet, number: 24 });
        dietResults.forEach((r) => candidatePoolMap.set(r.id, r));
      }

      // C. Query pantry ingredient candidates if available
      if (context.availableIngredients && context.availableIngredients.length > 0) {
        const ingResults = await recipeService.search({
          includeIngredients: context.availableIngredients,
          number: 18,
        });
        ingResults.forEach((r) => candidatePoolMap.set(r.id, r));
      }

      // D. Exploration candidates (20-30% variety from diverse cuisines)
      const exploration = await recipeService.getRandom(20);
      exploration.forEach((r) => candidatePoolMap.set(r.id, r));

    } catch (err) {
      console.warn("Error gathering candidate recipes from Supabase:", err);
    }
  }

  // Fallback to local catalog if Supabase returned few
  if (candidatePoolMap.size < 10) {
    const seedPool = recipeService.getAllSeedRecipes();
    seedPool.forEach((r) => candidatePoolMap.set(r.id, r));
  }

  const allCandidates = Array.from(candidatePoolMap.values());

  // 2. HARD CONSTRAINT FILTERING (Conservative Zero-Tolerance Exclusions)
  return allCandidates.filter((recipe) => passesHardFilters(recipe, context));
}

export function passesHardFilters(recipe: Recipe, context: RecommendationContext): boolean {
  const preferences = context.preferences;
  if (!preferences) return true;

  // A. Dietary restriction hard check
  const diet = (preferences.diet || "").toLowerCase();
  if (diet === "vegetarian" || diet === "vegan" || diet === "eggetarian" || diet === "pescatarian") {
    const recipeDiet = (recipe.diet || "").toLowerCase();
    const recipeDishTypes = recipe.dishTypes.map((d) => d.toLowerCase());
    const isMeatRecipe = recipeDishTypes.some((d) => 
      d.includes("meat") || d.includes("chicken") || d.includes("pork") || d.includes("beef") || d.includes("lamb")
    );

    // Check ingredients for meat/poultry
    const meatIngredients = ["chicken", "beef", "pork", "lamb", "mutton", "bacon", "sausage", "turkey", "duck", "veal", "ham", "prosciutto"];
    const containsMeat = recipe.ingredients.some((ing) => 
      meatIngredients.some((m) => ing.name.toLowerCase().includes(m))
    );

    if (diet === "vegan") {
      if (recipeDiet !== "vegan") return false;
      if (isMeatRecipe || containsMeat) return false;
      const dairyEggKeywords = ["milk", "butter", "cheese", "cream", "yogurt", "ghee", "egg", "honey"];
      if (recipe.ingredients.some((ing) => dairyEggKeywords.some((d) => ing.name.toLowerCase().includes(d)))) {
        return false;
      }
    }

    if (diet === "vegetarian") {
      if (recipeDiet !== "vegetarian" && recipeDiet !== "vegan") return false;
      if (isMeatRecipe || containsMeat) return false;
      // Exclude fish/seafood
      const seafoodKeywords = ["fish", "salmon", "tuna", "prawn", "shrimp", "cod", "crab", "lobster"];
      if (recipe.ingredients.some((ing) => seafoodKeywords.some((s) => ing.name.toLowerCase().includes(s)))) {
        return false;
      }
    }

    if (diet === "eggetarian") {
      if (recipeDiet !== "vegetarian" && recipeDiet !== "vegan" && recipeDiet !== "eggetarian") return false;
      if (isMeatRecipe || containsMeat) return false;
    }

    if (diet === "pescatarian") {
      if (isMeatRecipe || containsMeat) return false;
    }
  }

  // B. Allergy hard check (zero tolerance with conservative keywords)
  if (preferences.allergies && preferences.allergies.length > 0) {
    for (const allergy of preferences.allergies) {
      const allergyLower = allergy.toLowerCase().trim();
      const forbiddenKeywords = ALLERGEN_KEYWORD_MAP[allergyLower] || [allergyLower];

      for (const ingredient of recipe.ingredients) {
        const ingName = ingredient.name.toLowerCase();
        const conflict = forbiddenKeywords.some((keyword) => ingName.includes(keyword));
        if (conflict) {
          return false;
        }
      }
    }
  }

  // C. Disliked ingredients hard exclusion
  if (preferences.disliked_ingredients && preferences.disliked_ingredients.length > 0) {
    for (const dislike of preferences.disliked_ingredients) {
      const dislikedLower = dislike.toLowerCase().trim();
      if (!dislikedLower) continue;

      const hasDisliked = recipe.ingredients.some((ing) => 
        ing.name.toLowerCase().includes(dislikedLower)
      );
      if (hasDisliked) {
        return false;
      }
    }
  }

  return true;
}
