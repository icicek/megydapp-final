'use client';

import { useParams } from 'next/navigation';

export default function SharePage() {
  const { id } = useParams();
  const baseUrl = "https://megydapp.vercel.app"; // Senin siten. Değişirse burayı güncelleriz.

  const shareText = encodeURIComponent(
    `🚀 I just Coincarned! I'm Coincarnator #${id}. Deadcoins revived! Join us 👉 ${baseUrl}`
  );

  const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-6">🚀 Coincarnation Success!</h1>
      <p className="text-2xl mb-4">You are Coincarnator #{id}</p>
      <p className="text-lg">Your revival has strengthened the future of crypto! 🔥</p>

      <div className="mt-8 flex flex-col gap-4 items-center">
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-2 px-6 rounded-full transition"
        >
          Share on X (Twitter)
        </a>

        <a href="/" className="text-cyan-400 underline mt-4">Return to Home</a>
      </div>
    </div>
  );
}
