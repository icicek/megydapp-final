// ✅ File: app/api/ogdata/route.js
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Missing wallet address.' }, { status: 400 });
    }

    // 1. Katılımcı verisi
    const { rows: participantRows } = await pool.query(
      'SELECT coincarnator_no FROM participants WHERE wallet_address = $1',
      [wallet]
    );
    const coincarnator_no = participantRows[0]?.coincarnator_no || null;

    // 2. Kişisel katkı
    const { rows: myRows } = await pool.query(
      'SELECT SUM(usd_value) AS my_total FROM contributions WHERE wallet_address = $1',
      [wallet]
    );
    const myUsd = parseFloat(myRows[0]?.my_total || 0);

    // 3. Toplam katkı
    const { rows: totalRows } = await pool.query(
      'SELECT SUM(usd_value) AS total FROM contributions'
    );
    const totalUsd = parseFloat(totalRows[0]?.total || 0);

    const percent = totalUsd > 0 ? 100 * (1 - myUsd / totalUsd) : 100;

    return NextResponse.json({
      success: true,
      coincarnator_no,
      usd: myUsd,
      percent: parseFloat(percent.toFixed(2))
    });
  } catch (err) {
    console.error('[OG Data Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
