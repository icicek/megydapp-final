import { Suspense } from 'react';
import ConfirmContent from './ConfirmContent';

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
