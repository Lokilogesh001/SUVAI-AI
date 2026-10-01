/**
 * Spoonacular API Service (Refactored to secure provider layer)
 * Uses recipeService with caching and environmental configuration
 */
import { recipeService } from "./recipes/recipeService";
import { Recipe, RecipeSearchParams } from "@/types/recipe";

export type SpoonacularRecipe = Recipe;
export type SpoonacularRecipeDetailed = Recipe;

export const searchRecipes = async (params: RecipeSearchParams) => {
  return recipeService.search(params);
};

export const getRecipeById = async (id: string | number): Promise<Recipe> => {
  const result = await recipeService.getRecipeById(String(id));
  return result || recipeService.getAllSeedRecipes()[0];
};

export const getRandomRecipes = async (number: number = 8, tags: string = ""): Promise<Recipe[]> => {
  return recipeService.getRandom(number, tags);
};
