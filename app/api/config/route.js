import { promises as fs } from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'data', 'config.json');

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
    const existing = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'));

    const updated = {
      ...existing,
      ...(body.endDate && { endDate: body.endDate }),
      ...(typeof body.cc_active === 'boolean' && { cc_active: body.cc_active })
    };

    await fs.writeFile(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    return Response.json({ message: 'Config updated successfully' });
  } catch (error) {
    return new Response('Failed to update config', { status: 500 });
  }
}
