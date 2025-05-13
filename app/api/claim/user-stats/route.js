// ✅ File: app/api/claim/user-stats/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Neon bağlantısı

export async function POST(req) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT *
       FROM claims
       WHERE wallet_address = $1
       ORDER BY claimed_at DESC
       LIMIT 1`,
      [wallet]
    );

    const record = rows?.[0];

    if (!record) {
      return NextResponse.json({ error: 'No claim found' }, { status: 404 });
    }

    return NextResponse.json({
      coincarnatorNo: record.coincarnator_no || 999,
      contributionUSD: parseFloat(record.usd_value || 0),
      shareRatio: parseFloat(record.share_ratio || 0),
      claimableMEGY: parseFloat(record.amount || 0),
      claimStatus: true,
    });
  } catch (err) {
    console.error('User stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
