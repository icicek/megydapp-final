import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'participants.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const participants = JSON.parse(fileContents);
    return Response.json(participants);
  } catch (err) {
    console.error('[Participants API Error]', err);
    return Response.json([], { status: 500 });
  }
}
