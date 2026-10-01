import { Recipe, RecommendationReason } from "@/types/recipe";
import { RecipeInteractionRow } from "@/types/database";

export function scoreBehavior(
  recipe: Recipe,
  interactions?: RecipeInteractionRow[]
): { score: number; reasons: RecommendationReason[] } {
  if (!interactions || interactions.length === 0) {
    return { score: 0.5, reasons: [] };
  }

  let score = 0.5;
  const reasons: RecommendationReason[] = [];

  // Count interaction types for this specific recipe
  const recipeInteractions = interactions.filter((i) => i.recipe_id === recipe.id);
  const isSaved = recipeInteractions.some((i) => i.interaction_type === "save");
  const isCooked = recipeInteractions.some((i) => i.interaction_type === "cook");
  const isDisliked = recipeInteractions.some((i) => i.interaction_type === "dislike");

  if (isDisliked) {
    return { score: 0.1, reasons: [] };
  }

  if (isCooked) {
    score += 0.3;
    reasons.push({ type: "behavior", text: "You previously prepared and loved this" });
  } else if (isSaved) {
    score += 0.2;
    reasons.push({ type: "behavior", text: "From your saved recipe collection" });
  }

  // Count interaction frequency across this cuisine
  const cuisineInteractions = interactions.filter(
    (i) => i.interaction_type === "save" || i.interaction_type === "cook" || i.interaction_type === "like"
  );
  if (cuisineInteractions.length >= 3) {
    score += 0.15;
    if (reasons.length === 0) {
      reasons.push({ type: "behavior", text: `Based on your frequent cooking habits` });
    }
  }

  return {
    score: Math.min(1.0, score),
    reasons,
  };
}
