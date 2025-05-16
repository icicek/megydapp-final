import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address missing' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT token_symbol, token_amount, usd_value, timestamp
      FROM contributions
      WHERE wallet_address = ${wallet}
      ORDER BY timestamp DESC
    `;

    return NextResponse.json({ success: true, contributions: rows });
  } catch (error) {
    console.error('❌ Error fetching contributions:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
