// ✅ File: app/api/coincarnation/stats/route.js
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(DISTINCT wallet_address) AS total_participants FROM participants;`
    );

    const { rows: totalRows } = await pool.query(
      `SELECT SUM(usd_value) AS total_usd FROM contributions;`
    );

    const participantCount = parseInt(countRows[0]?.total_participants || 0);
    const totalUsdValue = parseFloat(totalRows[0]?.total_usd || 0).toFixed(2);

    return NextResponse.json({
      totalWallets: participantCount,
      totalUSD: parseFloat(totalUsdValue),
    });
  } catch (err) {
    console.error('[Stats API Error]', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
