import { Connection, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { NextResponse } from 'next/server';

const connection = new Connection("https://api.mainnet-beta.solana.com"); // ya da QuickNode

// ✅ Claim ücreti nereye gidecek?
const TREASURY_WALLET = "HPBNVF9ATsnkDhGmQB4xoLC5tWBWQbTyBjsiQAN3dYXH"; // yeni adres buraya

export async function POST(req) {
  try {
    const { from } = await req.json();

    if (!from) {
      return NextResponse.json({ error: 'Missing sender address.' }, { status: 400 });
    }

    const sender = new PublicKey(from);
    const receiver = new PublicKey(TREASURY_WALLET);
    const transaction = new Transaction();

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: receiver,
        lamports: 0.005 * 1e9, // 0.005 SOL
      })
    );

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = sender;

    const serializedTx = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({
      success: true,
      transaction: Buffer.from(serializedTx).toString('base64'),
    });
  } catch (err) {
    console.error('Error generating claim fee transaction:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
