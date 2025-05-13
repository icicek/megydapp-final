'use client';

import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const rpcConnection = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");
const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";

export default function CoincarneForm() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [walletAddress, setWalletAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleCoincarne = () => {
    setSuccess(true);
  };

  return (
    <div className="text-white mt-4 space-y-6 text-center">
      <div className="mb-6">
        <WalletMultiButton />
        {walletAddress && (
          <div className="mt-2 text-sm text-gray-400">Connected: {walletAddress}</div>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <select
          className="w-full p-3 bg-gray-800 border border-red-500 rounded text-white"
          onChange={(e) => {
            const selected = tokens.find(t => t.mint === e.target.value);
            setSelectedToken(selected);
            setAmount('');
            setSuccess(false);
          }}
        >
          <option value="" disabled selected>Select a token to coincarnate</option>
          {tokens.map(token => (
            <option key={token.mint} value={token.mint}>
              {metaName(token.mint)} ({token.amount.toFixed(4)})
            </option>
          ))}
        </select>
      </div>

      {selectedToken && (
        <div className="mt-6 max-w-md mx-auto bg-gray-900 border border-gray-700 rounded p-6">
          <h2 className="text-lg font-bold mb-4">Coincarnate {metaName(selectedToken.mint)}</h2>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mb-4 p-3 bg-gray-800 border border-gray-600 rounded text-white"
          />
          <button
            onClick={handleCoincarne}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded"
          >
            🚀 Coincarnate Now
          </button>

          {success && (
            <div className="mt-6 text-center">
              <p className="text-green-400 font-semibold mb-4">🎉 Coincarnation successful!</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setSelectedToken(null)} className="bg-yellow-600 hover:bg-yellow-700 py-2 rounded">🔁 Recoincarnate</button>
                <button onClick={() => window.location.href = '/claim'} className="bg-blue-600 hover:bg-blue-700 py-2 rounded">👤 Go to Profile</button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🚀 I just swapped my $${metaName(selectedToken.mint)} for $MEGY. Join the movement 👉 coincarnation.com`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 rounded"
                >
                  🐦 Share on X
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
