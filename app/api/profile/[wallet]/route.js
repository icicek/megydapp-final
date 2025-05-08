// ✅ File: app/api/profile/[wallet]/route.js
import pool from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const wallet = params.wallet;

    // İlk katılım kontrolü (participants)
    const existing = await pool.query(
      `SELECT * FROM participants WHERE LOWER(wallet_address) = LOWER($1) LIMIT 1;`,
      [wallet]
    );

    if (existing.rows.length === 0) {
      return Response.json({ exists: false });
    }

    const coincarnator_no = existing.rows[0].coincarnator_no;

    // Toplam katkı USD
    const totalRes = await pool.query(
      `SELECT SUM(usd_value) as total_usd FROM contributions WHERE LOWER(wallet_address) = LOWER($1);`,
      [wallet]
    );
    const total_usd = parseFloat(totalRes.rows[0]?.total_usd || 0);

    // Token bazlı katkılar
    const contribs = await pool.query(
      `SELECT token_symbol, SUM(token_amount) AS total_amount, SUM(usd_value) AS total_usd
       FROM contributions
       WHERE LOWER(wallet_address) = LOWER($1)
       GROUP BY token_symbol
       ORDER BY total_usd DESC;`,
      [wallet]
    );

    const contributions = contribs.rows.map(row => ({
      token: row.token_symbol,
      amount: parseFloat(row.total_amount),
      usd: parseFloat(row.total_usd),
    }));

    return Response.json({
      exists: true,
      coincarnator_no, // ✅ yeni eklendi
      total_usd,
      contributions,
    });

  } catch (err) {
    console.error('[Profile API Error]', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
