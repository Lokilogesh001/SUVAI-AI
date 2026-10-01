import { RecommendedRecipe } from "@/types/recipe";
import { RecommendationContext, ScoredRecipe } from "./types";
import { generateCandidates } from "./candidateGenerator";
import { scorePreferences } from "./preferenceScorer";
import { scoreIngredients } from "./ingredientScorer";
import { scoreBehavior } from "./behaviorScorer";
import { rerankForDiversity } from "./diversityReranker";

export class RecommendationEngine {
  /**
   * Run full hybrid recommendation pipeline
   * Stage 1: Hard filtering (allergies, diet, dislikes)
   * Stage 2: Dynamic personalized scoring (contextual weights)
   * Stage 3: Exploration vs Exploitation balance
   * Stage 4: Multi-attribute diversity re-ranking
   */
  async getRecommendations(context: RecommendationContext): Promise<RecommendedRecipe[]> {
    // 1. Candidate Generation + Hard Constraint Filtering (Stage 1)
    const candidates = await generateCandidates(context);

    if (candidates.length === 0) {
      return [];
    }

    const hasPantry = context.availableIngredients && context.availableIngredients.length > 0;
    const hasInteractions = context.interactions && context.interactions.length > 0;

    // Dynamic Context Weights (Section 15)
    // Adjust weights based on available user signals rather than rigid hard-coded constants
    const weights = {
      country: hasInteractions ? 0.15 : 0.25,
      cuisine: 0.25,
      diet: 0.20,
      pantry: hasPantry ? 0.25 : 0.05,
      time: 0.10,
      behavior: hasInteractions ? 0.25 : 0.05,
      quality: 0.05,
    };

    // Normalize weights to sum to 1.0
    const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
    const normWeights = {
      country: weights.country / weightSum,
      cuisine: weights.cuisine / weightSum,
      diet: weights.diet / weightSum,
      pantry: weights.pantry / weightSum,
      time: weights.time / weightSum,
      behavior: weights.behavior / weightSum,
      quality: weights.quality / weightSum,
    };

    // 2. Feature Extraction & Scoring (Stage 2)
    const scoredList: ScoredRecipe[] = candidates.map((recipe) => {
      const prefScores = scorePreferences(recipe, context);
      const ingScores = scoreIngredients(recipe, context.availableIngredients);
      const behScores = scoreBehavior(recipe, context.interactions);

      const qualityScore = (recipe.spoonacularScore || 85) / 100;

      // Dynamic weighted formula
      const totalScore = 
        prefScores.countryScore * normWeights.country +
        prefScores.cuisineScore * normWeights.cuisine +
        prefScores.dietScore * normWeights.diet +
        ingScores.score * normWeights.pantry +
        prefScores.timeScore * normWeights.time +
        behScores.score * normWeights.behavior +
        qualityScore * normWeights.quality;

      const combinedReasons = [
        ...ingScores.reasons,
        ...prefScores.reasons,
        ...behScores.reasons,
      ];

      // Add nutritional highlight reason if high protein or light
      if (recipe.nutrition?.protein && recipe.nutrition.protein >= 25) {
        combinedReasons.push({
          type: "popular",
          text: `High protein (${recipe.nutrition.protein}g per serving)`,
        });
      }

      return {
        recipe,
        totalScore,
        subScores: {
          cuisineMatch: prefScores.cuisineScore,
          dietMatch: prefScores.dietScore,
          ingredientMatch: ingScores.score,
          timeMatch: prefScores.timeScore,
          skillMatch: prefScores.skillScore,
          countryRelevance: prefScores.countryScore,
          behaviorMatch: behScores.score,
          qualityScore,
        },
        reasons: combinedReasons,
      };
    });

    // 3. Multi-Attribute Diversity Re-ranking & Exploration (Stage 3 & 4)
    const limit = context.limit || 8;
    return rerankForDiversity(scoredList, limit);
  }
}

export const recommendationEngine = new RecommendationEngine();
