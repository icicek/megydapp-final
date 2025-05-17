// ✅ pages/api/coincarnation-transfer.js
console.log("🌐 DATABASE_URL:", process.env.DATABASE_URL);

import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { neon } from "@neondatabase/serverless";
import tokenMap from "@/data/token-map.json";

const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c";
const DESTINATION_WALLET = "D7iqkQmY3ryNFtc9qseUv6kPeVjxsSD98hKN5q3rkYTd";
const connection = new Connection(RPC_ENDPOINT, "confirmed");
const sql = neon(process.env.DATABASE_URL);

// Fiyat verisi için geçici fiyat haritası (CoinGecko API yerine şimdilik statik değerler)
const PRICE_MAP = {
  SOL: 145.0,
  FARTCOIN: 0.000032,
  SOFAC: 0.00074,
  EGG: 0.0075,
  NEVER: 0.0012,
};

export default async function handler(req, res) {
  console.log("✅ /api/coincarnation-transfer çalıştı!");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      wallet_address,
      mint,
      amount,
      referral_code = null,
      user_agent = null,
    } = req.body;

    if (!wallet_address || !mint || !amount) {
      console.warn("⚠️ Missing required fields", { wallet_address, mint, amount });
      return res.status(400).json({ error: "Missing required fields." });
    }

    const fromPubkey = new PublicKey(wallet_address);
    const toPubkey = new PublicKey(DESTINATION_WALLET);
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const transaction = new Transaction({ feePayer: fromPubkey, recentBlockhash });

    let tokenSymbol = tokenMap[mint] || "UNKNOWN";
    let decimals = 9;
    let tokenAmount = 0;
    let usdValue = 0;
    let transaction_signature = "PENDING";

    if (mint === "SOL") {
      tokenSymbol = "SOL";
      const lamports = Math.floor(parseFloat(amount) * 1e9);
      tokenAmount = lamports / 1e9;
      usdValue = tokenAmount * (PRICE_MAP[tokenSymbol] || 0);
      transaction.add(
        SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
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
      usdValue = tokenAmount * (PRICE_MAP[tokenSymbol] || 0);

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

    console.log("📥 Writing to Neon contributions table...", {
      wallet_address,
      tokenSymbol,
      mint,
      tokenAmount,
      usdValue,
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
        ${usdValue},
        ${transaction_signature},
        ${referral_code},
        ${user_agent},
        NOW()
      )
    `;
    console.log("✅ Neon insert başarıyla gerçekleşti!");

    const serialized = transaction.serialize({ requireAllSignatures: false });
    const base64Tx = serialized.toString("base64");

    res.status(200).json({ transaction: base64Tx });
  } catch (err) {
    console.error("❌ Coincarnation Transfer Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
