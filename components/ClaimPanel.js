'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function ClaimPanel({ walletAddress }) {
  const [userData, setUserData] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState(null);

  // ✅ Kendi cüzdanına ait veriyi Neon'dan çek
  useEffect(() => {
    const loadUserData = async () => {
      if (!walletAddress) return;
      try {
        const res = await fetch(`/api/claim-snapshot?wallet=${walletAddress}`);
        const json = await res.json();
        if (json.success && json.data) {
          setUserData(json.data);
          if (json.data.claim_status) {
            setClaimed(true);
          }
        }
      } catch (err) {
        console.error('Failed to load user snapshot:', err);
      }
    };

    loadUserData();
  }, [walletAddress]);

  // ✅ Claim açık mı?
  useEffect(() => {
    const checkClaimStatus = async () => {
      try {
        const res = await fetch('/api/config');
        const json = await res.json();
        setClaimOpen(json.claim_open);
      } catch (err) {
        console.error('Failed to check claim status:', err);
      }
    };

    checkClaimStatus();
  }, []);

  // ✅ Global verileri getir (isteğe bağlı)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/coincarnation/stats');
        const json = await res.json();
        setGlobalStats(json);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, []);

  // ✅ Claim işlemini gönder
  const handleClaim = async () => {
    if (!userData || !walletAddress) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          amount: userData.megy_amount,
          tx_hash: 'TX_PENDING',
          destination_wallet: walletAddress,
          token_ticker: '$MEGY',
          network: 'solana',
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert('✅ Claim successful!');
        setClaimed(true);
      } else {
        alert(`❌ Claim failed: ${json.error}`);
      }
    } catch (err) {
      console.error('Claim error:', err);
      alert('❌ Claim failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🎯 Your MEGY Profile</h1>

      {!walletAddress && (
        <p className="text-center text-gray-400">Please connect your wallet to view your profile.</p>
      )}

      {walletAddress && (
        <>
          {/* ✅ Kullanıcı yoksa: sadece global istatistik */}
          {!userData && (
            <div className="text-center">
              <p className="mb-4 text-yellow-400 font-semibold">
                You haven’t participated yet. Coincarnate to unlock your MEGY share.
              </p>
              {globalStats && (
                <div className="space-y-2 text-sm text-gray-300">
                  <p>🌐 Total revived: ${globalStats.totalUsdValue}</p>
                  <p>👥 Total participants: {globalStats.participantCount}</p>
                </div>
              )}
            </div>
          )}

          {/* ✅ Katılmışsa */}
          {userData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-8">
                <Card className="bg-gray-800 border border-gray-700 shadow-md">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-400 mb-2">Coincarnator No</p>
                    <p className="text-lg font-bold">#{userData.coincarnator_no}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border border-gray-700 shadow-md">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-400 mb-2">Contribution (USD)</p>
                    <p className="text-lg font-bold text-green-400">${userData.contribution_usd}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border border-gray-700 shadow-md">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-400 mb-2">Your Share</p>
                    <p className="text-lg font-bold text-blue-400">{userData.share_ratio}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border border-gray-700 shadow-md">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-400 mb-2">Available $MEGY</p>
                    <p className="text-lg font-bold text-yellow-400">{userData.megy_amount} MEGY</p>
                  </CardContent>
                </Card>
              </div>

              {/* ✅ Claim Button */}
              <div className="text-center mt-10">
                {!claimed ? (
                  claimOpen ? (
                    <Button
                      onClick={handleClaim}
                      disabled={isLoading}
                      className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl text-lg"
                    >
                      {isLoading ? '⏳ Claiming...' : '🚀 Claim Now'}
                    </Button>
                  ) : (
                    <Button disabled className="bg-gray-600 text-white px-6 py-3 rounded-xl text-lg">
                      🚫 Claim not open yet
                    </Button>
                  )
                ) : (
                  <Button disabled className="bg-gray-600 text-white px-6 py-3 rounded-xl text-lg">
                    ✅ Already Claimed
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ✅ Back Link */}
      <div className="text-center mt-12">
        <Link href="/">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 rounded-xl font-semibold">
            🔁 Back to Coincarnation
          </Button>
        </Link>
      </div>
    </div>
  );
}
