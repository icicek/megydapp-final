import * as PImage from 'pureimage';
import fs from 'fs';
import path from 'path';
import { WritableStreamBuffer } from 'stream-buffers';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const bgPath = path.join(process.cwd(), 'public', 'coincarnated-latest.png');
    const fontPath = path.join(process.cwd(), 'public', 'OpenSans-Bold.ttf');

    const bgStream = fs.createReadStream(bgPath);
    const bg = await PImage.decodePNGFromStream(bgStream);

    const font = PImage.registerFont(fontPath, 'OpenSans');
    await font.load();

    const width = bg.width;
    const height = bg.height;
    const img = PImage.make(width, height);
    const ctx = img.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bg, 0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00FFFF';
    ctx.font = '40pt OpenSans';  // Daha küçük ve emojisiz
    ctx.fillText('Hello from MEGY', width / 2, height / 2);

    const stream = new WritableStreamBuffer();
    await PImage.encodePNGToStream(img, stream);

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(stream.getContents());
  } catch (error) {
    console.error("❌ Final image render error:", error);
    res.status(500).send("❌ Error generating image.");
  }
}
