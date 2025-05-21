'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import CoincarneForm from '@/components/CoincarneForm';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from '@solana/spl-token';

export default function Home() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const customConnection = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");
  const { setVisible } = useWalletModal();
  const walletAddress = publicKey ? publicKey.toBase58() : null;

  const [stats, setStats] = useState({ participantCount: 0, totalUsdValue: 0, latest: null });
  const [endDate, setEndDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ token: '', amount: 0 });
  const [selectedAmount, setSelectedAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [hasLastCoincarnation, setHasLastCoincarnation] = useState(false);

  const COINCARNATION_DESTINATION = 'D7iqkQmY3ryNFtc9qseUv6kPeVjxsSD98hKN5q3rkYTd';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("lastCoincarnation");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.token && parsed.amount) {
            setModalData({ token: parsed.token, amount: parseFloat(parsed.amount) });
            setConfirmed(true);
            setHasLastCoincarnation(true);
            localStorage.removeItem("lastCoincarnation");
          }
        } catch (err) {
          console.error("Failed to parse lastCoincarnation from localStorage", err);
        }
      } else if (walletAddress) {
        fetch(`/api/last-coincarnation?wallet=${walletAddress}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setModalData({ token: data.token, amount: parseFloat(data.amount) });
              setConfirmed(true);
              setHasLastCoincarnation(true);
            }
          })
          .catch(err => {
            console.error("Failed to fetch lastCoincarnation from Neon", err);
          });
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/coincarnation/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Stats fetch failed', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchEndDate = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setEndDate(new Date(data.endDate));
      } catch (err) {
        console.error("Couldn't fetch end date", err);
      }
    };
    fetchEndDate();
  }, []);

  useEffect(() => {
    if (!endDate) return;
    const updateTimer = () => {
      const now = new Date();
      const distance = endDate - now;
      if (distance <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json");
        const data = await res.json();
        const metadataMap = {};
        data.tokens.forEach((token) => {
          metadataMap[token.address] = {
            symbol: token.symbol,
            name: token.name,
            logoURI: token.logoURI,
            decimals: token.decimals,
          };
        });
        metadataMap['SOL'] = {
          symbol: 'SOL',
          name: 'Solana',
          logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
          decimals: 9,
        };
        setTokenMetadata(metadataMap);
      } catch (err) {
        console.error("Token metadata fetch error:", err);
      }
    };
    fetchTokenList();
  }, []);

  const handleTokenSelect = (token, amount) => {
    setModalData({ token, amount });
    setSelectedAmount('');
    setConfirmed(false);
    setModalOpen(true);
  };

  const handleCoincarnation = async () => {
    try {
      if (!publicKey) return alert("Please connect your wallet first.");
      if (!modalData.token) return alert("Please select a token.");
      const amount = parseFloat(selectedAmount);
      if (!amount || isNaN(amount) || amount <= 0) return alert("Enter a valid amount.");

      const transaction = new Transaction();

      if (modalData.token === 'SOL') {
        if (amount < 0.0021) return alert("Minimum 0.0021 SOL due to rent-exemption.");
        const lamports = Math.floor(amount * 1e9);
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(COINCARNATION_DESTINATION),
            lamports,
          })
        );
      } else {
        const mintEntry = Object.entries(tokenMetadata).find(
          ([, value]) => value.symbol === modalData.token
        );
        if (!mintEntry) throw new Error("Token mint not found.");
        const [mintAddress, metadata] = mintEntry;

        const source = await getAssociatedTokenAddress(new PublicKey(mintAddress), publicKey);
        const destination = await getAssociatedTokenAddress(new PublicKey(mintAddress), new PublicKey(COINCARNATION_DESTINATION));

        transaction.add(
          createTransferInstruction(
            source,
            destination,
            publicKey,
            Math.floor(amount * 10 ** (metadata.decimals || 6))
          )
        );
      }

      const { blockhash, lastValidBlockHeight } = await customConnection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, customConnection);
      await customConnection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'finalized');

      setConfirmed(true);
    } catch (err) {
      console.error("Coincarnation failed:", err);
      alert("Transaction failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">🚀 Welcome to MEGY Coincarnation</h1>
      <p className="mb-6 text-lg">The place where deadcoins come back stronger.</p>

      <div className="text-lg font-medium mt-4 space-y-2">
        <p>🎉 <CountUp key={stats.participantCount} end={stats.participantCount} duration={1.5} /> Coincarnators and counting...</p>
        <p>💸 $<CountUp key={stats.totalUsdValue} end={stats.totalUsdValue} duration={1.5} decimals={2} /> revived.</p>
      </div>

      <div className="mt-10 w-full max-w-xl mx-auto px-4">
        <div onClick={() => setVisible(true)} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl cursor-pointer">
          <div className="text-sm text-gray-400 mb-1">You give</div>
          <div className="w-full py-3 px-4 text-xl font-bold bg-gray-800 text-white border border-red-500 rounded-lg">
            Walking Deadcoins <span className="text-sm text-gray-400">(Memecoins, shitcoins...)</span>
          </div>

          <div className="my-4 font-bold text-lg">Coincarnate</div>

          <div className="text-sm text-gray-400 mb-1">You receive</div>
          <div className="w-full py-3 px-4 text-xl font-bold bg-gray-800 text-white border border-green-500 rounded-lg">
            MEGY <span className="text-sm text-gray-400">(Future of Money)</span>
          </div>
        </div>

        <div className="mt-6">
          <WalletMultiButton className="!bg-cyan-600 hover:!bg-cyan-700" />
        </div>
      </div>

      <div className="mt-10 w-full max-w-2xl">
        <CoincarneForm onSelectToken={handleTokenSelect} />
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-gray-900 border border-white rounded-2xl p-6 w-full max-w-md text-center">
          {!confirmed ? (
            <>
              <h2 className="text-xl font-bold mb-4">Coincarnate {modalData.token}</h2>
              <p className="text-sm text-gray-400 mb-2">Available: {modalData.amount?.toFixed(4)} {modalData.token}</p>
              <div className="mt-4 space-x-2">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setSelectedAmount((modalData.amount * (pct / 100)).toFixed(4))} className="bg-gray-700 px-3 py-1 rounded text-white">%{pct}</button>
                ))}
              </div>
              <input
                type="number"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-4 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
              />
              <button onClick={handleCoincarnation} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-xl font-bold">
                Confirm Coincarnation
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">🎉 Coincarnation Complete</h2>
              <p className="text-sm text-yellow-400 mb-2">✅ Transaction confirmed.</p>
              <Link href="/claim">
                <button className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-xl font-bold mt-4">👤 Go to Profile</button>
              </Link>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
