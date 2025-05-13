'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, Connection } from '@solana/web3.js';
import { Button } from '@/components/ui/button';

const rpc = new Connection("https://mainnet.helius-rpc.com/?api-key=2474b174-fad8-49db-92cb-8a0add22e70c");

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const mint = searchParams.get('mint');
  const symbol = searchParams.get('symbol');
  const maxAmount = parseFloat(searchParams.get('amount')) || 0;

  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [txSuccess, setTxSuccess] = useState(false);
  const [coincarnatorNo, setCoincarnatorNo] = useState(null);

  const handleCoincarne = async () => {
    setStatus('Submitting...');
    try {
      const res = await fetch('/api/coincarnation/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          token_from: symbol,
          mint,
          amount: parseFloat(amount),
          chain: 'solana',
        })
      });
      const data = await res.json();
      if (data.transaction) {
        const tx = Transaction.from(Buffer.from(data.transaction, 'base64'));
        await sendTransaction(tx, connection);

        const og = await fetch(`/api/ogdata?wallet=${publicKey.toBase58()}&token=${symbol}&mint=${mint}&amount=${amount}`);
        const json = await og.json();

        setCoincarnatorNo(json.coincarnator_no);
        setTxSuccess(true);
      } else {
        setStatus('✅ Coincarnation complete without blockchain action.');
      }
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
    }
  };

  if (!mint || !symbol || !maxAmount) {
    return <div className="text-white text-center mt-10">Invalid token info.</div>;
  }

  return (
    <div className="text-white text-center py-10 px-4">
      {!txSuccess ? (
        <>
          <h1 className="text-3xl font-bold mb-6">Coincarnate ${symbol}</h1>
          <p className="mb-4">You have {maxAmount} {symbol}</p>

          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="p-3 w-full max-w-xs mx-auto rounded bg-gray-800 border border-gray-600 text-center"
          />

          <Button onClick={handleCoincarne} className="mt-6 bg-purple-600 hover:bg-purple-700">Coincarnate</Button>

          {status && <p className="mt-4 text-sm">{status}</p>}
        </>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">🎉 Coincarnation Complete!</h2>
          <p>You are Coincarnator #{coincarnatorNo}</p>

          <div className="mt-6 space-x-4">
            <Button onClick={() => router.push('/coincarne')}>🔁 Recoincarnate</Button>
            <Button onClick={() => router.push('/claim')}>👤 View Profile</Button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `🚀 I just swapped my $${symbol} for $MEGY. Coincarnator #${coincarnatorNo} reporting in.\n\n🌐 Join us 👉 coincarnation.com`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded"
            >
              🐦 Share on X
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
