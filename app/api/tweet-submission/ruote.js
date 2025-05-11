// ✅ File: app/api/tweet-submission/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const { wallet, tweet, token, number } = await req.json();

    if (!wallet || !tweet || !token || !number) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    // Check for duplicates
    const { rows: existing } = await pool.query(
      'SELECT id FROM tweet_submissions WHERE wallet_address = $1 AND token_symbol = $2',
      [wallet, token]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Already submitted for this token.' }, { status: 409 });
    }

    // Insert new submission
    await pool.query(
      `INSERT INTO tweet_submissions (wallet_address, tweet_url, token_symbol, coincarnator_no, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [wallet, tweet, token, number]
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[Tweet Submission Error]', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
