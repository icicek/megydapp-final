export default function handler(req, res) {
    console.log("✅ testping route çalıştı!");
    res.status(200).json({ ping: true });
  }
  