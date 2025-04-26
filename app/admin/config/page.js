'use client';

import { Suspense } from 'react';
import ConfigPageInner from './ConfigPageInner';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfigPageInner />
    </Suspense>
  );
}
