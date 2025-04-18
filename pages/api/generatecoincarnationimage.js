import * as PImage from 'pureimage';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const fontPath = path.join(process.cwd(), 'public', 'OpenSans-Bold.ttf');

    const font = PImage.registerFont(fontPath, 'OpenSans');
    await font.load();

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send("✅ Font loaded successfully.");
  } catch (error) {
    console.error("❌ Font load failed:", error);
    res.status(500).send("❌ Font load failed.");
  }
}
