// ✅ pages/api/last-coincarnation.js
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const wallet = req.query.wallet;

  if (!wallet) {
    return res.status(400).json({ success: false, error: 'Missing wallet address' });
  }

  try {
    console.log("📡 Calling Neon for last contribution:", wallet);

    const result = await sql`
      SELECT token_symbol, token_amount, timestamp
      FROM contributions
      WHERE wallet_address = ${wallet}
      ORDER BY timestamp DESC
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No Coincarnation found' });
    }

    const latest = rows[0];
    return res.status(200).json({
      success: true,
      token: latest.token_symbol,
      amount: latest.token_amount,
      timestamp: latest.timestamp,
    });

  } catch (err) {
    console.error('❌ Neon DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error' });
  }
}
