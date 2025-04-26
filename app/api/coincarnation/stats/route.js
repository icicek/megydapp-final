import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'participants.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const participants = JSON.parse(fileContents);

    const participantCount = participants.length;
    const totalUsdValue = participants.reduce((sum, p) => sum + p.amount, 0);

    const latestParticipant = participants[participants.length - 1];

    return Response.json({
      participantCount,
      totalUsdValue,
      latest: {
        wallet: latestParticipant.wallet_address,
        token: latestParticipant.token_from
      }
    });

  } catch (error) {
    console.error('Error reading participants.json:', error);
    return new Response('Failed to load data', { status: 500 });
  }
}
