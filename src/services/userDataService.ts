import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { 
  SavedRecipeRow, 
  RecipeInteractionRow, 
  MealPlanRow, 
  GroceryItemRow, 
  InteractionType,
  MealType,
  GroceryCategory 
} from "@/types/database";

const assertSupabaseReady = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase connection failed. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured in .env."
    );
  }
};

export const userDataService = {
  // ==========================================
  // SAVED RECIPES (Strict Supabase Source of Truth)
  // ==========================================
  async getSavedRecipeIds(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from("saved_recipes")
      .select("recipe_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error fetching saved recipes:", error.message);
      throw new Error(`Failed to fetch saved recipes from database: ${error.message}`);
    }

    return (data || []).map((row) => row.recipe_id);
  },

  async saveRecipe(userId: string, recipeId: string): Promise<boolean> {
    assertSupabaseReady();

    // Record interaction in Supabase
    await this.recordInteraction(userId, recipeId, "save");

    const { error } = await supabase
      .from("saved_recipes")
      .upsert({ user_id: userId, recipe_id: recipeId });

    if (error) {
      console.error("Supabase error saving recipe:", error.message);
      throw new Error(`Database error saving recipe: ${error.message}`);
    }

    return true;
  },

  async unsaveRecipe(userId: string, recipeId: string): Promise<boolean> {
    assertSupabaseReady();

    await this.recordInteraction(userId, recipeId, "unsave");

    const { error } = await supabase
      .from("saved_recipes")
      .delete()
      .eq("user_id", userId)
      .eq("recipe_id", recipeId);

    if (error) {
      console.error("Supabase error unsaving recipe:", error.message);
      throw new Error(`Database error unsaving recipe: ${error.message}`);
    }

    return true;
  },

  // ==========================================
  // INTERACTIONS (Behavioral Tracking in Supabase)
  // ==========================================
  async recordInteraction(userId: string, recipeId: string, type: InteractionType): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from("recipe_interactions")
      .insert({
        user_id: userId,
        recipe_id: recipeId,
        interaction_type: type,
      });

    if (error) {
      console.warn("Supabase interaction tracking failed:", error.message);
    }
  },

  async getInteractions(userId: string): Promise<RecipeInteractionRow[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from("recipe_interactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase error fetching interactions:", error.message);
      throw new Error(`Failed to load interactions from database: ${error.message}`);
    }

    return data || [];
  },

  // ==========================================
  // MEAL PLANS (Strict Supabase Source of Truth)
  // ==========================================
  async getMealPlans(userId: string): Promise<MealPlanRow[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error("Supabase error fetching meal plans:", error.message);
      throw new Error(`Failed to load meal plans from database: ${error.message}`);
    }

    return data || [];
  },

  async addMealPlan(
    userId: string, 
    date: string, 
    mealType: MealType, 
    recipeId?: string, 
    customName?: string, 
    notes?: string
  ): Promise<MealPlanRow> {
    assertSupabaseReady();

    const { data, error } = await supabase
      .from("meal_plans")
      .insert({
        user_id: userId,
        date,
        meal_type: mealType,
        recipe_id: recipeId || null,
        custom_name: customName || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding meal plan:", error.message);
      throw new Error(`Failed to save meal plan to database: ${error.message}`);
    }

    return data;
  },

  async deleteMealPlan(userId: string, planId: string): Promise<boolean> {
    assertSupabaseReady();

    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("user_id", userId)
      .eq("id", planId);

    if (error) {
      console.error("Supabase error deleting meal plan:", error.message);
      throw new Error(`Failed to delete meal plan from database: ${error.message}`);
    }

    return true;
  },

  // ==========================================
  // GROCERY ITEMS (Strict Supabase Source of Truth)
  // ==========================================
  async getGroceryItems(userId: string): Promise<GroceryItemRow[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching grocery items:", error.message);
      throw new Error(`Failed to load grocery items from database: ${error.message}`);
    }

    return data || [];
  },

  async addGroceryItem(
    userId: string, 
    name: string, 
    quantity: number = 1, 
    unit: string = "", 
    category: GroceryCategory = "Other"
  ): Promise<GroceryItemRow> {
    assertSupabaseReady();

    const { data, error } = await supabase
      .from("grocery_items")
      .insert({
        user_id: userId,
        name,
        quantity,
        unit,
        category,
        checked: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding grocery item:", error.message);
      throw new Error(`Failed to save grocery item to database: ${error.message}`);
    }

    return data;
  },

  async toggleGroceryItem(userId: string, itemId: string, checked: boolean): Promise<void> {
    assertSupabaseReady();

    const { error } = await supabase
      .from("grocery_items")
      .update({ checked, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", itemId);

    if (error) {
      console.error("Supabase error updating grocery item:", error.message);
      throw new Error(`Failed to update grocery item in database: ${error.message}`);
    }
  },

  async deleteGroceryItem(userId: string, itemId: string): Promise<void> {
    assertSupabaseReady();

    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", userId)
      .eq("id", itemId);

    if (error) {
      console.error("Supabase error deleting grocery item:", error.message);
      throw new Error(`Failed to delete grocery item in database: ${error.message}`);
    }
  },

  async clearCheckedGroceryItems(userId: string): Promise<void> {
    assertSupabaseReady();

    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", userId)
      .eq("checked", true);

    if (error) {
      console.error("Supabase error clearing checked items:", error.message);
      throw new Error(`Failed to clear checked grocery items in database: ${error.message}`);
    }
  }
};
