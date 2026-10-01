require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const schemaPath = path.join(__dirname, "..", "supabase", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  console.log("Connecting to PostgreSQL to apply suvAI schema...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    console.log("Executing schema.sql...");
    await client.query(sql);
    console.log("schema.sql executed successfully!");

    // Verify all 7 tables exist
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("Verified public tables:", tablesCheck.rows.map(r => r.table_name));

    // Verify RLS is enabled on all tables
    const rlsCheck = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    console.log("RLS Status:");
    tablesCheck.rows.forEach(t => {
      const row = rlsCheck.rows.find(r => r.tablename === t.table_name);
      console.log(` - ${t.table_name}: ${row?.rowsecurity ? 'RLS ENABLED' : 'NO RLS'}`);
    });

    // Check triggers on auth.users
    const triggerCheck = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table 
      FROM information_schema.triggers 
      WHERE event_object_schema = 'auth' AND event_object_table = 'users';
    `);
    console.log("Auth triggers:", triggerCheck.rows);

  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
