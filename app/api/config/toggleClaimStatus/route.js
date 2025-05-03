import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const configPath = path.join(process.cwd(), 'data', 'config.json');

export async function POST(req) {
  try {
    const { open } = await req.json();

    const file = await readFile(configPath, 'utf-8');
    const currentConfig = JSON.parse(file);

    const updatedConfig = {
      ...currentConfig,
      claim_open: !!open,
    };

    await writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    return NextResponse.json({ success: true, open: updatedConfig.claim_open });
  } catch (err) {
    console.error('❌ Error updating claim status:', err);
    return NextResponse.json({ error: 'Failed to update claim status.' }, { status: 500 });
  }
}
