'use client';

import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// ✅ QuickNode bağlantısı
const rpcConnection = new Connection("https://dry-sly-shard.solana-mainnet.quiknode.pro/2caf002b99622573ca73298eca87f13eb8ebda6c/");

const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";

export default function CoincarneForm() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [walletAddress, setWalletAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [globalStats, setGlobalStats] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

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
      metadataMap['SOL'] = {
        symbol: 'SOL',
        name: 'Solana',
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
      };
      setTokenMetadata(metadataMap);
    } catch (err) {
      console.error("Token metadata fetch error:", err);
    }
  };

  const fetchTokens = async (walletPubkey) => {
    try {
      const tokenAccounts = await rpcConnection.getParsedTokenAccountsByOwner(walletPubkey, { programId: TOKEN_PROGRAM_ID });
      const filteredTokens = tokenAccounts.value
        .map((account) => {
          const info = account.account.data.parsed.info;
          const mint = info.mint;
          const amount = parseFloat(info.tokenAmount.uiAmount);
          return { mint, amount };
        })
        .filter((token) => token.amount > 0);

      const solBalanceLamports = await rpcConnection.getBalance(walletPubkey);
      const solAmount = solBalanceLamports / 1e9;
      if (solAmount > 0) {
        filteredTokens.unshift({
          mint: 'SOL',
          amount: solAmount,
        });
      }

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
    mint === 'SOL' ? 'SOL' : (tokenMetadata[mint]?.symbol || tokenMetadata[mint]?.name || mint.slice(0, 4) + "..." + mint.slice(-4));

  const handleCoincarne = async (mint, amount) => {
    try {
      const response = await fetch("/api/coincarnation/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          token_from: metaName(mint),
          mint,
          amount,
          chain: "solana",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.transaction) {
          const transaction = Transaction.from(Buffer.from(data.transaction, "base64"));
          const signature = await sendTransaction(transaction, connection);
          console.log("Transaction Signature:", signature);

          const randomId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
          setSuccessData({ id: randomId, token: metaName(mint) });
          setMessage(null);
        } else {
          setMessage(`✅ Coincarnation successful without blockchain transfer.`);
          setMessageType("success");
        }
      } else {
        setMessage(`❌ Error: ${data.error || "Unknown error"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);
      setMessage(`⚠️ Network error: ${error.message}`);
      setMessageType("error");
    }

    setTimeout(() => setMessage(null), 4000);
  };

  const openModal = (token) => {
    setSelectedToken(token);
    setManualAmount('');
    setShowModal(true);
  };

  const confirmCoincarne = async () => {
    if (!manualAmount || isNaN(manualAmount) || manualAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    setShowModal(false);
    await handleCoincarne(selectedToken.mint, manualAmount);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <WalletMultiButton />
      </div>

      {globalStats && (
        <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", marginBottom: "20px", backgroundColor: "#f9f9f9", color: "#000" }}>
          <h3>🌐 Global Coincarne Stats</h3>
          <p>💰 <strong>Total Coincarne USD:</strong> ${globalStats.totalUSD}</p>
          <p>👥 <strong>Unique Wallets:</strong> {globalStats.totalWallets}</p>
          <p>📦 <strong>Total Transactions:</strong> {globalStats.totalTransactions}</p>
          <p>🧬 <strong>Unique Tokens:</strong> {globalStats.totalUniqueMints}</p>
        </div>
      )}

      {message && (
        <div style={{ backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da", color: messageType === "success" ? "#155724" : "#721c24", padding: "10px", marginBottom: "15px", borderRadius: "5px" }}>
          {message}
        </div>
      )}

      <h2>Coincarne Panel</h2>
      <p>Select tokens from your wallet and coincarnate them into $MEGY.</p>

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
                  <img src={meta.logoURI} alt={meta.symbol || "Token"} width="24" height="24" style={{ marginRight: "10px", borderRadius: "50%" }} />
                )}
                <div style={{ flex: 1 }}>
                  <strong>{meta.symbol || token.mint}</strong> ({meta.name || token.mint}) — {token.amount}
                </div>
                <button onClick={() => openModal(token)}>
                  Coincarnate
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No tokens found or wallet not connected.</p>
      )}

      {showModal && selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md text-black">
            <h2 className="text-2xl font-bold mb-4">Coincarnate {metaName(selectedToken.mint)}</h2>
            <p className="mb-4">Balance: {selectedToken.amount}</p>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setManualAmount((selectedToken.amount * 0.25).toFixed(2))}>25%</button>
              <button onClick={() => setManualAmount((selectedToken.amount * 0.5).toFixed(2))}>50%</button>
              <button onClick={() => setManualAmount((selectedToken.amount * 0.75).toFixed(2))}>75%</button>
              <button onClick={() => setManualAmount(selectedToken.amount)}>Max</button>
            </div>

            <input type="number" min="0" step="any" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} placeholder="Enter amount to coincarnate" className="w-full p-2 border rounded mb-4" />

            <div className="flex gap-4">
              <button onClick={() => confirmCoincarne()} className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-2 px-6 rounded">
                Coincarnate Now 🚀
              </button>
              <button onClick={() => setShowModal(false)} className="bg-gray-400 hover:bg-gray-300 text-black font-bold py-2 px-6 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {successData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md text-black text-center">
            <h2 className="text-2xl font-bold mb-4">🚀 Coincarnation Successful!</h2>
            <p className="mb-2">You are Coincarnator #{successData.id}</p>
            <p className="mb-4">You revived: ${successData.token}</p>
            <p className="text-sm mb-6 text-gray-600">Help build the world's largest crypto community! Share your success! 🌍</p>

            <div className="flex flex-col gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 I just Coincarned! I'm Coincarnator #${successData.id}. Revived $${successData.token}! 🌍 Join the movement: https://megydapp.vercel.app`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-2 px-6 rounded"
              >
                Share on X (Twitter)
              </a>

              <button
                onClick={() => setSuccessData(null)}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded"
              >
                Coincarne Again
              </button>

              <a
                href="/"
                className="text-cyan-400 underline text-sm"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
