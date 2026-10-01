require("dotenv").config();
const { Client } = require("pg");
const esbuild = require("esbuild");

async function seed() {
  const result = esbuild.buildSync({
    entryPoints: ["src/services/recipes/seedRecipes.ts"],
    write: false,
    format: "cjs",
    bundle: true,
  });

  const code = result.outputFiles[0].text;
  const m = { exports: {} };
  const fn = new Function("module", "exports", code);
  fn(m, m.exports);

  const recipes = m.exports.CURATED_GLOBAL_RECIPES;
  console.log(`Loaded ${recipes?.length || 0} curated recipes from seedRecipes.ts`);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    for (const r of recipes) {
      await client.query(`
        INSERT INTO public.recipes (
          id, title, description, image_url, cuisine, diet, dish_types,
          ready_minutes, servings, calories, protein, carbs, fat,
          ingredients, instructions, source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
        r.id,
        r.title,
        r.description || "",
        r.image || "",
        r.cuisine || "general",
        r.diet || "all",
        r.dishTypes || [],
        r.readyInMinutes || 30,
        r.servings || 4,
        r.calories || (r.nutrition?.calories || null),
        r.nutrition?.protein || null,
        r.nutrition?.carbs || null,
        r.nutrition?.fat || null,
        JSON.stringify(r.ingredients || []),
        JSON.stringify(r.instructions || []),
        "curated_global"
      ]);
    }

    const checkRes = await client.query("SELECT count(*) FROM public.recipes;");
    console.log(`Seeding complete. Total recipes in public.recipes: ${checkRes.rows[0].count}`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.end();
  }
}

seed();
