// ✅ File: app/api/coincarnation/transfer/route.js
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
import pool from '@/lib/db';

const connection = new Connection("https://patient-dry-tab.solana-mainnet.quiknode.pro/28eced89e0df71d2d6ed0e0f8d7026e53ed9dd53/");
const COINCARNATION_WALLET = "D7iqkQmY3ryNFtc9qseUv6kPeVjxsSD98hKN5q3rkYTd";

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
    const configPath = path.join(process.cwd(), 'public', 'config.json');
    const configData = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    if (!configData.coincarnation_active) {
      return Response.json({ message: '🚫 Coincarnation is currently paused.' }, { status: 403 });
    }

    const body = await req.json();
    const { wallet_address, token_from, mint, amount, chain } = body;
    const timestamp = new Date().toISOString();

    const check = await checkRedAndBlackLists(mint, chain, timestamp);
    if (check.status === 'blocked') {
      return Response.json({ message: `🚫 This token is on the ${check.list}.` }, { status: 403 });
    }
    if (check.status === 'invalidated') {
      return Response.json({ message: `❌ Token invalidated. Refund possible.` }, { status: 200 });
    }

    const senderPubkey = new PublicKey(wallet_address);
    const receiverPubkey = new PublicKey(COINCARNATION_WALLET);
    const transaction = new Transaction();

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = senderPubkey;

    let decimals = 9;
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
      decimals = mintInfo.value?.data?.parsed?.info?.decimals || 6;

      try {
        await getAccount(connection, receiverTokenAccount);
      } catch {
        return Response.json({ error: `❌ Receiver token account does not exist.` }, { status: 500 });
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

    // 💾 Neon veritabanı işlemleri
    const alreadyExists = await pool.query(
      `SELECT * FROM claim_snapshots WHERE LOWER(wallet_address) = LOWER($1) LIMIT 1;`,
      [wallet_address]
    );

    if (alreadyExists.rows.length === 0) {
      // İlk kez katılıyor → Coincarnator No ver
      await pool.query(
        `INSERT INTO claim_snapshots (
          wallet_address,
          megy_amount,
          claim_status,
          coincarnator_no,
          contribution_usd,
          share_ratio
        ) VALUES (
          $1,
          0,
          false,
          (SELECT COUNT(*) + 1 FROM claim_snapshots),
          $2,
          0.0
        );`,
        [wallet_address, amount]
      );
    } else {
      // Daha önce katılmış → Sadece contribution_usd güncelle
      await pool.query(
        `UPDATE claim_snapshots
         SET contribution_usd = contribution_usd + $2
         WHERE LOWER(wallet_address) = LOWER($1);`,
        [wallet_address, amount]
      );
    }

    return Response.json({
      message: '✅ Transaction prepared.',
      transaction: transaction.serialize({ requireAllSignatures: false }).toString("base64")
    });

  } catch (err) {
    console.error('[Server Error]', err);
    return Response.json({ message: '❌ Server error.', error: err.message }, { status: 500 });
  }
}
