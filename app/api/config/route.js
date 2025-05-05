// ✅ File: app/api/config/route.js
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const configPath = path.join(process.cwd(), 'data', 'config.json');

export async function GET() {
  try {
    const file = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(file);
    return NextResponse.json(config);
  } catch (error) {
    console.error('[CONFIG GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const existing = JSON.parse(await fs.readFile(configPath, 'utf-8'));

    const updated = {
      ...existing,
      ...(body.endDate && { endDate: body.endDate }),
      ...(typeof body.coincarnation_active === 'boolean' && { 
        coincarnation_active: body.coincarnation_active 
      }),
      ...(typeof body.claim_open === 'boolean' && { 
        claim_open: body.claim_open 
      })
    };

    await fs.writeFile(configPath, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Config updated successfully' });
  } catch (error) {
    console.error('[CONFIG POST ERROR]', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
