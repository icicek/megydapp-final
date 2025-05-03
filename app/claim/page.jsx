'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import ClaimPanel from '@/components/ClaimPanel';

export default function ClaimPage() {
  const { publicKey } = useWallet();
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toBase58());
    }
  }, [publicKey]);

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Please connect your wallet to view your claim profile.
      </div>
    );
  }

  return <ClaimPanel walletAddress={walletAddress} />;
}
