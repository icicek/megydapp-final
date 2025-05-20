'use client';

useEffect(() => {
  console.log("🧠 BU FORM AKTİF: CoincarneForm.jsx çalıştı!");
}, []);

import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const rpcConnection = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");
const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";

export default function CoincarneForm({ onSelectToken }) {
  const { publicKey, connected, signAndSendTransaction } = useWallet();
  const { connection } = useConnection();

  const [walletAddress, setWalletAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleTransfer = async () => {
    if (!selectedToken || !walletAddress) {
      console.warn("⚠️ Missing selectedToken or walletAddress");
      return;
    }

    setLoading(true);
    console.log("🔥 handleTransfer started");
    console.log("🧠 Selected Token:", selectedToken);

    try {
      const res = await fetch("/api/coincarnation-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          mint: selectedToken.mint,
          amount: selectedToken.amount,
        }),
      });

      const json = await res.json();
      console.log("📬 Transfer API response:", json);

      if (!json.transaction) {
        console.error("❌ No transaction returned from transfer API");
        alert("❌ Failed to prepare transaction.");
        return;
      }

      const transaction = Transaction.from(Buffer.from(json.transaction, "base64"));
      const signature = await signAndSendTransaction(transaction);

      if (!signature) {
        console.error("❌ Transaction sent but no signature returned!");
        alert("✅ Blockchain transfer done but signature not returned.");
        return;
      }

      console.log("✅ Transaction sent:", signature);

      const confirmPayload = {
        wallet_address: walletAddress,
        token_symbol: metaName(selectedToken.mint),
        token_contract: selectedToken.mint,
        token_amount: selectedToken.amount,
        usd_value: 0,
        transaction_signature: signature,
        referral_code: null,
        user_agent: navigator.userAgent,
      };

      console.log("📤 Sending confirm payload to /api/coincarnation-confirm:", confirmPayload);

      const confirmRes = await fetch("/api/coincarnation-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmPayload),
      });

      if (!confirmRes.ok) {
        const errorText = await confirmRes.text();
        console.error("❌ Confirm API failed:", confirmRes.status, errorText);
        alert("✅ Transaction confirmed but failed to record in DB.");
        return;
      }

      const confirmJson = await confirmRes.json();
      console.log("🧾 Confirm API response:", confirmJson);

      if (confirmJson.success) {
        alert("🎉 Coincarnation successful and recorded!");
      } else {
        alert("✅ Transaction succeeded, but DB confirm failed.");
      }
    } catch (err) {
      console.error("❌ Transfer error:", err);
      alert("❌ Error during transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white mt-4 space-y-6 text-center">
      <div className="relative max-w-md mx-auto">
        <select
          className="w-full p-3 bg-gray-800 border border-red-500 rounded text-white"
          onChange={(e) => {
            const selected = tokens.find(t => t.mint === e.target.value);
            if (selected) {
              setSelectedToken(selected);
              const symbol = metaName(selected.mint);
              if (onSelectToken) onSelectToken(symbol, selected.amount);
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Select a token to coincarnate</option>
          {tokens.map(token => (
            <option key={token.mint} value={token.mint}>
              {metaName(token.mint)} ({token.amount.toFixed(4)})
            </option>
          ))}
        </select>

        {selectedToken && (
          <button
            className="mt-4 px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
            onClick={() => {
              console.log("🚀 Coincarne button clicked");
              handleTransfer();
            }}
            disabled={loading}
          >
            {loading ? "⏳ Sending..." : "🚀 Coincarne Now"}
          </button>
        )}
      </div>
    </div>
  );
}
