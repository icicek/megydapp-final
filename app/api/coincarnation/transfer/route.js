import { promises as fs } from 'fs';
import path from 'path';

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
    console.log('[🛑 Blacklist Match]', mintNormalized, chainNormalized, 'Added:', addedAt.toISOString(), 'Now:', userTimestamp.toISOString());

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
    console.log('[🛑 Redlist Match]', mintNormalized, chainNormalized, 'Added:', addedAt.toISOString(), 'Now:', userTimestamp.toISOString());

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

    const check = await checkRedAndBlackLists(mint, chain, timestamp);

    const participantsPath = path.join(process.cwd(), 'data', 'participants.json');
    const existing = JSON.parse(await fs.readFile(participantsPath, 'utf-8'));

    if (check.status === 'blocked') {
      return Response.json({
        message: `🚫 This token is on the ${check.list}. Coincarnation not allowed.`
      }, { status: 403 });
    }

    if (check.status === 'invalidated') {
      existing.push({
        id: existing.length + 1,
        wallet_address,
        token_from,
        mint,
        amount,
        chain,
        timestamp,
        status: 'invalidated',
        refund_requested: false
      });

      await fs.writeFile(participantsPath, JSON.stringify(existing, null, 2), 'utf-8');

      return Response.json({
        message: `❌ This token is now invalid. Your participation is recorded as invalidated. You may request a refund.`
      }, { status: 200 });
    }

    existing.push({
      id: existing.length + 1,
      wallet_address,
      token_from,
      mint,
      amount,
      chain,
      timestamp
    });

    await fs.writeFile(participantsPath, JSON.stringify(existing, null, 2), 'utf-8');

    return Response.json({ message: '✅ Coincarnation complete.' });

  } catch (err) {
    console.error('[Server Error]', err);
    return Response.json({ message: '❌ Server error.' }, { status: 500 });
  }
}
