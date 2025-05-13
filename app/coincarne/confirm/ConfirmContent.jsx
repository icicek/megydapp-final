'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mint = searchParams.get('mint');
  const symbol = searchParams.get('symbol');
  const amount = searchParams.get('amount');

  const [input, setInput] = useState('');
  const [message, setMessage] = useState(null);

  const handleConfirm = () => {
    if (!input || parseFloat(input) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    router.push(`/success?tokenFrom=${symbol}&number=${Math.floor(Math.random() * 1000)}`);
  };

  if (!mint || !symbol || !amount) {
    return (
      <div className="text-center text-white mt-10">
        <h2 className="text-2xl font-bold mb-4">🚨 Invalid token data</h2>
        <Button onClick={() => router.push('/')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-6">Coincarnate {symbol}</h1>
      <p className="mb-2">Your Wallet Balance: {parseFloat(amount).toFixed(4)}</p>

      <input
        type="number"
        step="any"
        min="0"
        placeholder="Enter amount to Coincarne"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="bg-gray-800 border border-gray-600 rounded p-3 text-white w-full max-w-md mb-4"
      />

      <Button onClick={handleConfirm} className="bg-purple-600 hover:bg-purple-700">🚀 Coincarnate</Button>

      {message && <p className="text-red-400 mt-4">{message}</p>}
    </div>
  );
}
