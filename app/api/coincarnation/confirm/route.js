// ✅ File: app/api/coincarnation/confirm/route.js
import { Connection } from '@solana/web3.js';
import pool from '@/lib/db';

const connection = new Connection("https://patient-dry-tab.solana-mainnet.quiknode.pro/28eced89e0df71d2d6ed0e0f8d7026e53ed9dd53/");

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      wallet_address,
      token_from,
      mint,
      amount,
      usd_value,
      chain,
      signature,
      referral_code
    } = body;

    const userAgent = req.headers.get('user-agent') || null;

    // ✅ İşlem gerçekten blockchain üzerinde gerçekleşti mi?
    const confirmation = await connection.getConfirmedTransaction(signature, 'confirmed');

    if (!confirmation || !confirmation.meta || confirmation.meta.err) {
      return Response.json({ message: '❌ Transaction not confirmed or failed.' }, { status: 400 });
    }

    // ✅ İlk katılım mı? Kontrol et
    const existing = await pool.query(
      `SELECT * FROM participants WHERE LOWER(wallet_address) = LOWER($1) LIMIT 1;`,
      [wallet_address]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO participants (
          wallet_address, token_symbol, token_contract, network,
          token_amount, usd_value, transaction_signature, referral_code,
          user_agent, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());`,
        [
          wallet_address,
          token_from,
          mint,
          chain,
          amount,
          usd_value || amount,
          signature,
          referral_code || null,
          userAgent
        ]
      );
    }

    // 🧾 contributions tablosuna her işlem eklenir
    await pool.query(
      `INSERT INTO contributions (
        wallet_address, token_symbol, token_contract, network,
        token_amount, usd_value, transaction_signature, referral_code,
        user_agent, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());`,
      [
        wallet_address,
        token_from,
        mint,
        chain,
        amount,
        usd_value || amount,
        signature,
        referral_code || null,
        userAgent
      ]
    );

    return Response.json({ message: '✅ Transaction confirmed and saved.' });

  } catch (err) {
    console.error('[Confirm Error]', err);
    return Response.json({ message: '❌ Server error.', error: err.message }, { status: 500 });
  }
}
