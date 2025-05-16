'use server';

import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Missing wallet address' }, { status: 400 });
  }

  try {
    const { rows } = await sql`
      SELECT token_symbol, token_amount, timestamp
      FROM contributions
      WHERE wallet_address = ${wallet}
      ORDER BY timestamp DESC
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No Coincarnation found' }, { status: 404 });
    }

    const latest = rows[0];

    return NextResponse.json({
      success: true,
      token: latest.token_symbol,
      amount: latest.token_amount,
      timestamp: latest.timestamp,
    });
  } catch (err) {
    console.error('DB error:', err);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
