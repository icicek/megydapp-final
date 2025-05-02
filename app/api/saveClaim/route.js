// ✅ File: app/api/saveClaim/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Environment değişkenlerinden Supabase bağlantısı oluştur
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ Bu key .env dosyasında olmalı, public değil!
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { walletAddress, targetAddress, amount, solFeeTx, megyClaimTx } = body;

    if (!walletAddress || !targetAddress || !amount || !solFeeTx) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('claims')
      .insert([
        {
          wallet_address: walletAddress,
          target_address: targetAddress,
          amount,
          sol_fee_tx: solFeeTx,
          megy_claim_tx: megyClaimTx || null,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ saveClaim API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
