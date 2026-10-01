// ==========================================
// Database Models & Tables for Supabase
// ==========================================

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export type DietType = 
  | "all"
  | "vegetarian"
  | "non-vegetarian"
  | "vegan"
  | "eggetarian"
  | "pescatarian";

export type CookingSkill = "beginner" | "intermediate" | "advanced";
export type SpicePreference = "mild" | "medium" | "spicy";
export type CookingTimePreference = "<15" | "15-30" | "30-60" | "60+";

export interface UserPreferences {
  user_id: string;
  diet: DietType;
  favorite_cuisines: string[];
  disliked_ingredients: string[];
  allergies: string[];
  preferred_cooking_time: CookingTimePreference;
  cooking_skill: CookingSkill;
  calorie_preference: string;
  spice_preference: SpicePreference;
  created_at?: string;
  updated_at?: string;
}

export interface SavedRecipeRow {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export type InteractionType = 
  | "view"
  | "save"
  | "unsave"
  | "like"
  | "dislike"
  | "cook"
  | "search_click"
  | "recommendation_click";

export interface RecipeInteractionRow {
  id: string;
  user_id: string;
  recipe_id: string;
  interaction_type: InteractionType;
  created_at: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealPlanRow {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  meal_type: MealType;
  recipe_id?: string | null;
  custom_name?: string | null;
  notes?: string | null;
  created_at: string;
}

export type GroceryCategory = 
  | "Produce"
  | "Dairy"
  | "Meat"
  | "Seafood"
  | "Pantry"
  | "Bakery"
  | "Frozen"
  | "Other";

export interface GroceryItemRow {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  checked: boolean;
  created_at: string;
  updated_at: string;
}
