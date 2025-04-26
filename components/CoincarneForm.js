'use client';

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";

export default function CoincarneForm() {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    fetchTokenList();
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58();
      setWalletAddress(address);
      fetchTokens(publicKey);
    } else {
      setWalletAddress(null);
      setTokens([]);
    }
  }, [connected, publicKey]);

  const fetchTokenList = async () => {
    try {
      const res = await fetch(TOKEN_LIST_URL);
      const data = await res.json();

      const metadataMap = {};
      data.tokens.forEach((token) => {
        metadataMap[token.address] = {
          symbol: token.symbol,
          name: token.name,
          logoURI: token.logoURI,
        };
      });

      setTokenMetadata(metadataMap);
    } catch (err) {
      console.error("Token metadata fetch error:", err);
    }
  };

  const fetchTokens = async (walletPubkey) => {
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const filteredTokens = tokenAccounts.value
        .map((account) => {
          const info = account.account.data.parsed.info;
          const mint = info.mint;
          const amount = parseFloat(info.tokenAmount.uiAmount);
          return { mint, amount };
        })
        .filter((token) => token.amount > 0);

      setTokens(filteredTokens);
    } catch (err) {
      console.error("Token fetch error:", err);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch("/api/coincarnation/stats");
      const data = await res.json();
      if (res.ok) {
        setGlobalStats(data);
      } else {
        console.error("Failed to fetch global stats:", data.error);
      }
    } catch (err) {
      console.error("Error fetching global stats:", err);
    }
  };

  const metaName = (mint) =>
    tokenMetadata[mint]?.symbol || tokenMetadata[mint]?.name || mint.slice(0, 4) + "..." + mint.slice(-4);

  const handleCoincarne = async (mint, amount) => {
    try {
      const response = await fetch("/api/coincarnation/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: walletAddress,
          mint,
          amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${metaName(mint)} successfully Coincarned.`);
        setMessageType("success");
        fetchGlobalStats(); // update global stats after new Coincarne
      } else {
        setMessage(`❌ Error: ${data.error || "Unknown error"}`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage(`⚠️ Network error: ${error.message}`);
      setMessageType("error");
    }

    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div style={{ padding: "20px" }}>
      {globalStats && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>🌐 Global Coincarne Stats</h3>
          <p>💰 <strong>Total Coincarne USD:</strong> ${globalStats.totalUSD}</p>
          <p>👥 <strong>Unique Wallets:</strong> {globalStats.totalWallets}</p>
          <p>📦 <strong>Total Transactions:</strong> {globalStats.totalTransactions}</p>
          <p>🧬 <strong>Unique Tokens:</strong> {globalStats.totalUniqueMints}</p>
        </div>
      )}

      {message && (
        <div
          style={{
            backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
            color: messageType === "success" ? "#155724" : "#721c24",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
          }}
        >
          {message}
        </div>
      )}

      <h2>Coincarne Panel</h2>
      <p>Select tokens from your wallet and Coincarne them into $MEGY.</p>

      {walletAddress ? (
        <p><strong>Connected Wallet:</strong> {walletAddress}</p>
      ) : (
        <p style={{ color: "gray" }}>No wallet connected</p>
      )}

      <h3>Your Tokens:</h3>
      {tokens.length > 0 ? (
        <ul>
          {tokens.map((token, i) => {
            const meta = tokenMetadata[token.mint] || {};
            return (
              <li key={i} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                {meta.logoURI && (
                  <img
                    src={meta.logoURI}
                    alt={meta.symbol}
                    width="24"
                    height="24"
                    style={{ marginRight: "10px", borderRadius: "50%" }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <strong>{meta.symbol || "Unknown Token"}</strong>
                  {" "}({meta.name || token.mint}) — {token.amount}
                </div>
                <button onClick={() => handleCoincarne(token.mint, token.amount)}>
                  Coincarne Et
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No tokens found or wallet not connected.</p>
      )}
    </div>
  );
}
