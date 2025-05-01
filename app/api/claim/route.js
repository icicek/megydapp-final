// ✅ File: app/api/claim/route.js

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { fromWallet, toWallet, amount, feeSignature } = body;

    // ✅ 1. Giriş doğrulama
    if (!fromWallet || !toWallet || !amount || !feeSignature) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // ✅ 2. Ödeme kontrolü (şimdilik dummy kontrol)
    // Gerçek fee doğrulaması için explorer API veya QuickNode RPC ile işlem teyidi gerekir
    console.log('✅ Fee signature received:', feeSignature);

    // ✅ 3. Şimdilik sadece log tutalım
    console.log('💾 Claim request:', {
      fromWallet,
      toWallet,
      amount,
      feeSignature,
    });

    // ✅ 4. İleride burada MEGY token transfer işlemi yapılacak (mint sonrası)

    // ✅ 5. Başarılı yanıt dön
    return NextResponse.json({ success: true, tx: 'MEGY_TRANSFER_TX_PENDING' });
  } catch (err) {
    console.error('❌ Claim API error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
