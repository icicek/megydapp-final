'use client';

import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useRouter } from 'next/navigation';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

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
          localStorage.setItem('coincarneDone', 'true');
          router.push(`/success?tokenFrom=${metaName(mint)}&number=${ogdata.coincarnator_no}`);
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
      <div className="relative">
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full py-3 px-4 bg-gray-800 border border-red-500 rounded-lg flex items-center justify-between cursor-pointer hover:shadow-lg"
        >
          {selectedToken ? (
            <div className="flex items-center space-x-3">
              <img src={metaLogo(selectedToken.mint)} alt="logo" className="w-6 h-6 rounded-full" />
              <span className="font-bold text-lg">{metaName(selectedToken.mint)}</span>
              <span className="text-sm text-gray-400">({selectedToken.amount.toFixed(4)})</span>
            </div>
          ) : (
            <span className="text-gray-400">Select a token</span>
          )}
          <span>▼</span>
        </div>

        {dropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg max-h-64 overflow-y-auto">
            {tokens.map(token => (
              <div
                key={token.mint}
                onClick={() => {
                  setSelectedToken(token);
                  setManualAmount('');
                  setDropdownOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 cursor-pointer"
              >
                <img src={metaLogo(token.mint)} alt="logo" className="w-5 h-5 rounded-full" />
                <span className="font-medium">{metaName(token.mint)}</span>
                <span className="text-xs text-gray-400 ml-auto">{token.amount.toFixed(4)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedToken && (
        <div className="mt-6 space-y-4 text-left">
          <div className="flex space-x-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() =>
                  setManualAmount(
                    ((selectedToken.amount * pct) / 100).toFixed(4)
                  )
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
    </div>
  );
}
