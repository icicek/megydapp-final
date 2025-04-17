// 📁 app/success/page.js
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CoincarnationResult from '../../components/CoincarnationResult';

// Bu içeriği Suspense içine alıyoruz
function SuccessContent() {
  const searchParams = useSearchParams();
  const tokenFrom = searchParams.get('tokenFrom') || 'DOGE'; // $ işaretini burada kullanma
  const number = searchParams.get('number') || '777';

  const imageUrl = `/api/generatecoincarnationimage?tokenFrom=${tokenFrom}&tokenTo=MEGY&number=${number}`;

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <CoincarnationResult tokenFrom={tokenFrom} number={number} imageUrl={imageUrl} />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
