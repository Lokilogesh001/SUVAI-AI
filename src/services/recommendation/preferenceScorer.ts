import { Recipe, RecommendationReason } from "@/types/recipe";
import { RecommendationContext } from "./types";

const COUNTRY_CUISINE_AFFINITY: Record<string, string[]> = {
  IN: ["Indian", "South Indian", "North Indian", "Asian"],
  IT: ["Italian", "Mediterranean"],
  MX: ["Mexican", "Latin American"],
  JP: ["Japanese", "Asian"],
  TH: ["Thai", "Asian"],
  FR: ["French", "European"],
  US: ["American", "Mexican", "Italian"],
  GB: ["British", "Indian", "European"],
};

export function scorePreferences(
  recipe: Recipe, 
  context: RecommendationContext
): { 
  cuisineScore: number; 
  dietScore: number; 
  timeScore: number; 
  countryScore: number; 
  skillScore: number; 
  reasons: RecommendationReason[] 
} {
  const reasons: RecommendationReason[] = [];
  const prefs = context.preferences;

  // 1. Cuisine Match
  let cuisineScore = 0.5; // neutral
  if (prefs?.favorite_cuisines && prefs.favorite_cuisines.length > 0) {
    const matchesCuisine = prefs.favorite_cuisines.some(
      (c) => c.toLowerCase() === recipe.cuisine.toLowerCase()
    );
    if (matchesCuisine) {
      cuisineScore = 1.0;
      reasons.push({
        type: "cuisine",
        text: `Matches your love for ${recipe.cuisine} cuisine`,
      });
    } else {
      cuisineScore = 0.3;
    }
  }

  // 2. Country Relevance (Contextual base weighting)
  let countryScore = 0.5;
  const userCountry = context.country || "IN";
  const affinities = COUNTRY_CUISINE_AFFINITY[userCountry] || [];
  if (affinities.some((c) => c.toLowerCase() === recipe.cuisine.toLowerCase())) {
    countryScore = 0.9;
    reasons.push({
      type: "country",
      text: `Popular & accessible in your region`,
    });
  }

  // 3. Diet Match
  let dietScore = 0.7;
  if (prefs?.diet && prefs.diet !== "all") {
    if (recipe.diet.toLowerCase() === prefs.diet.toLowerCase()) {
      dietScore = 1.0;
      reasons.push({
        type: "diet",
        text: `Fits your ${prefs.diet} preference`,
      });
    }
  }

  // 4. Cooking Time Match
  let timeScore = 0.6;
  const preferredTime = prefs?.preferred_cooking_time || "30-60";
  if (preferredTime === "<15" && recipe.readyInMinutes <= 15) {
    timeScore = 1.0;
    reasons.push({ type: "time", text: `Ready in under 15 minutes (${recipe.readyInMinutes}m)` });
  } else if (preferredTime === "15-30" && recipe.readyInMinutes <= 30) {
    timeScore = 0.95;
    reasons.push({ type: "time", text: `Quick meal, ready in ${recipe.readyInMinutes} minutes` });
  } else if (preferredTime === "30-60" && recipe.readyInMinutes >= 20 && recipe.readyInMinutes <= 60) {
    timeScore = 0.9;
    reasons.push({ type: "time", text: `Ready in ${recipe.readyInMinutes} minutes` });
  } else if (preferredTime === "60+" && recipe.readyInMinutes >= 45) {
    timeScore = 0.85;
  }

  // 5. Cooking Skill Match
  let skillScore = 0.8;
  const stepCount = recipe.instructions.length;
  if (prefs?.cooking_skill === "beginner") {
    if (stepCount <= 5 && recipe.ingredients.length <= 8) {
      skillScore = 1.0;
      reasons.push({ type: "popular", text: "Simple step-by-step preparation for easy cooking" });
    } else {
      skillScore = 0.4;
    }
  } else if (prefs?.cooking_skill === "advanced") {
    skillScore = 0.9;
  }

  // 6. Disliked Ingredients Penalty
  if (prefs?.disliked_ingredients && prefs.disliked_ingredients.length > 0) {
    for (const dislike of prefs.disliked_ingredients) {
      const dislikedLower = dislike.toLowerCase();
      if (recipe.ingredients.some((i) => i.name.toLowerCase().includes(dislikedLower))) {
        cuisineScore *= 0.5; // soft penalty
      }
    }
  }

  return {
    cuisineScore,
    dietScore,
    timeScore,
    countryScore,
    skillScore,
    reasons,
  };
}
