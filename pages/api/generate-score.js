import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

export default async function handler(req, res) {
  const { amount = '0', percent = '0.00', number = '000' } = req.query;

  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bgPath = path.join(process.cwd(), 'public', 'base-score.png');
  const background = await loadImage(bgPath);
  ctx.drawImage(background, 0, 0, width, height);

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 60px sans-serif';
  ctx.fillText(`${parseInt(amount).toLocaleString()} $MEGY`, 60, 300);

  ctx.fillStyle = '#00FFAA';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(`Top ${percent}% Contributor`, 60, 380);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(`🚀 Coincarnator #${number}`, 60, 220);

  const filename = `score-${number}.png`;
  const filePath = path.join(process.cwd(), 'public', 'generated', filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);

  res.status(200).json({
    success: true,
    url: `/generated/${filename}`,
  });
}
