import { promises as fs } from 'fs';
import path from 'path';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// 🔗 QuickNode bağlantısı
const connection = new Connection("https://patient-dry-tab.solana-mainnet.quiknode.pro/28eced89e0df71d2d6ed0e0f8d7026e53ed9dd53/");

// 🎯 Coincarnation hedef cüzdan
const COINCARNATION_WALLET = "D7iqkQmY3ryNFtc9qseUv6kPeVjxsSD98hKN5q3rkYTd";

// 🔒 Redlist / Blacklist kontrol fonksiyonu
async function checkRedAndBlackLists(tokenMint, tokenChain, userTimestampISO) {
  const redlistPath = path.join(process.cwd(), 'data', 'redlist_tokens.json');
  const blacklistPath = path.join(process.cwd(), 'data', 'blacklist_tokens.json');

  const redlist = JSON.parse(await fs.readFile(redlistPath, 'utf-8'));
  const blacklist = JSON.parse(await fs.readFile(blacklistPath, 'utf-8'));

  const mintNormalized = tokenMint.trim().toLowerCase();
  const chainNormalized = tokenChain.trim().toLowerCase();
  const userTimestamp = new Date(userTimestampISO);

  const blackItem = blacklist.find(token =>
    token.mint.trim().toLowerCase() === mintNormalized &&
    token.chain.trim().toLowerCase() === chainNormalized
  );
  if (blackItem) {
    const addedAt = new Date(blackItem.addedAt);
    if (userTimestamp >= addedAt) {
      return { status: 'blocked', list: 'blacklist' };
    } else {
      return { status: 'invalidated', list: 'blacklist' };
    }
  }

  const redItem = redlist.find(token =>
    token.mint.trim().toLowerCase() === mintNormalized &&
    token.chain.trim().toLowerCase() === chainNormalized
  );
  if (redItem) {
    const addedAt = new Date(redItem.addedAt);
    if (userTimestamp >= addedAt) {
      return { status: 'blocked', list: 'redlist' };
    }
  }

  return { status: 'ok' };
}

export async function POST(req) {
  try {
    // ✅ Config dosyasından Coincarnation açık mı kontrolü
    const configPath = path.join(process.cwd(), 'public', 'config.json');
    const configData = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    if (!configData.coincarnation_active) {
      return Response.json({
        message: '🚫 Coincarnation is currently paused. Please try again later.'
      }, { status: 403 });
    }

    const body = await req.json();
    const { wallet_address, token_from, mint, amount, chain } = body;
    const timestamp = new Date().toISOString();

    const check = await checkRedAndBlackLists(mint, chain, timestamp);

    if (check.status === 'blocked') {
      return Response.json({
        message: `🚫 This token is on the ${check.list}. Coincarnation not allowed.`
      }, { status: 403 });
    }

    if (check.status === 'invalidated') {
      return Response.json({
        message: `❌ This token is now invalid. Your participation is recorded as invalidated. You may request a refund.`
      }, { status: 200 });
    }

    // 🧠 Cüzdanlar
    const senderPubkey = new PublicKey(wallet_address);
    const receiverPubkey = new PublicKey(COINCARNATION_WALLET);
    const transaction = new Transaction();

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = senderPubkey;

    if (mint === "SOL") {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: receiverPubkey,
          lamports: Math.floor(amount * 1e9),
        })
      );
    } else {
      const mintPubkey = new PublicKey(mint);
      const senderTokenAccount = await getAssociatedTokenAddress(mintPubkey, senderPubkey);
      const receiverTokenAccount = await getAssociatedTokenAddress(mintPubkey, receiverPubkey);

      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
      const decimals = mintInfo.value?.data?.parsed?.info?.decimals || 6;

      try {
        await getAccount(connection, receiverTokenAccount);
      } catch {
        return Response.json({
          error: `❌ Receiver token account does not exist for ${token_from}. Please contact support.`,
        }, { status: 500 });
      }

      transaction.add(
        createTransferInstruction(
          senderTokenAccount,
          receiverTokenAccount,
          senderPubkey,
          Math.floor(amount * (10 ** decimals)),
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    return Response.json({
      message: '✅ Transaction prepared.',
      transaction: transaction.serialize({ requireAllSignatures: false }).toString("base64")
    });

  } catch (err) {
    console.error('[Server Error]', err);
    return Response.json({
      message: '❌ Server error.',
      error: err.message || 'Unknown server error'
    }, { status: 500 });
  }
}
