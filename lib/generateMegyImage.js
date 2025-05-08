// ✅ File: lib/generateMegyImage.js
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

export async function generateMegyImage({ number, amount, percent }) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const basePath = path.join(process.cwd(), 'public', 'base-score.png');
  const outputPath = path.join(process.cwd(), 'public', 'generated', `score-${number}.png`);

  try {
    const background = await loadImage(basePath);
    ctx.drawImage(background, 0, 0, width, height);

    // Add Coincarnator number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(`🚀 Coincarnator #${number}`, 60, 180);

    // Add MEGY amount
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(`${parseInt(amount).toLocaleString()} $MEGY`, 60, 300);

    // Add percentile
    ctx.fillStyle = '#00FFAA';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(`Top ${percent.toFixed(2)}% Contributor`, 60, 390);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Generated score-${number}.png`);
    return true;
  } catch (error) {
    console.error('[Image Generation Error]', error);
    return false;
  }
}
