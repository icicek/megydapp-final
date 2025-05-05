'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import CoincarneForm from '../components/CoincarneForm';
import { useWallet } from '@solana/wallet-adapter-react'; // ✅ Ekle

export default function Home() {
  const { publicKey } = useWallet(); // ✅ Cüzdan adresi
  const walletAddress = publicKey?.toBase58(); // ✅ String adres
  const [stats, setStats] = useState({
    participantCount: 0,
    totalUsdValue: 0,
    latest: null
  });

  const [endDate, setEndDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [hasCoincarneDone, setHasCoincarneDone] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem('coincarneDone');
    if (done === 'true') {
      setHasCoincarneDone(true);
    }
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

      if (distance <= 0) {
        setTimeLeft({ expired: true });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
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
        <p>
          🎉 <CountUp key={stats.participantCount} end={stats.participantCount} duration={1.5} />
          {' '}Coincarnators and counting...
        </p>
        <p>
          💸 $<CountUp key={stats.totalUsdValue} end={stats.totalUsdValue} duration={1.5} decimals={2} />
          {' '}worth of deadcoins revived.
        </p>
      </div>

      {/* ✅ Coincarne Formu */}
      <div className="mt-10 w-full max-w-2xl">
        <CoincarneForm />
      </div>

      {/* ✅ Cüzdan bağlıysa aktif, değilse pasif */}
      <div className="mt-8 flex justify-center">
        <Link href={walletAddress ? '/claim' : '#'}>
          <button
            disabled={!walletAddress}
            className={`px-6 py-3 text-lg font-bold rounded-xl transition-all duration-300 ${
              walletAddress
                ? 'bg-green-500 hover:bg-green-600 text-black'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            🎯 Go to Profile
          </button>
        </Link>
      </div>

      {/* ✅ Son Katılımcı */}
      {stats.latest && (
        <div className="mt-6 text-sm text-gray-300">
          🧑‍🚀 Latest: <span className="font-mono">{stats.latest.wallet}</span> revived <span className="font-bold">{stats.latest.token}</span>
        </div>
      )}

      {/* ✅ Geri sayım */}
      {!timeLeft.expired && endDate && (
        <div className="mt-4 text-sm text-yellow-400">
          ⏳ {timeLeft.days} days {timeLeft.hours}:{timeLeft.minutes?.toString().padStart(2, '0')}:{timeLeft.seconds?.toString().padStart(2, '0')} remaining...
        </div>
      )}
    </div>
  );
}
