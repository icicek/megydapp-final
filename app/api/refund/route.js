import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { wallet_address, mint, chain } = await req.json();
    const mintNormalized = mint.trim().toLowerCase();

    // File paths
    const participantsPath = path.join(process.cwd(), 'data', 'participants.json');
    const blacklistPath = path.join(process.cwd(), 'data', 'blacklist_tokens.json');

    // Load data
    const participants = JSON.parse(await fs.readFile(participantsPath, 'utf-8'));
    const blacklist = JSON.parse(await fs.readFile(blacklistPath, 'utf-8'));

    // Is the mint blacklisted on this chain?
    const isBlacklisted = blacklist.some(token =>
      token.mint.trim().toLowerCase() === mintNormalized &&
      token.chain === chain
    );

    if (!isBlacklisted) {
      return Response.json({ message: '🚫 Refunds are only available for Blacklisted tokens.' }, { status: 403 });
    }

    // Find eligible participant record
    const index = participants.findIndex(p =>
      p.wallet_address === wallet_address &&
      p.mint.trim().toLowerCase() === mintNormalized &&
      p.chain === chain &&
      p.status === 'invalidated' &&
      p.refund_requested === false
    );

    if (index === -1) {
      return Response.json({ message: '⚠️ No valid refund found or already requested.' }, { status: 404 });
    }

    // Check minimum amount for refund
    if (participants[index].amount < 3) {
      console.log('[⚠️ Refund Denied < $3]', wallet_address, mintNormalized, chain, participants[index].amount);
      return Response.json({
        message: '❌ Refund denied. Minimum refundable value is $3.'
      }, { status: 403 });
    }

    // Process refund
    participants[index].refund_requested = true;
    participants[index].status = 'refunded';

    await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf-8');

    console.log(`🔁 [REFUND] Returning ${participants[index].amount} of ${mint} on ${chain} to ${wallet_address}`);

    return Response.json({
      message: `✅ Refund request successful. ${participants[index].amount} tokens will be returned to your wallet.`,
    });

  } catch (err) {
    console.error('[Refund Error]', err);
    return Response.json({ message: '❌ Refund failed due to server error.' }, { status: 500 });
  }
}
