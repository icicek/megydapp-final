import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL); // Vercel'de tanımlanacak

export async function POST(req) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address missing' }, { status: 400 });
    }

    const result = await sql`
      SELECT token_symbol, token_amount, usd_value, timestamp
      FROM contributions
      WHERE wallet_address = ${wallet}
      ORDER BY timestamp DESC
    `;

    return NextResponse.json({
      success: true,
      contributions: result,
    });
  } catch (error) {
    console.error('❌ Error fetching contributions from Neon:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
