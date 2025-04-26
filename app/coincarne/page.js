'use client';
import { useState } from 'react';

export default function CoincarnePage() {
  const [wallet, setWallet] = useState('');
  const [tokenFrom, setTokenFrom] = useState('');
  const [mint, setMint] = useState('');
  const [amount, setAmount] = useState('');
  const [chain, setChain] = useState('solana'); // default
  const [status, setStatus] = useState('');
  const [canRefund, setCanRefund] = useState(false);
  const [refundStatus, setRefundStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('⏳ Sending...');
    setCanRefund(false);
    setRefundStatus('');

    try {
      const res = await fetch('/api/coincarnation/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet,
          token_from: tokenFrom,
          mint: mint,
          amount: parseFloat(amount),
          chain: chain
        })
      });

      let message = '❌ Unknown error.';
      try {
        const data = await res.json();
        message = data.message || message;
      } catch {
        message = await res.text();
      }

      setStatus(message);

      if (message.includes('invalid')) {
        setCanRefund(true);
      }

    } catch (err) {
      console.error(err);
      setStatus('❌ Error connecting to server.');
    }
  };

  const handleRefund = async () => {
    setRefundStatus('🔄 Requesting refund...');
    try {
      const res = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet,
          mint: mint,
          chain: chain
        })
      });

      const data = await res.json();
      setRefundStatus(data.message || '✅ Refund request sent.');
      setCanRefund(false);
    } catch (err) {
      console.error(err);
      setRefundStatus('❌ Refund request failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-yellow-300">🔥 Coincarne Test Panel</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="p-3 rounded bg-gray-100 text-black placeholder-gray-500 font-medium"
            placeholder="Wallet Address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            required
          />
          <input
            type="text"
            className="p-3 rounded bg-gray-100 text-black placeholder-gray-500 font-medium"
            placeholder="Token Ticker (e.g. $PEPE)"
            value={tokenFrom}
            onChange={(e) => setTokenFrom(e.target.value)}
            required
          />
          <input
            type="text"
            className="p-3 rounded bg-gray-100 text-black placeholder-gray-500 font-medium"
            placeholder="Mint Address"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            required
          />
          <input
            type="number"
            step="any"
            className="p-3 rounded bg-gray-100 text-black placeholder-gray-500 font-medium"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          {/* 👇 NETWORK DROPDOWN */}
          <select
            className="p-3 rounded bg-gray-100 text-black font-medium"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          >
            <option value="solana">Solana</option>
            <option value="ethereum">Ethereum</option>
            <option value="bsc">BSC</option>
            <option value="polygon">Polygon</option>
            <option value="base">Base</option>
            <option value="arbitrum">Arbitrum</option>
          </select>

          <button
            type="submit"
            className="bg-yellow-400 text-black font-bold py-3 px-4 rounded hover:bg-yellow-300 transition"
          >
            Coincarne
          </button>
        </form>

        {status && <p className="mt-6 text-sm text-center">{status}</p>}

        {canRefund && (
          <div className="mt-4 flex flex-col items-center">
            <button
              onClick={handleRefund}
              className="bg-cyan-500 text-white font-bold py-2 px-4 rounded hover:bg-cyan-400 transition"
            >
              🔁 Request Refund
            </button>
            {refundStatus && <p className="mt-2 text-sm">{refundStatus}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
