'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import CoincarneForm from '../components/CoincarneForm';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Home() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const walletAddress = publicKey?.toBase58();
  const [stats, setStats] = useState({ participantCount: 0, totalUsdValue: 0, latest: null });
  const [endDate, setEndDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [swapAnimationData, setSwapAnimationData] = useState(null);

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">🚀 Welcome to MEGY Coincarnation</h1>
      <p className="mb-6 text-lg">The place where deadcoins come back stronger.</p>

      <div className="text-lg font-medium mt-4 space-y-2">
        <p>🎉 <CountUp key={stats.participantCount} end={stats.participantCount} duration={1.5} /> Coincarnators and counting...</p>
        <p>💸 $<CountUp key={stats.totalUsdValue} end={stats.totalUsdValue} duration={1.5} decimals={2} /> worth of deadcoins revived.</p>
      </div>

      <div className="mt-10">
        {swapAnimationData && (
          <Lottie animationData={swapAnimationData} loop autoplay style={{ width: 120, height: 120 }} />
        )}
      </div>

      <div className="mt-12 w-full max-w-2xl">
        <CoincarneForm />
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
    </div>
  );
}
