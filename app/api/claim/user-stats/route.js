import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  const { wallet } = await req.json();

  if (!wallet) {
    return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });
  }

  // Supabase'ten claim verilerini al
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('wallet_address', wallet)
    .order('claimed_at', { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const record = data?.[0];

  if (!record) {
    return NextResponse.json({ error: 'No claim found' }, { status: 404 });
  }

  // Geriye temel verileri döndür
  return NextResponse.json({
    coincarnatorNo: record.coincarnator_no || 999, // default
    contributionUSD: record.usd_value || 0,
    shareRatio: record.share_ratio || 0,
    claimableMEGY: record.amount || 0,
    claimStatus: true,
  });
}
