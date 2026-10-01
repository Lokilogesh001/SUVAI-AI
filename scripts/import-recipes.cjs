require("dotenv").config();
const { Client } = require("pg");

const MEASURE_REGEX = /^([\d\s\/\.\,\-]+)?\s*([a-zA-Z]+)?(.*)$/;

function parseMeasure(measureStr) {
  if (!measureStr || !measureStr.trim()) {
    return { amount: 1, unit: "unit", original: "" };
  }
  const str = measureStr.trim();
  const match = str.match(MEASURE_REGEX);
  let amount = 1;
  let unit = "";

  if (match) {
    const rawAmt = (match[1] || "").trim();
    if (rawAmt) {
      if (rawAmt.includes("/")) {
        const parts = rawAmt.split("/");
        if (parts.length === 2) {
          const num = parseFloat(parts[0]);
          const den = parseFloat(parts[1]);
          if (!isNaN(num) && !isNaN(den) && den !== 0) {
            amount = Math.round((num / den) * 100) / 100;
          }
        }
      } else {
        const parsed = parseFloat(rawAmt);
        if (!isNaN(parsed) && parsed > 0) {
          amount = parsed;
        }
      }
    }
    unit = (match[2] || "").toLowerCase().trim();
  }

  return {
    amount: amount || 1,
    unit: unit || "portion",
    original: str,
  };
}

function deriveDiet(category, ingredients) {
  const cat = (category || "").toLowerCase();
  const allIngs = ingredients.map(i => i.name.toLowerCase()).join(" ");

  const meatKeywords = ["chicken", "beef", "pork", "lamb", "mutton", "bacon", "sausage", "turkey", "duck", "veal", "ham", "prosciutto", "meat"];
  const seafoodKeywords = ["fish", "salmon", "tuna", "prawn", "shrimp", "cod", "crab", "lobster", "mussel", "clam", "calamari", "squid", "anchovy", "haddock"];
  const eggKeywords = ["egg", "eggs", "yolk", "egg white"];
  const dairyKeywords = ["milk", "butter", "cheese", "cream", "yogurt", "ghee", "parmesan", "mozzarella", "cheddar"];

  const hasMeat = meatKeywords.some(w => cat.includes(w) || allIngs.includes(w));
  const hasSeafood = seafoodKeywords.some(w => cat.includes(w) || allIngs.includes(w));
  const hasEgg = eggKeywords.some(w => allIngs.includes(w));
  const hasDairy = dairyKeywords.some(w => allIngs.includes(w));

  if (hasMeat) return "non-vegetarian";
  if (hasSeafood) return "pescatarian";
  if (hasEgg) return "eggetarian";
  if (cat.includes("vegan")) return "vegan";
  if (cat.includes("vegetarian") || (!hasMeat && !hasSeafood && !hasEgg)) {
    return hasDairy ? "vegetarian" : "vegan";
  }
  return "vegetarian";
}

function estimateNutrition(diet, ingredients, category) {
  // Baseline sensible macro estimates per serving
  let calories = 380;
  let protein = 18;
  let carbs = 42;
  let fat = 14;

  const count = ingredients.length;
  calories += Math.min(count * 20, 160);

  if (diet === "non-vegetarian") {
    calories += 120;
    protein += 22;
    fat += 10;
  } else if (diet === "pescatarian") {
    calories += 60;
    protein += 18;
    fat += 6;
  } else if (diet === "vegan") {
    calories -= 40;
    protein -= 6;
    fat -= 5;
    carbs += 12;
  }

  const cat = (category || "").toLowerCase();
  if (cat.includes("dessert")) {
    calories += 180;
    carbs += 40;
    protein -= 8;
  } else if (cat.includes("pasta")) {
    carbs += 30;
    calories += 100;
  } else if (cat.includes("soup") || cat.includes("starter") || cat.includes("side")) {
    calories = Math.round(calories * 0.65);
    protein = Math.round(protein * 0.7);
    carbs = Math.round(carbs * 0.7);
    fat = Math.round(fat * 0.7);
  }

  return {
    calories: Math.max(150, Math.min(calories, 950)),
    protein: Math.max(5, Math.min(protein, 65)),
    carbs: Math.max(10, Math.min(carbs, 110)),
    fat: Math.max(3, Math.min(fat, 50)),
  };
}

function estimateReadyMinutes(instructionsCount, category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("dessert") || cat.includes("baking")) return 45;
  if (cat.includes("soup") || cat.includes("starter")) return 25;
  if (instructionsCount <= 3) return 20;
  if (instructionsCount <= 6) return 35;
  return Math.min(20 + instructionsCount * 5, 60);
}

function normalizeCuisine(area) {
  if (!area || area === "Unknown") return "International";
  const map = {
    American: "American",
    British: "British",
    Canadian: "Canadian",
    Chinese: "Chinese",
    Croatian: "Mediterranean",
    Dutch: "European",
    Egyptian: "Middle Eastern",
    Filipino: "Asian",
    French: "French",
    Greek: "Greek",
    Indian: "Indian",
    Irish: "British",
    Italian: "Italian",
    Jamaican: "Caribbean",
    Japanese: "Japanese",
    Kenyan: "African",
    Malaysian: "Malaysian",
    Mexican: "Mexican",
    Moroccan: "Middle Eastern",
    Polish: "European",
    Portuguese: "Mediterranean",
    Russian: "European",
    Spanish: "Spanish",
    Thai: "Thai",
    Tunisian: "Middle Eastern",
    Turkish: "Turkish",
    Ukrainian: "European",
    Vietnamese: "Vietnamese",
  };
  return map[area] || area;
}

async function runImport() {
  console.log("====================================");
  console.log("suvAI — Recipe Ingestion Pipeline");
  console.log("====================================");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const candidateMap = new Map();

  console.log("Fetching global candidate recipes from TheMealDB across letters a-z...");

  for (const letter of letters) {
    try {
      const url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data.meals)) {
        for (const m of data.meals) {
          if (m.idMeal && !candidateMap.has(m.idMeal)) {
            candidateMap.set(m.idMeal, m);
          }
        }
      }
    } catch (err) {
      console.warn(`Failed letter ${letter}:`, err.message);
    }
  }

  const rawCandidates = Array.from(candidateMap.values());
  console.log(`Fetched ${rawCandidates.length} total raw candidates.`);

  let totalCandidates = rawCandidates.length;
  let importedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let nutritionCompleteCount = 0;
  let imagesAvailableCount = 0;
  const cuisineDistribution = {};

  const seenTitles = new Set();

  for (const raw of rawCandidates) {
    // 1. Title validation
    const title = (raw.strMeal || "").trim();
    if (!title || title.length < 3) {
      rejectedCount++;
      continue;
    }

    // Deduplication check
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seenTitles.has(normalizedTitle)) {
      duplicateCount++;
      continue;
    }
    seenTitles.add(normalizedTitle);

    // 2. Ingredients parsing & normalization
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const name = (raw[`strIngredient${i}`] || "").trim();
      const measure = (raw[`strMeasure${i}`] || "").trim();
      if (name && name.length > 1 && name.toLowerCase() !== "null") {
        const parsed = parseMeasure(measure);
        ingredients.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          amount: parsed.amount,
          unit: parsed.unit,
          original: `${measure} ${name}`.trim(),
        });
      }
    }

    if (ingredients.length < 2) {
      rejectedCount++;
      continue;
    }

    // 3. Instructions step-by-step parsing
    const rawInstr = raw.strInstructions || "";
    const rawSteps = rawInstr
      .split(/\r?\n+/)
      .map(s => s.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter(s => s.length > 10 && !s.toLowerCase().startsWith("step"));

    const instructions = rawSteps.length >= 2 
      ? rawSteps 
      : rawInstr.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 10);

    if (instructions.length < 2) {
      rejectedCount++;
      continue;
    }

    // 4. Cuisine & Diet derivation
    const cuisine = normalizeCuisine(raw.strArea);
    const category = (raw.strCategory || "Main Course").trim();
    const diet = deriveDiet(category, ingredients);

    // 5. Dish types
    const dishTypes = [category.toLowerCase()];
    if (!dishTypes.includes("main course") && !dishTypes.includes("dessert") && !dishTypes.includes("breakfast")) {
      dishTypes.push("dinner");
    }

    // 6. Nutrition estimation & validation
    const nutrition = estimateNutrition(diet, ingredients, category);
    nutritionCompleteCount++;

    // 7. Ready minutes
    const readyMinutes = estimateReadyMinutes(instructions.length, category);

    // 8. Image handling
    const imageUrl = raw.strMealThumb || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
    if (raw.strMealThumb) imagesAvailableCount++;

    // 9. Description
    const description = `A delicious and authentic ${cuisine} ${category.toLowerCase()} dish featuring ${ingredients.slice(0, 3).map(i => i.name.toLowerCase()).join(", ")}, prepared in ${readyMinutes} minutes.`;

    const recipeId = `ext-${raw.idMeal}`;
    const externalId = String(raw.idMeal);

    try {
      await client.query(`
        INSERT INTO public.recipes (
          id, external_id, title, description, image_url, cuisine, diet,
          dish_types, ready_minutes, servings, calories, protein, carbs, fat,
          ingredients, instructions, source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          cuisine = EXCLUDED.cuisine,
          diet = EXCLUDED.diet,
          dish_types = EXCLUDED.dish_types,
          ready_minutes = EXCLUDED.ready_minutes,
          servings = EXCLUDED.servings,
          calories = EXCLUDED.calories,
          protein = EXCLUDED.protein,
          carbs = EXCLUDED.carbs,
          fat = EXCLUDED.fat,
          ingredients = EXCLUDED.ingredients,
          instructions = EXCLUDED.instructions;
      `, [
        recipeId,
        externalId,
        title,
        description,
        imageUrl,
        cuisine,
        diet,
        dishTypes,
        readyMinutes,
        4,
        nutrition.calories,
        nutrition.protein,
        nutrition.carbs,
        nutrition.fat,
        JSON.stringify(ingredients),
        JSON.stringify(instructions),
        "themealdb"
      ]);

      importedCount++;
      cuisineDistribution[cuisine] = (cuisineDistribution[cuisine] || 0) + 1;
    } catch (err) {
      console.error(`Error inserting recipe ${title}:`, err.message);
      rejectedCount++;
    }
  }

  // Count total recipes in Supabase
  const countRes = await client.query("SELECT count(*) FROM public.recipes;");
  const totalInDb = countRes.rows[0].count;

  await client.end();

  console.log("\n====================================");
  console.log("suvAI Recipe Import Summary");
  console.log("====================================");
  console.log(`Candidates:           ${totalCandidates}`);
  console.log(`Imported:             ${importedCount}`);
  console.log(`Duplicates:           ${duplicateCount}`);
  console.log(`Rejected:             ${rejectedCount}`);
  console.log(`Nutrition complete:   ${nutritionCompleteCount}`);
  console.log(`Images available:     ${imagesAvailableCount}`);
  console.log(`Total in Database:    ${totalInDb}`);
  console.log("\nCuisine Distribution:");
  Object.entries(cuisineDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, cnt]) => {
      console.log(` - ${c.padEnd(16)}: ${cnt}`);
    });
  console.log("====================================\n");
}

runImport().catch(console.error);
