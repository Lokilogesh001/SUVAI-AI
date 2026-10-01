import { Recipe, RecipeSearchParams } from "@/types/recipe";
import { IRecipeProvider, getCached, setCached } from "./recipeProvider";
import { CURATED_GLOBAL_RECIPES } from "./seedRecipes";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";
const SPOONACULAR_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || "";

function normalizeSupabaseRecipe(row: any): Recipe {
  return {
    id: String(row.id),
    external_id: String(row.external_id || row.id),
    title: row.title || "Delicious Recipe",
    description: row.description || "",
    image: row.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: row.cuisine || "general",
    diet: row.diet || "all",
    dishTypes: Array.isArray(row.dish_types) ? row.dish_types : ["main course"],
    readyInMinutes: row.ready_minutes || 30,
    servings: row.servings || 4,
    calories: row.calories || 400,
    nutrition: {
      calories: row.calories || 400,
      protein: Number(row.protein) || 20,
      carbs: Number(row.carbs) || 30,
      fat: Number(row.fat) || 15,
      fiber: 4,
      sugar: 3,
    },
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    instructions: Array.isArray(row.instructions) ? row.instructions : [],
    tags: [...(row.dish_types || []), row.cuisine].filter(Boolean),
    spoonacularScore: 90,
  };
}

function normalizeSpoonacularRecipe(raw: any): Recipe {
  const calories = raw.nutrition?.nutrients?.find((n: any) => n.name === "Calories")?.amount 
    || raw.calories 
    || 400;

  const protein = raw.nutrition?.nutrients?.find((n: any) => n.name === "Protein")?.amount || 20;
  const carbs = raw.nutrition?.nutrients?.find((n: any) => n.name === "Carbohydrates")?.amount || 35;
  const fat = raw.nutrition?.nutrients?.find((n: any) => n.name === "Fat")?.amount || 15;
  const fiber = raw.nutrition?.nutrients?.find((n: any) => n.name === "Fiber")?.amount || 4;
  const sugar = raw.nutrition?.nutrients?.find((n: any) => n.name === "Sugar")?.amount || 3;

  // Extract ingredients safely
  const ingredients = (raw.extendedIngredients || []).map((ing: any) => ({
    name: ing.name || ing.originalName || "ingredient",
    amount: ing.amount || 1,
    unit: ing.unit || "",
    original: ing.original || `${ing.amount || ""} ${ing.unit || ""} ${ing.name || ""}`.trim(),
  }));

  // Extract instructions steps
  let instructions: string[] = [];
  if (Array.isArray(raw.analyzedInstructions) && raw.analyzedInstructions.length > 0) {
    instructions = raw.analyzedInstructions[0].steps?.map((s: any) => s.step) || [];
  } else if (typeof raw.instructions === "string") {
    instructions = raw.instructions
      .replace(/<[^>]*>/g, "")
      .split(/\.\s+/)
      .filter((s: string) => s.trim().length > 5);
  }

  if (instructions.length === 0) {
    instructions = [
      "Prepare all ingredients according to the recipe list.",
      "Combine and cook over medium heat until tender and aromatic.",
      "Garnish to taste and serve warm."
    ];
  }

  // Derive primary cuisine
  let primaryCuisine = "International";
  if (Array.isArray(raw.cuisines) && raw.cuisines.length > 0) {
    primaryCuisine = raw.cuisines[0];
  }

  // Derive diet string
  let primaryDiet = "all";
  if (raw.vegan) primaryDiet = "vegan";
  else if (raw.vegetarian) primaryDiet = "vegetarian";
  else if (Array.isArray(raw.diets) && raw.diets.length > 0) {
    primaryDiet = raw.diets[0].toLowerCase();
  }

  return {
    id: String(raw.id),
    external_id: String(raw.id),
    title: raw.title || "Delicious Recipe",
    description: (raw.summary || "")
      .replace(/<[^>]*>/g, "")
      .substring(0, 180) + (raw.summary?.length > 180 ? "..." : ""),
    image: raw.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    cuisine: primaryCuisine,
    diet: primaryDiet,
    dishTypes: raw.dishTypes || ["main course"],
    readyInMinutes: raw.readyInMinutes || 30,
    servings: raw.servings || 4,
    calories: Math.round(calories),
    nutrition: {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      fiber: Math.round(fiber),
      sugar: Math.round(sugar),
    },
    ingredients,
    instructions,
    tags: [...(raw.dishTypes || []), ...(raw.diets || []), primaryCuisine].slice(0, 4),
    spoonacularScore: raw.spoonacularScore || 85,
    sourceUrl: raw.sourceUrl,
  };
}

class RecipeServiceImpl implements IRecipeProvider {
  async search(params: RecipeSearchParams): Promise<Recipe[]> {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = getCached<Recipe[]>(cacheKey);
    if (cached) return cached;

    // If Spoonacular key is provided, try external query
    if (SPOONACULAR_KEY && !SPOONACULAR_KEY.includes("your-spoonacular")) {
      try {
        const queryParams = new URLSearchParams({
          apiKey: SPOONACULAR_KEY,
          number: String(params.number || 12),
          offset: String(params.offset || 0),
          addRecipeInformation: "true",
          fillIngredients: "true",
        });

        if (params.query) queryParams.append("query", params.query);
        if (params.cuisine && params.cuisine !== "all") queryParams.append("cuisine", params.cuisine);
        if (params.diet && params.diet !== "all") queryParams.append("diet", params.diet);
        if (params.maxReadyTime) queryParams.append("maxReadyTime", String(params.maxReadyTime));
        if (params.includeIngredients?.length) {
          queryParams.append("includeIngredients", params.includeIngredients.join(","));
        }
        if (params.excludeIngredients?.length) {
          queryParams.append("excludeIngredients", params.excludeIngredients.join(","));
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${SPOONACULAR_BASE_URL}/recipes/complexSearch?${queryParams}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            const normalized = data.results.map(normalizeSpoonacularRecipe);
            setCached(cacheKey, normalized);
            return normalized;
          }
        }
      } catch (err) {
        console.warn("Spoonacular search unavailable, falling back to local catalog:", err);
      }
    }

    // High quality local catalog filtering
    let results = [...CURATED_GLOBAL_RECIPES];

    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    if (params.cuisine && params.cuisine.toLowerCase() !== "all") {
      const c = params.cuisine.toLowerCase();
      results = results.filter((r) => r.cuisine.toLowerCase() === c);
    }

    if (params.diet && params.diet.toLowerCase() !== "all") {
      const d = params.diet.toLowerCase();
      results = results.filter((r) => {
        if (d === "vegetarian") return r.diet === "vegetarian" || r.diet === "vegan";
        if (d === "vegan") return r.diet === "vegan";
        return r.diet.toLowerCase() === d;
      });
    }

    if (params.maxReadyTime) {
      results = results.filter((r) => r.readyInMinutes <= params.maxReadyTime!);
    }

    if (params.includeIngredients?.length) {
      const queryIngs = params.includeIngredients.map((i) => i.toLowerCase().trim());
      results = results.filter((r) =>
        queryIngs.some((qi) =>
          r.ingredients.some((ing) => ing.name.toLowerCase().includes(qi))
        )
      );
    }

    setCached(cacheKey, results);
    return results;
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    const cacheKey = `recipe:${id}`;
    const cached = getCached<Recipe>(cacheKey);
    if (cached) return cached;

    // Check Supabase recipes catalog first
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!error && data) {
          const normalized = normalizeSupabaseRecipe(data);
          setCached(cacheKey, normalized);
          return normalized;
        }
      } catch (err) {
        console.warn(`Could not fetch recipe ${id} from Supabase:`, err);
      }
    }

    // Check curated catalog
    const seedMatch = CURATED_GLOBAL_RECIPES.find((r) => r.id === id);
    if (seedMatch) {
      setCached(cacheKey, seedMatch);
      return seedMatch;
    }

    // Otherwise check Spoonacular if numeric ID
    if (SPOONACULAR_KEY && !isNaN(Number(id))) {
      try {
        const queryParams = new URLSearchParams({
          apiKey: SPOONACULAR_KEY,
          includeNutrition: "true",
        });

        const res = await fetch(`${SPOONACULAR_BASE_URL}/recipes/${id}/information?${queryParams}`);
        if (res.ok) {
          const raw = await res.json();
          const normalized = normalizeSpoonacularRecipe(raw);
          setCached(cacheKey, normalized);
          return normalized;
        }
      } catch (err) {
        console.warn(`Error fetching recipe ${id} from Spoonacular:`, err);
      }
    }

    // Default fallback to first recipe if missing
    return CURATED_GLOBAL_RECIPES[0];
  }

  async getRandom(count: number = 8, tags: string = ""): Promise<Recipe[]> {
    const cacheKey = `random:${count}:${tags}`;
    const cached = getCached<Recipe[]>(cacheKey);
    if (cached) return cached;

    if (SPOONACULAR_KEY && !SPOONACULAR_KEY.includes("your-spoonacular")) {
      try {
        const queryParams = new URLSearchParams({
          apiKey: SPOONACULAR_KEY,
          number: String(count),
        });
        if (tags) queryParams.append("tags", tags);

        const res = await fetch(`${SPOONACULAR_BASE_URL}/recipes/random?${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.recipes) && data.recipes.length > 0) {
            const normalized = data.recipes.map(normalizeSpoonacularRecipe);
            setCached(cacheKey, normalized);
            return normalized;
          }
        }
      } catch (err) {
        console.warn("Random query failed from Spoonacular, using curated catalog:", err);
      }
    }

    const shuffled = [...CURATED_GLOBAL_RECIPES].sort(() => 0.5 - Math.random());
    const subset = shuffled.slice(0, count);
    setCached(cacheKey, subset);
    return subset;
  }

  getAllSeedRecipes(): Recipe[] {
    return [...CURATED_GLOBAL_RECIPES];
  }
}

export const recipeService = new RecipeServiceImpl();
