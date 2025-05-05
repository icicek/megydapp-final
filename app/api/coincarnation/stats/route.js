// ✅ File: app/api/coincarnation/stats/route.js
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) AS total_participants, SUM(contribution_usd) AS total_usd FROM claim_snapshots;`
    );

    const { rows: latestRows } = await pool.query(
      `SELECT wallet_address, token_from FROM claim_snapshots ORDER BY created_at DESC LIMIT 1;`
    );

    const participantCount = parseInt(countRows[0].total_participants || 0);
    const totalUsdValue = parseFloat(countRows[0].total_usd || 0).toFixed(2);
    const latest = latestRows[0] || null;

    return NextResponse.json({
      participantCount,
      totalUsdValue,
      latest,
    });
  } catch (err) {
    console.error('[Stats API Error]', err);
    return new Response('Failed to fetch stats', { status: 500 });
  }
}
