import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();

    const { wallet_address, claim_address, amount, claimed_at } = body;

    const { data, error } = await supabase.from('claims').insert([
      {
        wallet_address,
        claim_address,
        amount,
        claimed_at,
      }
    ]);

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('❌ API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
