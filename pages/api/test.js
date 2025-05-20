// ✅ /pages/api/test.js
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // .env.local içinde tanımlı
});

export default async function handler(req, res) {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
