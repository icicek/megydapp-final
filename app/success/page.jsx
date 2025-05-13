import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function SuccessPageWrapper() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
