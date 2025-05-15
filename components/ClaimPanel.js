'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function ClaimPanel({ walletAddress }) {
  const [data, setData] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState(null);
  const [megyAmount, setMegyAmount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (!walletAddress) return;
      try {
        const res = await fetch(`/api/profile/${walletAddress}`);
        const result = await res.json();
        if (result.exists) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    };
    loadData();
  }, [walletAddress]);

  useEffect(() => {
    const fetchClaimStatus = async () => {
      try {
        const res = await fetch('/api/config');
        const config = await res.json();
        setClaimOpen(config.claim_open);
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    };
    fetchClaimStatus();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/coincarnation/stats');
        const json = await res.json();
        setGlobalStats(json);
      } catch (err) {
        console.error('Failed to fetch global stats:', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (data && globalStats?.totalUSD) {
      const ratio = data.total_usd / globalStats.totalUSD;
      const megy = Math.floor(ratio * 5000000000);
      setMegyAmount(megy);
    }
  }, [data, globalStats]);

  const handleClaim = async () => {
    if (!data || claimed) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          destination_wallet: walletAddress,
          amount: megyAmount,
          tx_hash: 'TX_PENDING',
          token_ticker: '$MEGY',
          network: 'solana',
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert('✅ Claim successful!');
        setClaimed(true);
      } else {
        console.error('Claim failed:', result.error);
        alert(`❌ Claim failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Claim error:', err);
      alert('❌ An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-black via-gray-900 to-black px-4 md:px-8 py-8 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">🎯 Your MEGY Profile</h1>
      <p className="text-gray-400 text-center mb-8 md:mb-10">
        {claimOpen ? 'Claim is now available.' : 'This is a preview. Claims will be enabled by the team.'}
      </p>

      <Card className="w-full max-w-2xl mb-6 bg-gray-800 border border-gray-700 shadow-md">
        <CardContent className="p-4 md:p-6">
          <p className="text-sm text-gray-400 mb-2">Connected Wallet</p>
          <p className="text-base md:text-lg break-all">{walletAddress}</p>
        </CardContent>
      </Card>

      {data ? (
        <>
          <Card className="bg-gray-800 border border-gray-700 shadow-md mb-6 w-full max-w-xl">
            <CardContent className="p-4 md:p-6">
              <p className="text-sm text-gray-400 mb-2">Total Contribution (USD)</p>
              <p className="text-lg text-green-400 font-bold">${data.total_usd}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700 shadow-md mb-6 w-full max-w-xl">
            <CardContent className="p-4 md:p-6">
              <p className="text-sm text-gray-400 mb-4">Your Contributions by Token</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-600">
                      <th className="py-2">Token</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">USD Value</th>
<th className="py-2">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contributions.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-2 text-white">{entry.token}</td>
                        <td className="py-2">{entry.amount}</td>
                        <td className="py-2 text-green-400">${entry.usd}</td>
<td className="py-2">
  <a
    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 I just Coincarnated $${entry.token} worth $${entry.usd}! Join the Coincarnation revolution → https://megydapp.vercel.app`)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-400 hover:underline"
  >
    🐦 Share
  </a>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="w-full max-w-xl mb-8 text-white text-sm space-y-6">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow">
              <label className="block mb-2 text-gray-300 font-medium">Amount to Claim:</label>
              <input
                type="text"
                className="w-full p-3 rounded-md text-black bg-white"
                value={megyAmount.toLocaleString()}
                readOnly
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow">
              <label className="block mb-2 text-gray-300 font-medium">Target Wallet:</label>
              <input
                type="text"
                className="w-full p-3 rounded-md text-black bg-white"
                value={walletAddress}
                readOnly
              />
            </div>
            <p className="text-yellow-400 text-sm pl-1">
              ⚠️ You will be charged a 0.5 USD fee in SOL during claim.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:gap-4 w-full max-w-xl">
            {!claimed ? (
              claimOpen ? (
                <Button
                  onClick={handleClaim}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-2xl text-xl mb-4 md:mb-0"
                >
                  {isLoading ? '⏳ Claiming...' : '🚀 Claim Now'}
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full md:w-auto bg-gray-600 text-white font-bold px-8 py-4 rounded-2xl text-xl cursor-not-allowed mb-4 md:mb-0"
                >
                  🚫 Claim Disabled
                </Button>
              )
            ) : (
              <Button
                disabled
                className="w-full md:w-auto bg-gray-600 text-white font-bold px-8 py-4 rounded-2xl text-xl cursor-not-allowed mb-4 md:mb-0"
              >
                ✅ Already Claimed
              </Button>
            )}

            {data && globalStats && (
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `🚀 I just earned ${megyAmount.toLocaleString()} $MEGY and joined the top ${(
                    (data.total_usd / globalStats.totalUSD) * 100
                  ).toFixed(2)}%!
\n\n💥 Coincarnator #${data.coincarnator_no} reporting in.\n\n🔗 https://megydapp.vercel.app`
                )}&url=${encodeURIComponent(
                  `https://megydapp.vercel.app/share/${data.coincarnator_no}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto text-center bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-4 rounded-2xl text-lg"
              >
                🐦 Share your MEGY Score
              </a>
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-300 mt-20">
          <p className="text-xl font-semibold">🕵️ You haven’t participated yet...</p>
          <p className="mt-2 text-sm">Global participants: {globalStats?.totalWallets || 0} | Total Value: ${globalStats?.totalUSD || 0}</p>
        </div>
      )}

      <div className="text-center mt-12">
        <Link href="/">
          <Button className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl text-lg">
            🔁 Back to Coincarnation
          </Button>
        </Link>
      </div>
    </div>
  );
}
