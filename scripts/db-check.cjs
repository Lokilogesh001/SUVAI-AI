require("dotenv").config();
const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();
    console.log("Connected successfully!");

    const res = await client.query("SELECT current_database(), current_user;");
    console.log("Database info:", res.rows[0]);

    // Inspect existing tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Existing public tables:", tablesRes.rows.map(r => r.table_name));

  } catch (err) {
    console.error("Connection or query error:", err);
  } finally {
    await client.end();
  }
}

run();
