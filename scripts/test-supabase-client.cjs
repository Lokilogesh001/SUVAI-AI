require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("Testing Supabase client with URL:", supabaseUrl);
console.log("Publishable key present:", Boolean(supabaseKey));

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClient() {
  try {
    // 1. Test recipes table read (public RLS)
    const { data: recipes, error: recipesError } = await supabase
      .from("recipes")
      .select("id, title, cuisine, diet")
      .limit(5);

    if (recipesError) {
      console.error("Error querying recipes via Supabase Client:", recipesError);
    } else {
      console.log("Successfully fetched recipes via Supabase client! Count:", recipes.length);
      console.log("Sample recipe:", recipes[0]);
    }

    // 2. Test auth getSession
    const { data: sessionData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error("Auth session query error:", authError);
    } else {
      console.log("Auth session query successful (active session:", Boolean(sessionData.session), ")");
    }

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

testClient();
