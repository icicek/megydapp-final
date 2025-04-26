import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

export async function GET() {
  try {
    const file = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(file);
    return Response.json(config);
  } catch (error) {
    return new Response('Failed to read config', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newConfig = { endDate: body.endDate };
    await fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
    return Response.json({ message: 'End date updated successfully' });
  } catch (error) {
    return new Response('Failed to update config', { status: 500 });
  }
}
