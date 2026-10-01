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

const LOCAL_SAVED_KEY = "suvai_saved_recipes";
const LOCAL_INTERACTIONS_KEY = "suvai_recipe_interactions";
const LOCAL_MEALPLANS_KEY = "suvai_meal_plans";
const LOCAL_GROCERY_KEY = "suvai_grocery_items";

export const userDataService = {
  // ==========================================
  // SAVED RECIPES
  // ==========================================
  async getSavedRecipeIds(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`${LOCAL_SAVED_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : ["1", "3", "8"];
    }

    const { data, error } = await supabase
      .from("saved_recipes")
      .select("recipe_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error fetching saved recipes:", error.message);
      throw new Error(`Failed to fetch saved recipes from Supabase: ${error.message}`);
    }

    return (data || []).map((row) => row.recipe_id);
  },

  async saveRecipe(userId: string, recipeId: string): Promise<boolean> {
    // Record interaction
    await this.recordInteraction(userId, recipeId, "save");

    if (!isSupabaseConfigured) {
      const existing = await this.getSavedRecipeIds(userId);
      if (!existing.includes(recipeId)) {
        const updated = [...existing, recipeId];
        localStorage.setItem(`${LOCAL_SAVED_KEY}_${userId}`, JSON.stringify(updated));
      }
      return true;
    }

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
    await this.recordInteraction(userId, recipeId, "unsave");

    if (!isSupabaseConfigured) {
      const existing = await this.getSavedRecipeIds(userId);
      const updated = existing.filter((id) => id !== recipeId);
      localStorage.setItem(`${LOCAL_SAVED_KEY}_${userId}`, JSON.stringify(updated));
      return true;
    }

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
  // INTERACTIONS (Behavioral Tracking)
  // ==========================================
  async recordInteraction(userId: string, recipeId: string, type: InteractionType): Promise<void> {
    const item: RecipeInteractionRow = {
      id: crypto.randomUUID(),
      user_id: userId,
      recipe_id: recipeId,
      interaction_type: type,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      const existing = this.getLocalInteractions(userId);
      const updated = [item, ...existing.slice(0, 49)];
      localStorage.setItem(`${LOCAL_INTERACTIONS_KEY}_${userId}`, JSON.stringify(updated));
      return;
    }

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

  getLocalInteractions(userId: string): RecipeInteractionRow[] {
    const stored = localStorage.getItem(`${LOCAL_INTERACTIONS_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  },

  async getInteractions(userId: string): Promise<RecipeInteractionRow[]> {
    if (!isSupabaseConfigured) {
      return this.getLocalInteractions(userId);
    }

    const { data, error } = await supabase
      .from("recipe_interactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase error fetching interactions:", error.message);
      throw new Error(`Failed to load interactions from Supabase: ${error.message}`);
    }

    return data || [];
  },

  // ==========================================
  // MEAL PLANS
  // ==========================================
  async getMealPlans(userId: string): Promise<MealPlanRow[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`${LOCAL_MEALPLANS_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }

    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error("Supabase error fetching meal plans:", error.message);
      throw new Error(`Failed to load meal plans from Supabase: ${error.message}`);
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
    const newPlan: MealPlanRow = {
      id: crypto.randomUUID(),
      user_id: userId,
      date,
      meal_type: mealType,
      recipe_id: recipeId || null,
      custom_name: customName || null,
      notes: notes || null,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      const existing = await this.getMealPlans(userId);
      const updated = [...existing, newPlan];
      localStorage.setItem(`${LOCAL_MEALPLANS_KEY}_${userId}`, JSON.stringify(updated));
      return newPlan;
    }

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
      throw new Error(`Failed to save meal plan to Supabase: ${error.message}`);
    }

    return data;
  },

  async deleteMealPlan(userId: string, planId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const existing = await this.getMealPlans(userId);
      const updated = existing.filter((p) => p.id !== planId);
      localStorage.setItem(`${LOCAL_MEALPLANS_KEY}_${userId}`, JSON.stringify(updated));
      return true;
    }

    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("user_id", userId)
      .eq("id", planId);

    if (error) {
      console.error("Supabase error deleting meal plan:", error.message);
      throw new Error(`Failed to delete meal plan from Supabase: ${error.message}`);
    }

    return true;
  },

  // ==========================================
  // GROCERY ITEMS
  // ==========================================
  async getGroceryItems(userId: string): Promise<GroceryItemRow[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`${LOCAL_GROCERY_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }

    const { data, error } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching grocery items:", error.message);
      throw new Error(`Failed to load grocery items from Supabase: ${error.message}`);
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
    const newItem: GroceryItemRow = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      quantity,
      unit,
      category,
      checked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      const existing = await this.getGroceryItems(userId);
      // Normalize / consolidate duplicate ingredient
      const existingIdx = existing.findIndex(
        (i) => i.name.toLowerCase() === name.toLowerCase() && i.unit.toLowerCase() === unit.toLowerCase()
      );

      let updated: GroceryItemRow[];
      if (existingIdx >= 0) {
        updated = [...existing];
        updated[existingIdx].quantity += quantity;
        updated[existingIdx].updated_at = new Date().toISOString();
      } else {
        updated = [newItem, ...existing];
      }

      localStorage.setItem(`${LOCAL_GROCERY_KEY}_${userId}`, JSON.stringify(updated));
      return newItem;
    }

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
      throw new Error(`Failed to save grocery item to Supabase: ${error.message}`);
    }

    return data;
  },

  async toggleGroceryItem(userId: string, itemId: string, checked: boolean): Promise<void> {
    if (!isSupabaseConfigured) {
      const existing = await this.getGroceryItems(userId);
      const updated = existing.map((i) => (i.id === itemId ? { ...i, checked } : i));
      localStorage.setItem(`${LOCAL_GROCERY_KEY}_${userId}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from("grocery_items")
      .update({ checked, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", itemId);

    if (error) {
      console.error("Supabase error updating grocery item:", error.message);
      throw new Error(`Failed to update grocery item in Supabase: ${error.message}`);
    }
  },

  async deleteGroceryItem(userId: string, itemId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const existing = await this.getGroceryItems(userId);
      const updated = existing.filter((i) => i.id !== itemId);
      localStorage.setItem(`${LOCAL_GROCERY_KEY}_${userId}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", userId)
      .eq("id", itemId);

    if (error) {
      console.error("Supabase error deleting grocery item:", error.message);
      throw new Error(`Failed to delete grocery item in Supabase: ${error.message}`);
    }
  },

  async clearCheckedGroceryItems(userId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const existing = await this.getGroceryItems(userId);
      const updated = existing.filter((i) => !i.checked);
      localStorage.setItem(`${LOCAL_GROCERY_KEY}_${userId}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", userId)
      .eq("checked", true);

    if (error) {
      console.error("Supabase error clearing checked items:", error.message);
      throw new Error(`Failed to clear checked grocery items in Supabase: ${error.message}`);
    }
  }
};
