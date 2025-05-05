// ✅ File: app/api/claim/route.js
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c';
const connection = new Connection(RPC_URL);

// 💰 Proje cüzdanı - fee SOL buraya gidecek
const TREASURY_WALLET = new PublicKey('HPBNVF9ATsnkDhGmQB4xoLC5tWBWQbTyBjsiQAN3dYXH');

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      wallet_address,
      amount,
      destination_wallet,
      token_ticker,
      network,
    } = body;

    if (!wallet_address || !amount || !destination_wallet) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const sender = new PublicKey(wallet_address);
    const transaction = new Transaction();

    // 🧠 0.5 USD SOL hesaplama (yaklaşık 0.005 SOL gibi alabilirsiniz, burayı isterseniz oracle ile dinamik yaparız)
    const feeInLamports = Math.floor(0.005 * 1e9); // 0.005 SOL

    const transferIx = SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: TREASURY_WALLET,
      lamports: feeInLamports,
    });

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender;
    transaction.add(transferIx);

    // Serialize transaction for client to sign
    const serializedTx = transaction.serialize({ requireAllSignatures: false }).toString('base64');

    // ✔️ Backend kaydını veritabanına sonra yapacağız (fee alındıktan sonra)

    return NextResponse.json({
      success: true,
      transaction: serializedTx,
    });
  } catch (error) {
    console.error('Error in /api/claim:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
