import * as PImage from 'pureimage';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const bgPath = path.join(process.cwd(), 'public', 'coincarnated-latest.png');

  if (!fs.existsSync(bgPath)) {
    res.status(404).send("Background image not found");
    return;
  }

  try {
    const bgStream = fs.createReadStream(bgPath);
    const image = await PImage.decodePNGFromStream(bgStream);

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`✅ PNG decoded. Size: ${image.width} x ${image.height}`);
  } catch (error) {
    console.error("❌ Error decoding PNG:", error);
    res.status(500).send("❌ Error decoding PNG.");
  }
}
