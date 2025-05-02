export async function POST(req) {
  try {
    const body = await req.json();
    const { fromWallet, toWallet, amount, feeSignature } = body;

    console.log('✅ Received claim payload:', body);

    if (!fromWallet || !toWallet || !amount || !feeSignature) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { error } = await supabase.from('claims').insert([
      {
        from_wallet: fromWallet,
        to_wallet: toWallet,
        amount: amount,
        fee_signature: feeSignature,
        claimed_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return NextResponse.json({ error: error.message || 'Failed to save claim record.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tx: 'MEGY_TRANSFER_TX_PENDING' });
  } catch (err) {
    console.error('❌ Claim API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
