import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Missing wallet address' }, { status: 400 });
  }

  try {
    const client = await pool.connect();

    const result = await client.query(
      `SELECT wallet_address, megy_amount, claim_status, coincarnator_no, contribution_usd, share_ratio
       FROM claim_snapshots
       WHERE wallet_address = $1`,
      [wallet]
    );

    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'No data found for this wallet' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Neon query error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
