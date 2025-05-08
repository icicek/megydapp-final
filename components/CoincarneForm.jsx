'use client';

import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// ✅ QuickNode bağlantısı
const rpcConnection = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");

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

      if (response.status === 403) {
        alert('🚫 Coincarnation is currently paused. Please try again later.');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        if (data.transaction) {
          const transaction = Transaction.from(Buffer.from(data.transaction, "base64"));
          const signature = await sendTransaction(transaction, connection);
          console.log("Transaction Signature:", signature);

          // 🔁 OG verisini çek
          const res = await fetch(`/api/ogdata?wallet=${walletAddress}`);
          const ogdata = await res.json();

          if (ogdata.success) {
            await fetch('/api/generate-megy-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                number: ogdata.coincarnator_no,
                amount: ogdata.usd,
                percent: ogdata.percent
              })
            });
          }

          setSuccessData({ id: ogdata.coincarnator_no, token: metaName(mint) });
          setMessage(null);
          localStorage.setItem('coincarneDone', 'true');
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

  // ... diğer JSX ve fonksiyonlar aynı kalıyor
}
