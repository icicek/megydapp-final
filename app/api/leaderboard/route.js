// ✅ File: app/api/leaderboard/route.js
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT wallet_address, contribution_usd, coincarnator_no
       FROM claim_snapshots
       ORDER BY contribution_usd DESC
       LIMIT 100`
    );

    return NextResponse.json({ success: true, leaderboard: rows });
  } catch (err) {
    console.error('[Leaderboard API Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to load leaderboard.' }, { status: 500 });
  }
}
