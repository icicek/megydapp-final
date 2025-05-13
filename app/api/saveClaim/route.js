import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Neon PostgreSQL bağlantısı

export async function POST(req) {
  try {
    const body = await req.json();
    const { wallet, amount, share_ratio, usd_value, coincarnator_no } = body;

    if (!wallet || !amount) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO claims (wallet_address, amount, share_ratio, usd_value, coincarnator_no, claimed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [wallet, amount, share_ratio, usd_value, coincarnator_no]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Save Claim Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
