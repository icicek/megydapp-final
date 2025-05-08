// ✅ File: app/api/generate-megy-image/route.js
import { generateMegyImage } from '@/lib/generateMegyImage';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { number, amount, percent } = await req.json();

    if (!number || !amount || percent === undefined) {
      return NextResponse.json({ success: false, error: 'Missing parameters.' }, { status: 400 });
    }

    const result = await generateMegyImage({
      number: parseInt(number),
      amount: parseFloat(amount),
      percent: parseFloat(percent),
    });

    if (result) {
      return NextResponse.json({
        success: true,
        message: '✅ OG image generated successfully.',
        number,
        amount,
        percent,
      });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to generate image.' }, { status: 500 });
    }
  } catch (err) {
    console.error('[Image Generation API Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
