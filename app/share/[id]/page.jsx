'use client';

import { useParams } from 'next/navigation';

export default function SharePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-6">🚀 Coincarnation Success!</h1>
      <p className="text-2xl mb-4">You are Coincarnator #{id}</p>
      <p className="text-lg">Your revival has strengthened the future of crypto! 🔥</p>

      <div className="mt-8">
        <a href="/" className="text-cyan-400 underline">Return to Home</a>
      </div>
    </div>
  );
}
