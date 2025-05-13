'use client';

import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const rpcConnection = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");
const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";

export default function CoincarneForm() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [showSuccess, setShowSuccess] = useState(false);
  const [coincarnatorNo, setCoincarnatorNo] = useState(null);

  useEffect(() => {
    fetchTokenList();
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
      const tokenAccounts = await rpcConnection.getParsedTokenAccountsByOwner(walletPubkey, {
        programId: TOKEN_PROGRAM_ID,
      });
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

  const metaName = (mint) => {
    if (mint === 'SOL') return 'SOL';
    const meta = tokenMetadata[mint];
    return meta?.symbol || meta?.name || mint.slice(0, 4) + '...' + mint.slice(-4);
  };

  const metaLogo = (mint) => {
    if (mint === 'SOL') return tokenMetadata['SOL']?.logoURI;
    return tokenMetadata[mint]?.logoURI || '';
  };

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

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unknown error");
      }

      const data = await response.json();

      if (data.transaction) {
        const transaction = Transaction.from(Buffer.from(data.transaction, "base64"));
        const signature = await sendTransaction(transaction, connection);
        console.log("Transaction Signature:", signature);

        const res = await fetch(`/api/ogdata?wallet=${walletAddress}&token=${metaName(mint)}&mint=${mint}&amount=${amount}`);
        const ogdata = await res.json();

        if (ogdata.success) {
          setCoincarnatorNo(ogdata.coincarnator_no);
          setShowSuccess(true);
        }

        setMessage(null);
      } else {
        setMessage(`✅ Coincarnation successful without blockchain transfer.`);
        setMessageType("success");
      }
    } catch (error) {
      console.error(error);
      setMessage(`⚠️ Network error: ${error.message}`);
      setMessageType("error");
    }

    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="text-white mt-4 space-y-6 text-center">
      <WalletMultiButton className="mx-auto mb-6" />

      {!showSuccess ? (
        <>
          <div className="relative max-w-md mx-auto">
            <select
              className="w-full p-3 bg-gray-800 border border-red-500 rounded text-white"
              onChange={(e) => {
                const selected = tokens.find(t => t.mint === e.target.value);
                setSelectedToken(selected);
                setManualAmount('');
              }}
              value={selectedToken?.mint || ''}
            >
              <option value="" disabled>Select a token to coincarnate</option>
              {tokens.map(token => (
                <option key={token.mint} value={token.mint}>
                  {metaName(token.mint)} ({token.amount.toFixed(4)})
                </option>
              ))}
            </select>
          </div>

          {selectedToken && (
            <div className="max-w-md mx-auto space-y-4 mt-4">
              <div className="flex space-x-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() =>
                      setManualAmount(((selectedToken.amount * pct) / 100).toFixed(4))
                    }
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
                  >
                    %{pct}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="0"
                step="any"
                placeholder="Enter amount to Coincarne"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="w-full mt-2 p-3 bg-gray-800 border border-gray-600 rounded text-white text-lg"
              />

              <button
                onClick={() => {
                  if (!manualAmount || isNaN(manualAmount) || parseFloat(manualAmount) <= 0) {
                    alert("Please enter a valid amount.");
                    return;
                  }
                  handleCoincarne(selectedToken.mint, parseFloat(manualAmount));
                }}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition"
              >
                Coincarnate {manualAmount} {metaName(selectedToken.mint)}
              </button>
            </div>
          )}

          {message && (
            <div className={`mt-4 text-sm ${messageType === "error" ? "text-red-400" : "text-green-400"}`}>
              {message}
            </div>
          )}
        </>
      ) : (
        <div className="text-center mt-10">
          <h2 className="text-2xl font-bold mb-4 text-green-400">🎉 Coincarnation Successful!</h2>
          <p className="mb-4">Coincarnator #{coincarnatorNo} reporting in.</p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700 text-white">🔁 Recoincarnate</Button>
            <Button onClick={() => router.push('/claim')} className="bg-blue-600 hover:bg-blue-700 text-white">👤 View Profile</Button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `🚀 I just swapped my $${selectedToken?.symbol || 'TOKEN'} for $MEGY. Coincarnator #${coincarnatorNo} reporting in.\n\n🌐 Join the rescue 👉 coincarnation.com`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded"
            >
              🐦 Share on X
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
