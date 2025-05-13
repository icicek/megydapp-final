'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import CoincarnationResult from '../../components/CoincarnationResult';
import { Button } from '@/components/ui/button';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFrom = searchParams.get('tokenFrom');
  const number = searchParams.get('number');

  if (!tokenFrom || !number) {
    return (
      <div className="text-center text-white p-10">
        <h2 className="text-2xl font-bold mb-4">🚨 Invalid Coincarnation Data</h2>
        <p>Please return to the homepage and try again.</p>
        <Button className="mt-6" onClick={() => router.push('/')}>Go to Homepage</Button>
      </div>
    );
  }

  const imageUrl = `/api/generatecoincarnationimage?tokenFrom=${tokenFrom}&tokenTo=$MEGY&number=${number}`;

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center py-16 px-4">
      <CoincarnationResult tokenFrom={tokenFrom} number={number} imageUrl={imageUrl} />

      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Button onClick={() => router.push('/coincarne')} className="bg-purple-600 hover:bg-purple-700 text-white">🔁 Recoincarnate</Button>
        <Button onClick={() => router.push('/claim')} className="bg-blue-600 hover:bg-blue-700 text-white">👤 View Profile</Button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `🚀 I just swapped my $${tokenFrom} for $MEGY. Coincarnator #${number} reporting in.\n\n🌐 Join the rescue 👉 coincarnation.com`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded"
        >
          🐦 Share on X
        </a>
      </div>
    </div>
  );
}
