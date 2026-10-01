import { Recipe, RecommendationReason } from "@/types/recipe";

export function scoreIngredients(
  recipe: Recipe,
  availableIngredients?: string[]
): { score: number; reasons: RecommendationReason[] } {
  if (!availableIngredients || availableIngredients.length === 0) {
    return { score: 0.5, reasons: [] };
  }

  const userItems = availableIngredients.map((i) => i.toLowerCase().trim()).filter(Boolean);
  if (userItems.length === 0) {
    return { score: 0.5, reasons: [] };
  }

  const recipeIngredients = recipe.ingredients.map((ing) => ing.name.toLowerCase());
  const matched: string[] = [];

  for (const userItem of userItems) {
    const isMatch = recipeIngredients.some((ing) => ing.includes(userItem) || userItem.includes(ing));
    if (isMatch) {
      matched.push(userItem);
    }
  }

  // Fraction of user ingredients utilized
  const matchRatio = matched.length / userItems.length;
  // Scaled score with bonus for matching multiple
  const score = Math.min(1.0, 0.4 + matchRatio * 0.6);

  const reasons: RecommendationReason[] = [];
  if (matched.length > 0) {
    const displayItems = matched.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(", ");
    reasons.push({
      type: "ingredient",
      text: `Uses ${matched.length} ingredients you have (${displayItems})`,
    });
  }

  return { score, reasons };
}
