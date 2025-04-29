'use client';

import React from 'react';
import ClaimPanel from '@/components/ClaimPanel';

export default function ClaimPage() {
  return (
    <ClaimPanel
      walletAddress="0x123...abc"
      coincarnatorNo={777}
      contributionUSD={1200}
      shareRatio={3.5}
      claimableMEGY={15000}
      claimStatus={false}
    />
  );
}
