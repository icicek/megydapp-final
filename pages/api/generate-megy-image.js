// ✅ File: pages/api/generate-megy-image.js
import { createCanvas } from 'pure-image/server';
import { writeFileSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const { amount = '0', percent = '0.00', number = '000' } = req.query;

    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Sans';
    ctx.fillText(`🚀 Coincarnator #${number}`, 60, 100);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 72px Sans';
    ctx.fillText(`${parseInt(amount).toLocaleString()} $MEGY`, 60, 200);

    ctx.fillStyle = '#00FFAA';
    ctx.font = 'bold 40px Sans';
    ctx.fillText(`Top ${percent}% Contributor`, 60, 280);

    ctx.fillStyle = '#888';
    ctx.font = '20px Sans';
    ctx.fillText('megydapp.vercel.app', 60, height - 40);

    const buffer = await canvas.encode('png');

    const filename = `megyscore-${number}.png`;
    const outputPath = path.join(process.cwd(), 'public', 'generated', filename);

    writeFileSync(outputPath, buffer);

    res.status(200).json({
      success: true,
      url: `/generated/${filename}`
    });
  } catch (err) {
    console.error('[Image Error]', err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
