import * as PImage from 'pureimage';
import path from 'path';
import fs from 'fs';
import { WritableStreamBuffer } from 'stream-buffers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tokenFrom = searchParams.get("tokenFrom") || "$DOGE";
  const tokenTo = searchParams.get("tokenTo") || "$MEGY";
  const number = searchParams.get("number") || "1";

  // Görseli yükle
  const bgPath = path.join(process.cwd(), 'public', 'coincarnated-latest.png'); 
  if (!fs.existsSync(bgPath)) {
    return new NextResponse("Görsel bulunamadı", { status: 404 });
  }

  const bgStream = fs.createReadStream(bgPath);
  const bg = await PImage.decodePNGFromStream(bgStream);

  const width = bg.width;
  const height = bg.height;
  const img = PImage.make(width, height);
  const ctx = img.getContext('2d');

  // Arka plan siyah (önlem)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  // Arka planı çiz
  ctx.drawImage(bg, 0, 0, width, height);

  // Font yükle
  const fontPath = path.join(process.cwd(), 'public', 'OpenSans-Bold.ttf');
  const font = PImage.registerFont(fontPath, 'OpenSans');
  await font.load();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#00FFFF';

  // 🪙 $TOKEN → $MEGY
  ctx.font = '150pt OpenSans';
  ctx.fillText(`${tokenFrom}              ${tokenTo}`, width / 2, 1400);

  // 🧑‍🚀 Coincarnator #
  ctx.font = '90pt OpenSans';
  ctx.fillText(`Coincarnator #${number}`, width / 2, 1700);

  // PNG çıktısı
  const stream = new WritableStreamBuffer();
  await PImage.encodePNGToStream(img, stream);

  return new NextResponse(stream.getContents(), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
