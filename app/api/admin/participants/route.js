import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const participantsPath = path.join(process.cwd(), 'data', 'participants.json');
    const data = await fs.readFile(participantsPath, 'utf-8');
    const participants = JSON.parse(data);

    return Response.json(participants);
  } catch (error) {
    console.error('[Admin API Error]', error);
    return Response.json({ message: '❌ Failed to load participants' }, { status: 500 });
  }
}
