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
   */
  async getRecommendations(context: RecommendationContext): Promise<RecommendedRecipe[]> {
    // 1. Candidate Generation + Hard Constraint Filtering
    const candidates = await generateCandidates(context);

    if (candidates.length === 0) {
      return [];
    }

    // 2. Feature Extraction & Scoring
    const scoredList: ScoredRecipe[] = candidates.map((recipe) => {
      // Soft scoring components
      const prefScores = scorePreferences(recipe, context);
      const ingScores = scoreIngredients(recipe, context.availableIngredients);
      const behScores = scoreBehavior(recipe, context.interactions);

      const qualityScore = (recipe.spoonacularScore || 85) / 100;

      // Weighted explainable formula from specification (Section 13)
      const totalScore = 
        prefScores.countryScore * 0.25 +
        prefScores.cuisineScore * 0.20 +
        prefScores.dietScore * 0.15 +
        ingScores.score * 0.15 +
        prefScores.timeScore * 0.10 +
        behScores.score * 0.10 +
        qualityScore * 0.05;

      const combinedReasons = [
        ...ingScores.reasons,
        ...prefScores.reasons,
        ...behScores.reasons,
      ];

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

    // 3. Diversity Re-ranking
    const limit = context.limit || 8;
    return rerankForDiversity(scoredList, limit);
  }
}

export const recommendationEngine = new RecommendationEngine();
