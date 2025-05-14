'use client';

import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ConfirmModal from "@/components/ConfirmModal";

const rpcConnection = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");
const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";

export default function CoincarneForm() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [walletAddress, setWalletAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <div className="text-white mt-10 text-center space-y-6">
      <div className="max-w-md mx-auto p-6 bg-[#1a1a2c] rounded-xl border border-gray-700">
        <div className="flex flex-col items-center gap-3">
          <div className="w-full py-3 px-4 rounded-lg border border-red-500 bg-black"> 
            <div className="text-white font-bold">💀 You give</div>
            <div className="text-xl font-bold">Walking Deadcoins</div>
            <div className="text-sm text-gray-400">(Memecoins, shitcoins...)</div>
          </div>
          <div className="text-white text-lg font-bold cursor-pointer" onClick={() => !connected && alert('Please connect wallet')}>↔️ Coincarnate</div>
          <div className="w-full py-3 px-4 rounded-lg border border-green-500 bg-black">
            <div className="text-white font-bold">🚀 You receive</div>
            <div className="text-xl font-bold">MEGY</div>
            <div className="text-sm text-gray-400">(Future of Money)</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <WalletMultiButton className="!bg-cyan-600 hover:!bg-cyan-700" />
      </div>

      {connected && tokens.length > 0 && (
        <div className="max-w-md mx-auto">
          <select
            className="w-full mt-6 bg-black border border-gray-700 text-white py-2 px-3 rounded"
            onChange={(e) => {
              const selected = tokens.find(t => t.mint === e.target.value);
              setSelectedToken(selected);
              setModalOpen(true);
            }}
          >
            <option>Select a token to coincarnate</option>
            {tokens.map((token) => (
              <option key={token.mint} value={token.mint}>
                {metaName(token.mint)} — {token.amount.toFixed(4)}
              </option>
            ))}
          </select>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          {selectedToken && (
            <ConfirmModal
              token={selectedToken}
              logo={metaLogo(selectedToken.mint)}
              name={metaName(selectedToken.mint)}
              onClose={() => setModalOpen(false)}
              walletAddress={walletAddress}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
