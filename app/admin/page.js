'use client';
import { Suspense } from 'react';
import AdminPageInner from './AdminPageInner';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPageInner />
    </Suspense>
  );
}
