import { ScoredRecipe } from "./types";
import { RecommendedRecipe } from "@/types/recipe";

export function rerankForDiversity(scored: ScoredRecipe[], limit: number = 8): RecommendedRecipe[] {
  if (scored.length <= limit) {
    return scored.map(toRecommended);
  }

  // Sort primarily by descending score
  const remaining = [...scored].sort((a, b) => b.totalScore - a.totalScore);
  const selected: ScoredRecipe[] = [];
  const cuisineCount = new Map<string, number>();

  // Pick top scorer first
  const first = remaining.shift();
  if (first) {
    selected.push(first);
    cuisineCount.set(first.recipe.cuisine, 1);
  }

  // Greedy diversity selection: prefer high score, but apply penalty if cuisine is already represented
  while (selected.length < limit && remaining.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = -1;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const count = cuisineCount.get(candidate.recipe.cuisine) || 0;

      // Diversity penalty factor: reduces score if this cuisine already appears in selected results
      const penalty = count === 0 ? 1.0 : count === 1 ? 0.8 : 0.55;
      const adjusted = candidate.totalScore * penalty;

      if (adjusted > bestAdjustedScore) {
        bestAdjustedScore = adjusted;
        bestIndex = i;
      }
    }

    const [chosen] = remaining.splice(bestIndex, 1);
    selected.push(chosen);
    cuisineCount.set(chosen.recipe.cuisine, (cuisineCount.get(chosen.recipe.cuisine) || 0) + 1);
  }

  return selected.map(toRecommended);
}

function toRecommended(scored: ScoredRecipe): RecommendedRecipe {
  // Deduplicate and select top reasons
  const uniqueReasons = Array.from(
    new Map(scored.reasons.map((r) => [r.text, r])).values()
  ).slice(0, 2);

  // If no reasons were generated, provide a friendly default
  if (uniqueReasons.length === 0) {
    uniqueReasons.push({
      type: "popular",
      text: "Recommended for your cooking style",
    });
  }

  return {
    ...scored.recipe,
    score: Math.round(scored.totalScore * 100),
    reasons: uniqueReasons,
  };
}
