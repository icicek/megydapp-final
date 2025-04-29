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
const connection = new Connection("https://dry-sly-shard.solana-mainnet.quiknode.pro/2caf002b99622...");

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
    const body = await req.json();
    const { wallet_address, token_from, mint, amount, chain } = body;
    const timestamp = new Date().toISOString();

    // 🔍 Blacklist / Redlist kontrolü
    const check = await checkRedAndBlackLists(mint, chain, timestamp);
    // const participantsPath = path.join(process.cwd(), 'data', 'participants.json');
    // const existing = JSON.parse(await fs.readFile(participantsPath, 'utf-8'));

    if (check.status === 'blocked') {
      return Response.json({
        message: `🚫 This token is on the ${check.list}. Coincarnation not allowed.`
      }, { status: 403 });
    }

    if (check.status === 'invalidated') {
      // existing.push({
        // id: existing.length + 1,
        // wallet_address,
        // token_from,
        // mint,
        // amount,
        // chain,
        // timestamp,
        // status: 'invalidated',
        // refund_requested: false
      // });
      // await fs.writeFile(participantsPath, JSON.stringify(existing, null, 2), 'utf-8');
      return Response.json({
        message: `❌ This token is now invalid. Your participation is recorded as invalidated. You may request a refund.`
      }, { status: 200 });
    }

    // 🧠 Cüzdanlar
    const senderPubkey = new PublicKey(wallet_address);
    const receiverPubkey = new PublicKey(COINCARNATION_WALLET);
    const transaction = new Transaction();

    if (mint === "SOL") {
      // 💸 SOL gönderimi
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: receiverPubkey,
          lamports: Math.floor(amount * 1e9),
        })
      );
    } else {
      // 🪙 SPL token gönderimi
      const mintPubkey = new PublicKey(mint);
      const senderTokenAccount = await getAssociatedTokenAddress(mintPubkey, senderPubkey);
      const receiverTokenAccount = await getAssociatedTokenAddress(mintPubkey, receiverPubkey);

      // 🔎 SPL token decimal bilgisi alınır
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
      const decimals = mintInfo.value?.data?.parsed?.info?.decimals || 6;

      // 📦 Alıcı token hesabı var mı kontrolü
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
          Math.floor(amount * 10 ** decimals),
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    // 🧾 Katılımcı kayıt işlemi
    existing.push({
      id: existing.length + 1,
      wallet_address,
      token_from,
      mint,
      amount,
      chain,
      timestamp,
      status: 'completed'
    });

    await fs.writeFile(participantsPath, JSON.stringify(existing, null, 2), 'utf-8');

    // 🧠 Phantom’a gönderilmek üzere base64-encoded işlem döndürülüyor
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
