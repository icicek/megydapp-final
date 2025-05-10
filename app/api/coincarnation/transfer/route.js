import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c";
const DESTINATION_WALLET = "HPBNVF9ATsnkDhGmQB4xoLC5tWBWQbTyBjsiQAN3dYXH"; // senin proje cüzdanın
const connection = new Connection(RPC_ENDPOINT, "confirmed");

export async function POST(req) {
  try {
    const { wallet_address, mint, amount } = await req.json();

    if (!wallet_address || !mint || !amount) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    const fromPubkey = new PublicKey(wallet_address);
    const toPubkey = new PublicKey(DESTINATION_WALLET);
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const transaction = new Transaction({ feePayer: fromPubkey, recentBlockhash });

    if (mint === "SOL") {
      // SOL transfer
      const lamports = Math.floor(parseFloat(amount) * 1e9);
      transaction.add(SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      }));
    } else {
      // SPL transfer
      const mintPubkey = new PublicKey(mint);
      const sourceAta = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
      const destAta = await getAssociatedTokenAddress(mintPubkey, toPubkey);

      const decimals = await connection.getParsedAccountInfo(mintPubkey);
      const decimalCount = decimals?.value?.data?.parsed?.info?.decimals || 9;
      const multiplier = 10 ** decimalCount;
      const tokenAmount = BigInt(parseFloat(amount) * multiplier);

      transaction.add(
        createTransferInstruction(
          sourceAta,
          destAta,
          fromPubkey,
          tokenAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    const serialized = transaction.serialize({ requireAllSignatures: false });
    const base64Tx = serialized.toString("base64");

    return Response.json({ transaction: base64Tx });
  } catch (err) {
    console.error("❌ Coincarnation Transfer API error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
