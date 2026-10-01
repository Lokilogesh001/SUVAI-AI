
/**
 * Spoonacular API Service
 * API Documentation: https://spoonacular.com/food-api/docs
 */

const API_KEY = "db259835737c41ad9aa1e05f5c2560fd";
const BASE_URL = "https://api.spoonacular.com";

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  // Add the missing properties that are needed in RecipeCategoryPage
  nutrition?: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
  dishTypes?: string[];
  diets?: string[];
}

export interface SpoonacularRecipeDetailed extends SpoonacularRecipe {
  occasions: string[];
  instructions: string;
  analyzedInstructions: {
    name: string;
    steps: {
      number: number;
      step: string;
      ingredients: { id: number; name: string; image: string }[];
    }[];
  }[];
  extendedIngredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
  aggregateLikes: number;
  spoonacularScore: number;
  healthScore: number;
  sourceUrl: string;
  pricePerServing: number;
}

export interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  number?: number;
  offset?: number;
}

/**
 * Search for recipes using various parameters
 */
export const searchRecipes = async (params: RecipeSearchParams) => {
  try {
    const queryParams = new URLSearchParams({
      apiKey: API_KEY,
      number: (params.number || 12).toString(),
      offset: (params.offset || 0).toString(),
      addRecipeInformation: "true",
      fillIngredients: "true",
    });

    if (params.query) queryParams.append("query", params.query);
    if (params.cuisine) queryParams.append("cuisine", params.cuisine);
    if (params.diet) queryParams.append("diet", params.diet);

    const response = await fetch(`${BASE_URL}/recipes/complexSearch?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  }
};

/**
 * Get detailed recipe information by ID
 */
export const getRecipeById = async (id: string | number): Promise<SpoonacularRecipeDetailed> => {
  try {
    const queryParams = new URLSearchParams({
      apiKey: API_KEY,
      includeNutrition: "true",
    });

    const response = await fetch(`${BASE_URL}/recipes/${id}/information?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching recipe with id ${id}:`, error);
    throw error;
  }
};

/**
 * Get random recipes
 */
export const getRandomRecipes = async (number: number = 8, tags: string = "") => {
  try {
    const queryParams = new URLSearchParams({
      apiKey: API_KEY,
      number: number.toString(),
    });
    
    if (tags) queryParams.append("tags", tags);

    const response = await fetch(`${BASE_URL}/recipes/random?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.recipes;
  } catch (error) {
    console.error("Error fetching random recipes:", error);
    throw error;
  }
};
