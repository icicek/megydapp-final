// ✅ pages/api/coincarnation-transfer.js
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import tokenMap from "@/data/token-map.json";

const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c";
const DESTINATION_WALLET = "D7iqkQmY3ryNFtc9qseUv6kPeVjxsSD98hKN5q3rkYTd";
const connection = new Connection(RPC_ENDPOINT, "confirmed");

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
    } = req.body;

    if (!wallet_address || !mint || !amount) {
      console.warn("⚠️ Missing required fields", { wallet_address, mint, amount });
      return res.status(400).json({ error: "Missing required fields." });
    }

    const fromPubkey = new PublicKey(wallet_address);
    const toPubkey = new PublicKey(DESTINATION_WALLET);
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const transaction = new Transaction({ feePayer: fromPubkey, recentBlockhash });

    let decimals = 9;
    let tokenAmount = parseFloat(amount);

    if (mint === "SOL") {
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

    const serialized = transaction.serialize({ requireAllSignatures: false });
    const base64Tx = serialized.toString("base64");

    res.status(200).json({ transaction: base64Tx });
  } catch (err) {
    console.error("❌ Coincarnation Transfer Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
