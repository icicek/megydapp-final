'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import CoincarneForm from '@/components/CoincarneForm';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Home() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const walletAddress = publicKey?.toBase58();
  const [stats, setStats] = useState({ participantCount: 0, totalUsdValue: 0, latest: null });
  const [endDate, setEndDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [swapAnimationData, setSwapAnimationData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ token: '', amount: 0 });

  useEffect(() => {
    fetch('/animations/looping-swap.json')
      .then(res => res.json())
      .then(data => setSwapAnimationData(data))
      .catch(err => console.error("Lottie animation fetch error:", err));
  }, []);

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

  const handleTokenSelect = (token, amount) => {
    setModalData({ token, amount });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">🚀 Welcome to MEGY Coincarnation</h1>
      <p className="mb-6 text-lg">The place where deadcoins come back stronger.</p>

      <div className="text-lg font-medium mt-4 space-y-2">
        <p>🎉 <CountUp key={stats.participantCount} end={stats.participantCount} duration={1.5} /> Coincarnators and counting...</p>
        <p>💸 $<CountUp key={stats.totalUsdValue} end={stats.totalUsdValue} duration={1.5} decimals={2} /> worth of deadcoins revived.</p>
      </div>

      {/* Swap UI */}
      <div className="mt-10 w-full max-w-xl mx-auto px-4 animate-fade-in">
        <div
          onClick={() => setVisible(true)}
          className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl cursor-pointer"
        >
          <div className="text-sm text-gray-400 mb-1 text-left flex items-center space-x-2">
            <span className="animate-pulse">💀</span>
            <span>You give</span>
          </div>
          <div className="w-full py-3 px-4 text-left text-xl font-bold bg-gray-800 text-white border border-red-500 rounded-lg flex items-center justify-between">
            <span>Walking Deadcoins</span>
            <span className="text-sm text-gray-400 ml-2">(Memecoins, shitcoins...)</span>
          </div>

          <div className="my-4 text-center text-white font-bold text-lg">Coincarnate</div>

          <div className="text-sm text-gray-400 mb-1 text-left flex items-center space-x-2">
            <span className="animate-bounce">🚀</span>
            <span>You receive</span>
          </div>
          <div className="w-full py-3 px-4 text-left text-xl font-bold bg-gray-800 text-white border border-green-500 rounded-lg flex items-center justify-between">
            <span>MEGY</span>
            <span className="text-sm text-gray-400 ml-2">(Future of Money)</span>
          </div>
        </div>

        <div className="mt-6">
          <WalletMultiButton className="!bg-cyan-600 hover:!bg-cyan-700" />
        </div>
      </div>

      <div className="mt-10 w-full max-w-2xl">
        <CoincarneForm onSelectToken={handleTokenSelect} />
      </div>

      <div className="mt-8 flex justify-center">
        <Link href={walletAddress ? '/claim' : '#'}>
          <button
            disabled={!walletAddress}
            className={`px-6 py-3 text-lg font-bold rounded-xl transition-all duration-300 ${walletAddress ? 'bg-green-500 hover:bg-green-600 text-black' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
          >
            🎯 Go to Profile
          </button>
        </Link>
      </div>

      {stats.latest && (
        <div className="mt-6 text-sm text-gray-300">
          🧑‍🚀 Latest: <span className="font-mono">{stats.latest.wallet}</span> revived <span className="font-bold">{stats.latest.token}</span>
        </div>
      )}

      {!timeLeft.expired && endDate && (
        <div className="mt-4 text-sm text-yellow-400">
          ⏳ {timeLeft.days} days {timeLeft.hours}:{timeLeft.minutes?.toString().padStart(2, '0')}:{timeLeft.seconds?.toString().padStart(2, '0')} remaining...
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-white rounded-2xl p-6 w-full max-w-md mx-auto text-center">
          <div className="fixed inset-0 bg-black/70 z-[-1]" />
          <h2 className="text-xl font-bold mb-4">Coincarnate {modalData.token}</h2>
          <p className="text-sm text-gray-400 mb-2">You have {modalData.amount.toFixed(4)} {modalData.token} in your wallet</p>
          <div className="mt-4 space-x-2">
            {[25, 50, 75, 100].map(pct => (
              <button key={pct} className="bg-gray-700 px-3 py-1 rounded text-white">%{pct}</button>
            ))}
          </div>
          <input type="number" placeholder="Enter amount" className="mt-4 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
          <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-xl font-bold">Confirm Coincarnation</button>
        </DialogContent>
    </Dialog>

    </div>
  );
}
