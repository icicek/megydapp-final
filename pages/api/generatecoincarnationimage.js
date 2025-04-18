import * as PImage from 'pureimage';
import path from 'path';
import fs from 'fs';
import { WritableStreamBuffer } from 'stream-buffers';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { tokenFrom = "$DOGE", tokenTo = "$MEGY", number = "1" } = req.query;

  try {
    // Görseli yükle
    const bgPath = path.join(process.cwd(), 'public', 'coincarnated-latest.png');
    if (!fs.existsSync(bgPath)) {
      res.status(404).send("Background image not found");
      return;
    }

    const bgStream = fs.createReadStream(bgPath);
    const bg = await PImage.decodePNGFromStream(bgStream);

    const width = bg.width;
    const height = bg.height;
    const img = PImage.make(width, height);
    const ctx = img.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bg, 0, 0, width, height);

    const fontPath = path.join(process.cwd(), 'public', 'OpenSans-Bold.ttf');
    const font = PImage.registerFont(fontPath, 'OpenSans');
    await font.load();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00FFFF';

    ctx.font = '150pt OpenSans';
    ctx.fillText(`${tokenFrom}              ${tokenTo}`, width / 2, 1400);

    ctx.font = '90pt OpenSans';
    ctx.fillText(`Coincarnator #${number}`, width / 2, 1700);

    const stream = new WritableStreamBuffer();
    await PImage.encodePNGToStream(img, stream);

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(stream.getContents());
  } catch (err) {
    console.error("Image generation failed:", err);
    res.status(500).send("Image generation failed");
  }
}
