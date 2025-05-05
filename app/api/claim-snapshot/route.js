// ✅ File: app/api/claim-snapshot/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet address missing.' }, { status: 400 });
    }

    // En son snapshot'ı çek (id'ye göre ters sırala, sadece 1 tanesi alınsın)
    const { rows } = await pool.query(
      `SELECT * FROM claim_snapshots WHERE LOWER(wallet_address) = LOWER($1) ORDER BY id DESC LIMIT 1;`,
      [wallet]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[Claim Snapshot API Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
