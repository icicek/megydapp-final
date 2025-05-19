import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  console.log("✅ [coincarnation-confirm] API endpoint çalıştı");

  // 👉 Sadece POST metoduna izin ver
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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

    // ✅ Zorunlu alan kontrolü
    if (
      !wallet_address ||
      !token_symbol ||
      !token_contract ||
      !token_amount ||
      !transaction_signature
    ) {
      console.warn("⚠️ Eksik alan(lar):", {
        wallet_address,
        token_symbol,
        token_contract,
        token_amount,
        transaction_signature,
      });
      return res.status(400).json({ error: "Missing required fields." });
    }

    // ✅ Environment kontrolü
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error("❌ DATABASE_URL environment variable is not set");
      return res.status(500).json({ error: "DATABASE_URL not configured" });
    }

    const sql = neon(dbUrl);

    // 🧾 INSERT verisi logu
    console.log("📥 DB INSERT verisi:", {
      wallet_address,
      token_symbol,
      token_contract,
      network: "solana",
      token_amount,
      usd_value,
      transaction_signature,
      referral_code,
      user_agent,
    });

    // 💾 Neon’a yazma
    await sql`
      INSERT INTO contributions (
        wallet_address,
        token_symbol,
        token_contract,
        network,
        token_amount,
        usd_value,
        transaction_signature,
        referral_code,
        user_agent,
        timestamp
      ) VALUES (
        ${wallet_address},
        ${token_symbol},
        ${token_contract},
        'solana',
        ${token_amount},
        ${usd_value},
        ${transaction_signature},
        ${referral_code},
        ${user_agent},
        NOW()
      )
    `;

    console.log("✅ DB yazımı başarılı");
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ DB yazım hatası:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
