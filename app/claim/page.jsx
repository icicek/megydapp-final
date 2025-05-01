'use client';

import React, { useEffect, useState } from 'react';
import ClaimPanel from '@/components/ClaimPanel';

export default function ClaimPage() {
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await fetch('/api/coincarnation/stats');
        const data = await res.json();
        setGlobalStats({
          totalUsd: data.totalUSD || 0,
          totalParticipants: data.totalWallets || 0,
          totalTokens: data.totalUniqueMints || 0,
        });
      } catch (err) {
        console.error('Failed to fetch global stats', err);
        setGlobalStats({ totalUsd: 0, totalParticipants: 0, totalTokens: 0 });
      }
    };

    fetchGlobalStats();
  }, []);

  // Statlar gelmeden önce loading göster
  if (!globalStats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading your profile...
      </div>
    );
  }

  return (
    <ClaimPanel
      walletAddress="0x123...abc"
      coincarnatorNo={777}
      contributionUSD={1200}
      shareRatio={3.5}
      claimableMEGY={15000}
      claimStatus={false}
      globalStats={globalStats}
      claimOpen={true}
    />
  );
}
