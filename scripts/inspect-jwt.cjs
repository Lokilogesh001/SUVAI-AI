require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function check() {
  await client.connect();
  try {
    const res = await client.query("SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%'");
    console.log("pg_settings jwt:", res.rows);
  } catch (e) {
    console.log("error:", e.message);
  }
  await client.end();
}

check();
