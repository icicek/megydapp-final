// pages/api/testping.js

export default function handler(req, res) {
    console.log("✅ testping.js çalıştı!");
    res.status(200).json({ ok: true });
  }
  