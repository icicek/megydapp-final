// ✅ File: components/ClaimPanel.js
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const rpcConnection = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");

export default function ClaimPanel({
  walletAddress,
  coincarnatorNo,
  contributionUSD,
  shareRatio,
  claimableMEGY,
  claimStatus,
  globalStats,
  claimOpen,
}) {
  const [amountToClaim, setAmountToClaim] = useState('');
  const [targetWallet, setTargetWallet] = useState(walletAddress);
  const [isLoading, setIsLoading] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handleClaim = async () => {
    const amount = parseFloat(amountToClaim);
    const feeWallet = new PublicKey('HPBNVF9ATsnkDhGmQB4xoLC5tWBWQbTyBjsiQAN3dYXH');

    if (!amount || amount <= 0 || amount > claimableMEGY) {
      alert('Please enter a valid amount to claim.');
      return;
    }

    if (!targetWallet || targetWallet.length < 32) {
      alert('Please enter a valid wallet address.');
      return;
    }

    if (!publicKey) {
      alert('Connect your wallet first.');
      return;
    }

    if (!claimOpen) {
      alert('Claim process is currently closed.');
      return;
    }

    setIsLoading(true);

    try {
      const solPriceUSD = 100;
      const feeInSOL = 0.5 / solPriceUSD;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: feeWallet,
          lamports: Math.round(feeInSOL * LAMPORTS_PER_SOL),
        })
      );

      const signature = await sendTransaction(transaction, rpcConnection);
      const latestBlockhash = await rpcConnection.getLatestBlockhash();

      await rpcConnection.confirmTransaction({
        signature,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        blockhash: latestBlockhash.blockhash,
      });

      console.log('✅ Fee paid with tx:', signature);

      // 🔁 Post to internal API
      const saveRes = await fetch('/api/saveClaim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          targetAddress: targetWallet,
          amount,
          solFeeTx: signature,
          megyClaimTx: 'pending',
        }),
      });

      if (!saveRes.ok) {
        const errText = await saveRes.text();
        console.error('❌ Supabase kayıt hatası:', errText);
        alert('❌ Claim failed: ' + errText);
        return;
      }

      alert('✅ Claim successful! Your record has been saved.');
    } catch (err) {
      console.error('⚠️ Claim request failed:', err);
      alert('⚠️ Claim request failed.');
    }

    setIsLoading(false);
  };

  const hasContribution = contributionUSD > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-black via-gray-900 to-black p-8 text-white">
      <h1 className="text-4xl font-bold mb-4 text-center">🎯 Your MEGY Profile</h1>
      <p className="text-gray-400 text-center mb-10">Claim your rewards. Fee required only during claim.</p>

      <Card className="w-full max-w-2xl mb-6 bg-gray-800 border border-gray-700 shadow-md">
        <CardContent className="p-6">
          <p className="text-sm text-gray-400 mb-2">Connected Wallet</p>
          <p className="text-lg break-all">{walletAddress}</p>
        </CardContent>
      </Card>

      {hasContribution ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-10">
            <Card className="bg-gray-800 border border-gray-700 shadow-md">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-2">Coincarnator No</p>
                <p className="text-lg text-white font-bold">#{coincarnatorNo}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 shadow-md">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-2">Contribution (USD)</p>
                <p className="text-lg text-green-400 font-bold">${contributionUSD}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 shadow-md">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-2">Your Share</p>
                <p className="text-lg text-blue-400 font-bold">{shareRatio}%</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 shadow-md">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-2">Available $MEGY</p>
                <p className="text-lg text-yellow-400 font-bold">{claimableMEGY} MEGY</p>
              </CardContent>
            </Card>
          </div>

          <div className="w-full max-w-xl mb-8 text-white text-sm space-y-6">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow">
              <label className="block mb-2 text-gray-300 font-medium">Amount to Claim:</label>
              <input
                type="number"
                className="w-full p-3 rounded-md text-black bg-white"
                placeholder="Enter MEGY amount"
                value={amountToClaim}
                onChange={(e) => setAmountToClaim(e.target.value)}
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow">
              <label className="block mb-2 text-gray-300 font-medium">Target Wallet (optional):</label>
              <input
                type="text"
                className="w-full p-3 rounded-md text-black bg-white"
                placeholder="Leave empty to use connected wallet"
                value={targetWallet}
                onChange={(e) => setTargetWallet(e.target.value)}
              />
            </div>
            {claimOpen && parseFloat(amountToClaim) > 0 && (
              <p className="text-yellow-400 text-sm pl-1">
                ⚠️ You will be charged a 0.5 USD fee in SOL during this claim.
              </p>
            )}
          </div>

          <Button
            onClick={handleClaim}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-2xl text-xl"
          >
            {isLoading ? 'Processing...' : '🚀 Claim Now'}
          </Button>
        </>
      ) : (
        <div className="text-center mb-12 mt-8">
          <p className="text-lg text-gray-300 mb-4">You haven’t Coincarned yet.</p>
          <Link href="/" passHref>
            <Button className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl text-lg">
              🚀 Start Coincarnating
            </Button>
          </Link>
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mt-16 mb-4">🌍 Global Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Total USD Revived</p>
            <p className="text-xl text-green-400 font-bold">${globalStats.totalUsd}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Total Participants</p>
            <p className="text-xl text-blue-400 font-bold">{globalStats.totalParticipants}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Tokens Revived</p>
            <p className="text-xl text-yellow-300 font-bold">{globalStats.totalTokens}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
