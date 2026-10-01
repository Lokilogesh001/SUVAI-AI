import { Recipe } from "@/types/recipe";
import { recipeService } from "../recipes/recipeService";
import { RecommendationContext } from "./types";

// Common allergy mapping to ingredients
const ALLERGEN_KEYWORD_MAP: Record<string, string[]> = {
  peanuts: ["peanut", "groundnut", "peanut butter", "arachis"],
  "tree nuts": ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "macadamia"],
  dairy: ["milk", "butter", "cheese", "cream", "yogurt", "ghee", "paneer", "heavy cream", "parmesan", "feta"],
  "gluten / wheat": ["flour", "wheat", "bread", "pasta", "spaghetti", "noodle", "semolina", "barley", "rye"],
  gluten: ["flour", "wheat", "bread", "pasta", "spaghetti", "noodle", "semolina", "barley", "rye"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "mussel", "clam", "oyster", "squid"],
  fish: ["salmon", "tuna", "cod", "tilapia", "anchovy", "fish sauce", "sardine", "halibut"],
  eggs: ["egg", "egg yolk", "egg white", "mayonnaise"],
  soy: ["soy", "soya", "tofu", "edamame", "soy sauce", "tamari", "miso"],
  sesame: ["sesame", "tahini"],
};

export async function generateCandidates(context: RecommendationContext): Promise<Recipe[]> {
  // 1. Gather a wide pool of candidate recipes
  const seedPool = recipeService.getAllSeedRecipes();

  // If user has specific cuisines or dietary needs, query the service for more candidates
  const candidatePoolMap = new Map<string, Recipe>();
  seedPool.forEach((r) => candidatePoolMap.set(r.id, r));

  const preferredDiet = context.preferences?.diet;
  if (preferredDiet && preferredDiet !== "all") {
    const dietCandidates = await recipeService.search({ diet: preferredDiet, number: 12 });
    dietCandidates.forEach((r) => candidatePoolMap.set(r.id, r));
  }

  if (context.availableIngredients?.length) {
    const ingredientCandidates = await recipeService.search({
      includeIngredients: context.availableIngredients,
      number: 12,
    });
    ingredientCandidates.forEach((r) => candidatePoolMap.set(r.id, r));
  }

  const allCandidates = Array.from(candidatePoolMap.values());

  // 2. HARD CONSTRAINT FILTERING (Strict Exclusions)
  return allCandidates.filter((recipe) => passesHardFilters(recipe, context));
}

export function passesHardFilters(recipe: Recipe, context: RecommendationContext): boolean {
  const preferences = context.preferences;
  if (!preferences) return true;

  // A. Dietary restriction hard check
  const diet = preferences.diet;
  if (diet === "vegetarian" || diet === "vegan" || diet === "eggetarian" || diet === "pescatarian") {
    const recipeDiet = recipe.diet.toLowerCase();
    const recipeDishTypes = recipe.dishTypes.map((d) => d.toLowerCase());
    const isMeatRecipe = recipeDishTypes.some((d) => d.includes("meat") || d.includes("chicken") || d.includes("pork") || d.includes("beef"));

    if (diet === "vegan" && recipeDiet !== "vegan") {
      return false;
    }

    if (diet === "vegetarian") {
      if (recipeDiet !== "vegetarian" && recipeDiet !== "vegan") return false;
      if (isMeatRecipe) return false;
    }

    if (diet === "eggetarian") {
      if (recipeDiet !== "vegetarian" && recipeDiet !== "vegan" && recipeDiet !== "eggetarian") return false;
      if (isMeatRecipe) return false;
    }

    if (diet === "pescatarian") {
      if (isMeatRecipe && !recipe.tags.some((t) => t.toLowerCase().includes("seafood") || t.toLowerCase().includes("fish"))) {
        return false;
      }
    }
  }

  // B. Allergy hard check (zero tolerance)
  if (preferences.allergies && preferences.allergies.length > 0) {
    for (const allergy of preferences.allergies) {
      const allergyLower = allergy.toLowerCase();
      const forbiddenKeywords = ALLERGEN_KEYWORD_MAP[allergyLower] || [allergyLower];

      for (const ingredient of recipe.ingredients) {
        const ingName = ingredient.name.toLowerCase();
        const conflict = forbiddenKeywords.some((keyword) => ingName.includes(keyword));
        if (conflict) {
          // Exclude immediately
          return false;
        }
      }
    }
  }

  return true;
}
