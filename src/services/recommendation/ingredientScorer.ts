import { Recipe, RecommendationReason } from "@/types/recipe";

// Simple ingredient normalizer (stemmer & cleaner)
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(fresh|dry|dried|chopped|diced|minced|sliced|crushed|ground|boneless|skinless|grated|peeled|organic|raw|cooked)\b/g, "")
    .replace(/ies\b/, "y")
    .replace(/es\b/, "e")
    .replace(/s\b/, "")
    .trim();
}

export function scoreIngredients(
  recipe: Recipe,
  availableIngredients?: string[]
): { score: number; reasons: RecommendationReason[] } {
  if (!availableIngredients || availableIngredients.length === 0) {
    return { score: 0.5, reasons: [] };
  }

  const userItems = availableIngredients
    .map((i) => normalizeIngredientName(i))
    .filter(Boolean);

  if (userItems.length === 0) {
    return { score: 0.5, reasons: [] };
  }

  const recipeIngredients = recipe.ingredients.map((ing) => ({
    raw: ing.name,
    norm: normalizeIngredientName(ing.name),
  }));

  const matchedUserItems: string[] = [];
  let matchedRecipeCount = 0;

  for (const userItem of userItems) {
    const isMatch = recipeIngredients.some((ing) => 
      ing.norm.includes(userItem) || userItem.includes(ing.norm)
    );
    if (isMatch) {
      matchedUserItems.push(userItem);
    }
  }

  for (const ing of recipeIngredients) {
    if (userItems.some((u) => ing.norm.includes(u) || u.includes(ing.norm))) {
      matchedRecipeCount++;
    }
  }

  const totalRecipeIngredients = Math.max(recipe.ingredients.length, 1);
  const pantryMatchRatio = matchedRecipeCount / totalRecipeIngredients;
  const userPantryUtilization = matchedUserItems.length / userItems.length;

  // Composite pantry score
  const score = Math.min(1.0, 0.2 + (pantryMatchRatio * 0.5) + (userPantryUtilization * 0.3));

  const reasons: RecommendationReason[] = [];
  if (matchedUserItems.length > 0) {
    const displayItems = matchedUserItems
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(", ");

    reasons.push({
      type: "ingredient",
      text: `Uses ${matchedRecipeCount} of ${totalRecipeIngredients} ingredients (${displayItems})`,
    });
  }

  return { score, reasons };
}
