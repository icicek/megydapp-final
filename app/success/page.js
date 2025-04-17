// 📁 app/success/page.js
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import CoincarnationResult from '../../components/CoincarnationResult';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const tokenFrom = searchParams.get('tokenFrom') || '$DOGE';
  const number = searchParams.get('number') || '777';

  const imageUrl = `/api/generatecoincarnationimage?tokenFrom=${tokenFrom}&tokenTo=$MEGY&number=${number}`;

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <CoincarnationResult tokenFrom={tokenFrom} number={number} imageUrl={imageUrl} />
    </div>
  );
}
