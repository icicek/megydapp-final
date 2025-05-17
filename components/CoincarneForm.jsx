'use client';

import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const rpcConnection = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");
const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";

export default function CoincarneForm({ onSelectToken }) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [walletAddress, setWalletAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);

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
    if (!selectedToken || !walletAddress) return;
    try {
      const res = await fetch("/api/coincarnation-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          mint: selectedToken.mint,
          amount: selectedToken.amount,
          usd_value: 0,
          referral_code: null,
          user_agent: navigator.userAgent,
        }),
      });
      const json = await res.json();
      if (json.transaction) {
        console.log("✅ Transaction prepared:", json.transaction);
      } else {
        console.error("❌ Transfer API response:", json);
      }
    } catch (err) {
      console.error("❌ Transfer error:", err);
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
        >
          <option value="" disabled selected>Select a token to coincarnate</option>
          {tokens.map(token => (
            <option key={token.mint} value={token.mint}>
              {metaName(token.mint)} ({token.amount.toFixed(4)})
            </option>
          ))}
        </select>
        {selectedToken && (
          <button
            className="mt-4 px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            onClick={handleTransfer}
          >
            🚀 Coincarne Now
          </button>
        )}
      </div>
    </div>
  );
}
