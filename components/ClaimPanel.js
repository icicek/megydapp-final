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

  // Kullanıcı verisini çek
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/claimSnapshot.json');
        const json = await res.json();
        const userData = json.find((entry) => entry.wallet_address === walletAddress);
        setData(userData);
        if (userData?.claim_status === true) {
          setClaimed(true);
        }
      } catch (err) {
        console.error('Failed to load claim snapshot:', err);
      }
    };

    loadData();
  }, [walletAddress]);

  // Config.json'dan claim durumu çek
  useEffect(() => {
    const fetchClaimStatus = async () => {
      try {
        const res = await fetch('/config.json');
        const config = await res.json();
        setClaimOpen(config.claim_open);
      } catch (err) {
        console.error('Failed to fetch claim status:', err);
      }
    };
    fetchClaimStatus();
  }, []);

  const handleClaim = async () => {
    if (!data) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWallet: walletAddress,
          toWallet: walletAddress,
          amount: data.megy_amount,
          feeSignature: 'TX_PENDING', // Gerçek işlemden sonra güncellenebilir
          tokenTicker: '$MEGY',
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

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        No claim data found for this wallet.
      </div>
    );
  }

  const {
    coincarnator_no,
    contribution_usd,
    share_ratio,
    megy_amount,
  } = data;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-black via-gray-900 to-black p-8 text-white">
      <h1 className="text-4xl font-bold mb-4 text-center">🎯 Your MEGY Profile</h1>
      <p className="text-gray-400 text-center mb-10">
        {claimOpen ? 'Claim is now available.' : 'This is a preview. Claims will be enabled by the team.'}
      </p>

      <Card className="w-full max-w-2xl mb-6 bg-gray-800 border border-gray-700 shadow-md">
        <CardContent className="p-6">
          <p className="text-sm text-gray-400 mb-2">Connected Wallet</p>
          <p className="text-lg break-all">{walletAddress}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-10">
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Coincarnator No</p>
            <p className="text-lg text-white font-bold">#{coincarnator_no}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Contribution (USD)</p>
            <p className="text-lg text-green-400 font-bold">${contribution_usd}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Your Share</p>
            <p className="text-lg text-blue-400 font-bold">{share_ratio}%</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Available $MEGY</p>
            <p className="text-lg text-yellow-400 font-bold">{megy_amount} MEGY</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-xl mb-8 text-white text-sm space-y-6">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow">
          <label className="block mb-2 text-gray-300 font-medium">Amount to Claim:</label>
          <input
            type="text"
            className="w-full p-3 rounded-md text-black bg-white"
            placeholder="Full amount will be claimed"
            value={megy_amount}
            readOnly
          />
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow">
          <label className="block mb-2 text-gray-300 font-medium">Target Wallet (optional):</label>
          <input
            type="text"
            className="w-full p-3 rounded-md text-black bg-white"
            placeholder="Leave empty to use connected wallet"
            defaultValue={walletAddress}
            readOnly
          />
        </div>
        <p className="text-yellow-400 text-sm pl-1">
          ⚠️ You will be charged a 0.5 USD fee in SOL during claim.
        </p>
      </div>

      {!claimed ? (
        claimOpen ? (
          <Button
            onClick={handleClaim}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-2xl text-xl"
          >
            {isLoading ? '⏳ Claiming...' : '🚀 Claim Now'}
          </Button>
        ) : (
          <Button
            disabled
            className="bg-gray-600 text-white font-bold px-8 py-4 rounded-2xl text-xl cursor-not-allowed"
          >
            🚫 Claim Disabled
          </Button>
        )
      ) : (
        <Button
          disabled
          className="bg-gray-600 text-white font-bold px-8 py-4 rounded-2xl text-xl cursor-not-allowed"
        >
          ✅ Already Claimed
        </Button>
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
