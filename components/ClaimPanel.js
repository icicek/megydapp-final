'use client';

import React from 'react';
import { Button } from '@/components/ui/button'; // Shadcn UI kullanıyoruz.
import { Card, CardContent } from '@/components/ui/card';

export default function ClaimPanel({ walletAddress, coincarnatorNo, contributionUSD, shareRatio, claimableMEGY, claimStatus }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-8">
      
      {/* Panel Başlığı */}
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        🎯 Claim Your $MEGY Rewards
      </h1>

      {/* Bilgiler Kartı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* Wallet Address */}
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Wallet Address</p>
            <p className="text-lg text-white break-all">{walletAddress}</p>
          </CardContent>
        </Card>

        {/* Coincarnator No */}
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Coincarnator No</p>
            <p className="text-lg text-white">{coincarnatorNo}</p>
          </CardContent>
        </Card>

        {/* Katkı Değeri (USD) */}
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Contribution (USD)</p>
            <p className="text-lg text-green-400">${contributionUSD}</p>
          </CardContent>
        </Card>

        {/* Toplam Katkı Payı */}
        <Card className="bg-gray-800 border border-gray-700 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Your Share</p>
            <p className="text-lg text-blue-400">{shareRatio}%</p>
          </CardContent>
        </Card>

        {/* Claimable MEGY */}
        <Card className="bg-gray-800 border border-gray-700 shadow-md md:col-span-2">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400 mb-2">Claimable $MEGY</p>
            <p className="text-2xl text-yellow-400 font-bold">{claimableMEGY} MEGY</p>
          </CardContent>
        </Card>
      </div>

      {/* Claim Button */}
      <div className="mt-10">
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

    </div>
  );
}
