import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { active } = await req.json();

    const configPath = path.join(process.cwd(), 'data', 'config.json');
    const file = await fs.readFile(configPath, 'utf-8');
    const currentConfig = JSON.parse(file);

    const updatedConfig = {
      ...currentConfig,
      coincarnation_active: !!active,
    };

    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      active: updatedConfig.coincarnation_active,
    });
  } catch (err) {
    console.error('❌ Error updating config:', err);
    return NextResponse.json({ error: 'Failed to update config file.' }, { status: 500 });
  }
}
