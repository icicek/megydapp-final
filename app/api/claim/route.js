// ✅ File: app/api/claim/route.js
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      wallet_address,
      amount,
      tx_hash,
      destination_wallet,
      token_ticker,
      network,
    } = body;

    if (!wallet_address || !amount || !destination_wallet) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const result = await pool.query(
      `
      INSERT INTO claims (
        wallet_address,
        amount,
        tx_hash,
        destination_wallet,
        token_ticker,
        network,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'claimed')
      RETURNING *;
      `,
      [wallet_address, amount, tx_hash, destination_wallet, token_ticker, network]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error in /api/claim:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
