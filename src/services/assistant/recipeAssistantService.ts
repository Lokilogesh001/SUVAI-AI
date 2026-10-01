import { Recipe } from "@/types/recipe";
import { recipeService } from "../recipes/recipeService";
import { recommendationEngine } from "../recommendation/recommendationEngine";
import { UserPreferences } from "@/types/database";

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedRecipes?: Recipe[];
  timestamp: string;
}

export interface ConversationContext {
  activeRecipeId?: string | null;
  activeRecipe?: Recipe | null;
  activeIngredients: string[];
  userPreferences?: UserPreferences | null;
  userCountry?: string;
}

const COMMON_SUBSTITUTIONS: Record<string, string[]> = {
  yogurt: [
    "Greek yogurt with a splash of milk",
    "Sour cream (1:1 ratio)",
    "Buttermilk or kefir",
    "Coconut yogurt or blended silken tofu (dairy-free)",
  ],
  butter: [
    "Extra virgin olive oil (use 3/4 amount)",
    "Coconut oil or ghee",
    "Mashed ripe avocado",
    "Applesauce (for baking)",
  ],
  egg: [
    "Flax egg (1 tbsp ground flaxseed + 3 tbsp warm water)",
    "1/4 cup unsweetened applesauce",
    "1/4 cup mashed ripe banana",
    "1/4 cup silken tofu",
    "Aquafaba (3 tbsp chickpea liquid per egg)",
  ],
  "heavy cream": [
    "Full-fat coconut milk or coconut cream",
    "3/4 cup whole milk + 1/4 cup melted butter",
    "Blended raw cashews soaked in warm water",
    "Evaporated milk",
  ],
  parmesan: [
    "Pecorino Romano (sharper, saltier)",
    "Nutritional yeast flakes (dairy-free umami)",
    "Asiago or aged Manchego",
    "Aged white cheddar",
  ],
  cilantro: [
    "Fresh flat-leaf Italian parsley",
    "Fresh Thai basil or sweet basil",
    "Fresh mint leaves with a squeeze of lime juice",
  ],
  "soy sauce": [
    "Tamari (gluten-free)",
    "Coconut aminos (soy-free & lower sodium)",
    "Liquid aminos",
  ],
  buttermilk: [
    "1 cup milk + 1 tablespoon lemon juice or white vinegar (let sit 5 mins)",
    "Plain yogurt thinned with milk",
  ],
};

export class RecipeAssistantService {
  private context: ConversationContext = {
    activeIngredients: [],
  };

  setContext(context: Partial<ConversationContext>) {
    this.context = { ...this.context, ...context };
  }

  async processMessage(
    userText: string,
    history: AssistantMessage[],
    userPreferences?: UserPreferences | null,
    country?: string
  ): Promise<{ response: string; suggestedRecipes?: Recipe[] }> {
    const text = userText.toLowerCase().trim();

    // 1. Check for Substitution Intent (e.g., "I don't have yogurt", "substitute for eggs", "replacement for butter")
    const substitutionMatch = this.detectSubstitutionRequest(text);
    if (substitutionMatch) {
      return this.handleSubstitution(substitutionMatch);
    }

    // 2. Check for Ingredient-based discovery ("I have chicken, rice, tomato", "cook with mushrooms and pasta")
    const extractedIngredients = this.extractIngredients(text);
    if (extractedIngredients.length > 0) {
      this.context.activeIngredients = extractedIngredients;
      return this.handleIngredientDiscovery(extractedIngredients, userPreferences, country);
    }

    // 3. Check for Quick meal / Time intent ("under 20 minutes", "quick dinner")
    if (text.includes("quick") || text.includes("under 15") || text.includes("under 30") || text.includes("fast meal")) {
      return this.handleQuickMeals(userPreferences, country);
    }

    // 4. Check for Dietary / Healthy intent ("vegetarian dinner", "high protein", "keto")
    if (text.includes("vegetarian") || text.includes("vegan") || text.includes("protein") || text.includes("keto") || text.includes("healthy")) {
      return this.handleDietaryQuery(text, userPreferences, country);
    }

    // 5. Check for General Food Advice or Meal Planning
    if (text.includes("plan") || text.includes("schedule") || text.includes("week")) {
      return {
        response: `### Weekly Meal Planning Guidance 🗓️\n\nI can help you balance your weekly menu! You can:\n\n1. Visit the **Meal Planner** from the top navigation to schedule breakfast, lunch, dinner, and snacks.\n2. Tap **"Auto-Generate Week"** to let our recommendation engine balance your meals based on your ${userPreferences?.diet || "current"} preferences.\n3. Once planned, click **"Export to Grocery List"** to instantly consolidate all required ingredients!`,
      };
    }

    // 6. Natural conversational fallback
    const allRecipes = recipeService.getAllSeedRecipes();
    const suggestions = allRecipes.slice(0, 3);

    return {
      response: `I'm your **suvAI Kitchen Assistant**! 👨‍🍳\n\nI can assist you with:\n- **Pantry cooking:** *"I have chicken, tomatoes, and rice"* or *"Cook with mushrooms and garlic"*\n- **Ingredient substitutions:** *"What can I use instead of yogurt?"* or *"Substitute for eggs"*\n- **Dietary suggestions:** *"Show me quick vegetarian dinners"* or *"High protein meals"*\n\nHere are some popular recipes to inspire you today:`,
      suggestedRecipes: suggestions,
    };
  }

  private detectSubstitutionRequest(text: string): string | null {
    const subPhrases = [
      "don't have",
      "dont have",
      "out of",
      "substitute for",
      "replacement for",
      "instead of",
      "replace",
    ];

    for (const phrase of subPhrases) {
      if (text.includes(phrase)) {
        for (const ingredient of Object.keys(COMMON_SUBSTITUTIONS)) {
          if (text.includes(ingredient)) {
            return ingredient;
          }
        }
      }
    }

    // Direct check for "substitute yogurt"
    for (const ingredient of Object.keys(COMMON_SUBSTITUTIONS)) {
      if (text.includes(ingredient) && (text.includes("sub") || text.includes("replace"))) {
        return ingredient;
      }
    }

    return null;
  }

  private handleSubstitution(ingredient: string): { response: string } {
    const options = COMMON_SUBSTITUTIONS[ingredient] || [];
    if (options.length === 0) {
      return {
        response: `For **${ingredient}**, a general neutral cooking fat or plant milk can often be substituted depending on whether your dish is savory or baked.`,
      };
    }

    const list = options.map((opt) => `- **${opt}**`).join("\n");
    return {
      response: `### Smart Substitutions for **${ingredient.toUpperCase()}** 💡\n\nIf you don't have ${ingredient} on hand, try these culinary-tested alternatives:\n\n${list}\n\n*Tip: For marinades and gravies, sour cream or thinned Greek yogurt works almost identically to curd/yogurt.*`,
    };
  }

  private extractIngredients(text: string): string[] {
    const commonFoodWords = [
      "chicken", "salmon", "fish", "paneer", "tofu", "egg", "eggs", "rice", "pasta",
      "tomato", "tomatoes", "onion", "onions", "garlic", "mushroom", "mushrooms",
      "potato", "potatoes", "spinach", "butter", "cheese", "avocado", "cucumber",
      "bell pepper", "chili", "coriander", "ginger", "beans", "quinoa"
    ];

    const matched = new Set<string>();
    for (const word of commonFoodWords) {
      if (text.includes(word)) {
        matched.add(word);
      }
    }

    return Array.from(matched);
  }

  private async handleIngredientDiscovery(
    ingredients: string[],
    preferences?: UserPreferences | null,
    country?: string
  ): Promise<{ response: string; suggestedRecipes?: Recipe[] }> {
    const recommendations = await recommendationEngine.getRecommendations({
      country: country || "IN",
      preferences,
      availableIngredients: ingredients,
      limit: 4,
    });

    const displayIngs = ingredients.map((i) => `**${i}**`).join(", ");

    return {
      response: `I found **${recommendations.length} recipes** that make great use of your ingredients: ${displayIngs}.\n\nThese recipes are matched against your taste profile and dietary preferences:`,
      suggestedRecipes: recommendations,
    };
  }

  private async handleQuickMeals(
    preferences?: UserPreferences | null,
    country?: string
  ): Promise<{ response: string; suggestedRecipes?: Recipe[] }> {
    const all = recipeService.getAllSeedRecipes().filter((r) => r.readyInMinutes <= 25);
    const sorted = all.slice(0, 4);

    return {
      response: `### Quick Meals in 25 Minutes or Less ⏱️\n\nHere are fast, flavorful recipes designed for busy evenings:`,
      suggestedRecipes: sorted,
    };
  }

  private async handleDietaryQuery(
    text: string,
    preferences?: UserPreferences | null,
    country?: string
  ): Promise<{ response: string; suggestedRecipes?: Recipe[] }> {
    const isVegetarian = text.includes("vegetarian") || text.includes("vegan");
    const candidates = await recipeService.search({
      diet: isVegetarian ? "vegetarian" : undefined,
      number: 4,
    });

    return {
      response: `Here are delicious dishes tailored to your dietary focus:`,
      suggestedRecipes: candidates,
    };
  }
}

export const recipeAssistantService = new RecipeAssistantService();
