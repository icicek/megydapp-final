import * as PImage from 'pureimage';
import fs from 'fs';
import path from 'path';
import { WritableStreamBuffer } from 'stream-buffers';

export default async function handler(req, res) {
  try {
    const { tokenFrom = '$DOGE', tokenTo = '$MEGY', number = '1' } = req.query;

    const bgPath = path.join(process.cwd(), 'public', 'coincarnated-latest.png');
    const fontPath = path.join(process.cwd(), 'public', 'OpenSans-Bold.ttf');
    const outputPath = path.join(process.cwd(), 'public', 'generated', `${number}.png`);

    // Eğer görsel zaten varsa yeniden üretme
    if (fs.existsSync(outputPath)) {
      return res.status(200).json({ message: '✅ Image already exists.' });
    }

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

    ctx.font = '60pt OpenSans';
    ctx.fillText(`${tokenFrom}   →     ${tokenTo}`, width / 2, height * 0.42);

    ctx.font = '45pt OpenSans';
    ctx.fillText(`Coincarnator #${number}`, width / 2, height * 0.49);

    // PNG çıktısını buffer olarak al
    const stream = new WritableStreamBuffer();
    await PImage.encodePNGToStream(img, stream);

    // Kaydet: public/generated/777.png
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, stream.getContents());

    return res.status(200).json({ message: '✅ Image generated successfully.', path: `/generated/${number}.png` });
  } catch (err) {
    console.error('❌ Error:', err);
    return res.status(500).json({ message: '❌ Failed to generate image.' });
  }
}
