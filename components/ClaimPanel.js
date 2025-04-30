'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function ClaimPanel({
  walletAddress,
  coincarnatorNo,
  contributionUSD,
  shareRatio,
  claimableMEGY,
  claimStatus,
  globalStats // ✅ Yeni: genel istatistik verisi
}) {
  const hasContribution = contributionUSD > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-black via-gray-900 to-black p-8 text-white">
      
      {/* Başlık */}
      <h1 className="text-4xl font-bold mb-2 text-center">
        🎯 Your MEGY Profile
      </h1>
      <p className="text-gray-400 text-center mb-10">
        Track your impact and join the global Coincarnation movement.
      </p>

      {/* Wallet bilgisi her zaman gösterilsin */}
      <Card className="w-full max-w-2xl mb-6 bg-gray-800 border border-gray-700 shadow-md">
        <CardContent className="p-6">
          <p className="text-sm text-gray-400 mb-2">Wallet Address</p>
          <p className="text-lg break-all">{walletAddress}</p>
        </CardContent>
      </Card>

      {/* Kullanıcı katkı yaptıysa */}
      {hasContribution ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-10">

            {/* Coincarnator No */}
            <Card className="bg-gray-800 border border-gray-700 shadow-md">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-2">Coincarnator No</p>
                <p className="text-lg text-white font-bold">#{coincarnatorNo}</p>
              </CardContent>
            </Card>

            {/* Contribution */}
            <Card className="bg-gray-800 border border-gray-700 shadow-md">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-2">Contribution (USD)</p>
                <p className="text-lg text-green-400 font-bold">${contributionUSD}</p>
              </CardContent>
            </Card>

            {/* Share Ratio */}
            <Card className="bg-gray-800 border border-gray-700 shadow-md">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-2">Your Share</p>
                <p className="text-lg text-blue-400 font-bold">{shareRatio}%</p>
              </CardContent>
            </Card>

            {/* Claimable MEGY */}
            <Card className="bg-gray-800 border border-gray-700 shadow-md">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-2">Claimable $MEGY</p>
                <p className="text-lg text-yellow-400 font-bold">{claimableMEGY} MEGY</p>
              </CardContent>
            </Card>
          </div>

          {/* Claim Butonu */}
          <div className="mt-6">
            {claimStatus ? (
              <Button disabled className="bg-gray-600 hover:bg-gray-600 cursor-not-allowed">
                ✅ Already Claimed
              </Button>
            ) : (
              <Button className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-2xl text-xl">
                🚀 Claim Now
              </Button>
            )}
          </div>
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

      {/* 🌍 Global Stats */}
      <h2 className="text-2xl font-bold text-white mt-16 mb-4">
        🌍 Global Coincarnation Stats
      </h2>

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
            <p className="text-sm text-gray-400 mb-1">Unique Tokens Revived</p>
            <p className="text-xl text-yellow-300 font-bold">{globalStats.totalTokens}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
