// ✅ pages/api/coincarnation-confirm.js
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  console.log("✅ [coincarnation-confirm] çalıştı");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🔍 ENV Check - DATABASE_URL:", process.env.DATABASE_URL);

  const {
    wallet_address,
    token_symbol,
    token_contract,
    token_amount,
    usd_value = 0,
    transaction_signature,
    referral_code = null,
    user_agent = null,
  } = req.body;

  if (!wallet_address || !token_symbol || !token_contract || !token_amount || !transaction_signature) {
    console.warn("⚠️ Eksik alan(lar):", {
      wallet_address,
      token_symbol,
      token_contract,
      token_amount,
      transaction_signature,
    });
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const client = await pool.connect();
    console.log("✅ DB bağlantısı başarılı");

    await client.query(
      `INSERT INTO contributions (
        wallet_address, token_symbol, token_contract, network,
        token_amount, usd_value, transaction_signature,
        referral_code, user_agent, timestamp
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [
        wallet_address,
        token_symbol,
        token_contract,
        "solana",
        token_amount,
        usd_value,
        transaction_signature,
        referral_code,
        user_agent,
      ]
    );

    console.log("✅ Veri başarıyla yazıldı");
    client.release();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ DB yazım hatası:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
