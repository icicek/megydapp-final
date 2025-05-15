// ✅ File: components/CoincarneConfirmModal.jsx
'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CoincarneConfirmModal({ open, onClose, token, amount }) {
  const [confirmed, setConfirmed] = useState(false);
  const [inputAmount, setInputAmount] = useState('');

  const handleConfirm = () => {
    // Burada backend işlemi yapılabilir
    setConfirmed(true);
  };

  const handlePercentageClick = (pct) => {
    const calculated = ((amount || 0) * pct) / 100;
    setInputAmount(calculated.toFixed(6));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-gray-700 text-white max-w-md p-6 rounded-xl shadow-lg">
        {!confirmed ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">Coincarnate {token}</h2>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[25, 50, 75, 100].map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  onClick={() => handlePercentageClick(pct)}
                  className="text-white border-gray-600"
                >
                  %{pct}
                </Button>
              ))}
            </div>

            <input
              type="number"
              min="0"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded mb-4 text-white"
            />

            <Button
              onClick={handleConfirm}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!inputAmount || parseFloat(inputAmount) <= 0}
            >
              Confirm Coincarnation
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">🎉 Coincarnation Complete</h2>
            <div className="flex flex-col gap-4">
              <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 w-full">
                🔁 Recoincarnate
              </Button>
              <Button onClick={() => window.location.href = '/claim'} className="bg-blue-600 hover:bg-blue-700 w-full">
                👤 Go to Profile
              </Button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `🚀 Just Coincarnated my $${token} for $MEGY! #Coincarnation`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded text-center"
              >
                🐦 Share on X
              </a>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
