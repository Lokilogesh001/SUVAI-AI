// ==========================================
// Recipe Domain Models
// ==========================================

export interface RecipeIngredient {
  name: string;
  amount: number | string;
  unit?: string;
  original?: string;
}

export interface RecipeNutrition {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber?: number;
  sugar?: number;
}

export interface Recipe {
  id: string;
  external_id?: string;
  title: string;
  description: string;
  image: string;
  cuisine: string;
  diet: string;
  dishTypes: string[];
  readyInMinutes: number;
  servings: number;
  calories: number;
  nutrition?: RecipeNutrition;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
  isFeatured?: boolean;
  spoonacularScore?: number;
  sourceUrl?: string;
}

export interface RecommendationReason {
  type: "cuisine" | "ingredient" | "diet" | "time" | "country" | "behavior" | "popular";
  text: string;
}

export interface RecommendedRecipe extends Recipe {
  score: number;
  reasons: RecommendationReason[];
}

export interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  maxReadyTime?: number;
  includeIngredients?: string[];
  excludeIngredients?: string[];
  number?: number;
  offset?: number;
}
