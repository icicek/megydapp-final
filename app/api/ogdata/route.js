import pool from '@/lib/db';
import { NextResponse } from 'next/server';
const PImage = require('pureimage'); 
import { Readable } from 'stream';

// ✅ USD fiyatı çekme fonksiyonu
async function getTokenUsdValue(mintAddress) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/solana/contract/${mintAddress}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Token not found on CoinGecko");

    const data = await response.json();
    const usdPrice = data?.market_data?.current_price?.usd;

    return usdPrice ? parseFloat(usdPrice) : 0;
  } catch (err) {
    console.warn(`[Price Fetch Warning] ${mintAddress}:`, err.message);
    return 0;
  }
}

// ✅ Görsel üret ve UploadThing'e gönder
async function generateAndUploadImage({ id, token, usd }) {
  const width = 600;
  const height = 600;
  const img = PImage.make(width, height);
  const ctx = img.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'white';
  ctx.font = '28pt Arial';
  ctx.fillText(`Coincarnator #${id}`, 100, 200);
  ctx.fillText(`Token: $${token}`, 100, 260);
  ctx.fillText(`USD: $${usd}`, 100, 320);

  const stream = PImage.encodePNGToStream(img, Readable.from([]));
  const buffer = await new Promise((resolve) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const file = new File([buffer], `coincarnator_${id}.png`, { type: 'image/png' });

  const { uploadFiles } = await import('@/utils/uploadthingClient');
  const res = await uploadFiles('imageUploader', [file]);
  return res[0].url;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    const token_symbol = searchParams.get('token') || 'UNKNOWN';
    const token_contract = searchParams.get('mint') || 'UNKNOWN';
    const token_amount = parseFloat(searchParams.get('amount') || '0');
    const user_agent = req.headers.get('user-agent') || 'unknown';

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Missing wallet address.' }, { status: 400 });
    }

    const usdPrice = await getTokenUsdValue(token_contract);
    const usdValue = parseFloat((usdPrice * token_amount).toFixed(6));

    const { rows: existing } = await pool.query(
      'SELECT id FROM participants WHERE wallet_address = $1',
      [wallet]
    );

    let coincarnator_no;

    if (existing.length === 0) {
      const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM participants');
      coincarnator_no = parseInt(countRows[0].count) + 1;

      await pool.query(
        `INSERT INTO participants
        (wallet_address, token_symbol, token_contract, network, token_amount, usd_value, transaction_signature, user_agent, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          wallet,
          token_symbol,
          token_contract,
          'solana',
          token_amount,
          usdValue,
          '',
          user_agent
        ]
      );
    } else {
      const { rows } = await pool.query(
        'SELECT id FROM participants WHERE wallet_address = $1',
        [wallet]
      );
      coincarnator_no = rows[0].id;
    }

    await pool.query(
      `INSERT INTO contributions
      (wallet_address, token_symbol, token_contract, network, token_amount, usd_value, transaction_signature, user_agent, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        wallet,
        token_symbol,
        token_contract,
        'solana',
        token_amount,
        usdValue,
        '',
        user_agent
      ]
    );

    const { rows: myRows } = await pool.query(
      'SELECT SUM(usd_value) AS my_total FROM contributions WHERE wallet_address = $1',
      [wallet]
    );
    const myUsd = parseFloat(myRows[0]?.my_total || 0);

    const { rows: totalRows } = await pool.query(
      'SELECT SUM(usd_value) AS total FROM contributions'
    );
    const totalUsd = parseFloat(totalRows[0]?.total || 0);

    const percent = totalUsd > 0 ? 100 * (1 - myUsd / totalUsd) : 100;

    const imageUrl = await generateAndUploadImage({
      id: coincarnator_no,
      token: token_symbol,
      usd: usdValue,
    });

    return NextResponse.json({
      success: true,
      coincarnator_no,
      usd: myUsd,
      percent: parseFloat(percent.toFixed(2)),
      imageUrl
    });

  } catch (err) {
    console.error('[OG Data Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
