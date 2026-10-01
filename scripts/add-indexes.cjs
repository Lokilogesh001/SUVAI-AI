require("dotenv").config();
const { Client } = require("pg");

async function addIndexes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Adding performance indexes to PostgreSQL...");

  const queries = [
    "CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON public.recipes(cuisine);",
    "CREATE INDEX IF NOT EXISTS idx_recipes_diet ON public.recipes(diet);",
    "CREATE INDEX IF NOT EXISTS idx_recipes_ready_minutes ON public.recipes(ready_minutes);",
    "CREATE INDEX IF NOT EXISTS idx_recipes_external_id ON public.recipes(external_id);",
    "CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm ON public.recipes USING gin (to_tsvector('english', title));",
    "CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON public.recipe_interactions(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_interactions_recipe_id ON public.recipe_interactions(recipe_id);",
    "CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON public.meal_plans(user_id, date);",
    "CREATE INDEX IF NOT EXISTS idx_grocery_items_user_id ON public.grocery_items(user_id);",
  ];

  for (const q of queries) {
    try {
      await client.query(q);
      console.log("Success:", q.slice(0, 50));
    } catch (err) {
      console.warn("Index notice:", err.message);
    }
  }

  const res = await client.query("SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';");
  console.log("Current public indexes count:", res.rows.length);
  res.rows.forEach(r => console.log(` - [${r.tablename}] ${r.indexname}`));

  await client.end();
}

addIndexes().catch(console.error);
