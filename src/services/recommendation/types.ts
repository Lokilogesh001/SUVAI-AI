import { Recipe, RecommendationReason } from "@/types/recipe";
import { UserPreferences, RecipeInteractionRow } from "@/types/database";

export interface RecommendationContext {
  userId?: string;
  country?: string;
  preferences?: UserPreferences | null;
  availableIngredients?: string[];
  interactions?: RecipeInteractionRow[];
  limit?: number;
}

export interface ScoredRecipe {
  recipe: Recipe;
  totalScore: number;
  subScores: {
    cuisineMatch: number;
    dietMatch: number;
    ingredientMatch: number;
    timeMatch: number;
    skillMatch: number;
    countryRelevance: number;
    behaviorMatch: number;
    qualityScore: number;
  };
  reasons: RecommendationReason[];
}
