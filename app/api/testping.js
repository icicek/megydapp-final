// pages/api/testping.js

export default function handler(req, res) {
    console.log("✅ pages/api/testping.js çalıştı!");
    res.status(200).json({ ok: true });
  }
  