// ✅ File: app/api/claim/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ Supabase bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Özel işlem için service role key kullanıyoruz
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { fromWallet, toWallet, amount, feeSignature } = body;

    if (!fromWallet || !toWallet || !amount || !feeSignature) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // ✅ İşlem kaydını veritabanına ekle
    const { error } = await supabase.from('claims').insert([
      {
        from_wallet: fromWallet,
        to_wallet: toWallet,
        amount: amount,
        fee_signature: feeSignature,
        claimed_at: new Date().toISOString(),
      }
    ]);

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save claim record.' }, { status: 500 });
    }

    // ✅ Token transferi entegre edildiğinde burada yapılacak

    return NextResponse.json({ success: true, tx: 'MEGY_TRANSFER_TX_PENDING' });
  } catch (err) {
    console.error('❌ Claim API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
