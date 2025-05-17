console.log("🚀 /api/coincarnation/transfer called!");

import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { neon } from "@neondatabase/serverless";
import tokenMap from "@/data/token-map.json";

export const runtime = 'nodejs'; // 🧠 Mutlaka burada olmalı

const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c";
const DESTINATION_WALLET = "D7iqkQmY3ryNFtc9qseUv6kPeVjxsSD98hKN5q3rkYTd";
const connection = new Connection(RPC_ENDPOINT, "confirmed");
const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const {
      wallet_address,
      mint,
      amount,
      usd_value = 0,
      referral_code = null,
      user_agent = null,
    } = await req.json();

    if (!wallet_address || !mint || !amount) {
      console.warn("⚠️ Missing required fields", { wallet_address, mint, amount });
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    const fromPubkey = new PublicKey(wallet_address);
    const toPubkey = new PublicKey(DESTINATION_WALLET);
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const transaction = new Transaction({ feePayer: fromPubkey, recentBlockhash });

    let tokenSymbol = tokenMap[mint] || "UNKNOWN";
    let decimals = 9;
    let tokenAmount = 0;
    let transaction_signature = "PENDING";

    if (mint === "SOL") {
      tokenSymbol = "SOL";
      tokenAmount = parseFloat(amount);
      const lamports = Math.floor(tokenAmount * 1e9);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );
    } else {
      const mintPubkey = new PublicKey(mint);
      const sourceAta = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
      const destAta = await getAssociatedTokenAddress(mintPubkey, toPubkey);

      try {
        const parsed = await connection.getParsedAccountInfo(mintPubkey);
        decimals = parsed?.value?.data?.parsed?.info?.decimals || 9;
      } catch (e) {
        console.warn(`⚠️ Couldn't fetch decimals for ${mint}, defaulting to 9`);
      }

      const multiplier = 10 ** decimals;
      tokenAmount = parseFloat(amount);
      const rawAmount = BigInt((tokenAmount * multiplier).toFixed(0));

      transaction.add(
        createTransferInstruction(
          sourceAta,
          destAta,
          fromPubkey,
          rawAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    // 🔍 DEBUG: Veritabanına yazılmadan önce log
    console.log("📥 Writing to Neon contributions table:", {
      wallet_address,
      tokenSymbol,
      token_contract: mint,
      network: 'solana',
      tokenAmount,
      usd_value,
    });
    
    console.log("📥 Attempting Neon insert...", {
      wallet_address,
      mint,
      amount
    });
    
    await sql`
      INSERT INTO contributions (
        wallet_address,
        token_symbol,
        token_contract,
        network,
        token_amount,
        usd_value,
        transaction_signature,
        referral_code,
        user_agent,
        timestamp
      ) VALUES (
        ${wallet_address},
        ${tokenSymbol},
        ${mint},
        'solana',
        ${tokenAmount},
        ${usd_value},
        ${transaction_signature},
        ${referral_code},
        ${user_agent},
        NOW()
      )
    `;

    console.log("✅ Successfully inserted into Neon DB");

    const serialized = transaction.serialize({ requireAllSignatures: false });
    const base64Tx = serialized.toString("base64");

    return Response.json({ transaction: base64Tx });
  } catch (err) {
    console.error("❌ Coincarnation Transfer Error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
