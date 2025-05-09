import Image from 'next/image';

export function generateMetadata({ params }) {
  const number = params.number;
  const imageUrl = `https://megydapp.vercel.app/generated/score-${number}.png`;

  return {
    title: `Coincarnator #${number} | $MEGY Score`,
    openGraph: {
      title: `Coincarnator #${number} | $MEGY Score`,
      images: [imageUrl],
      url: `https://megydapp.vercel.app/share/${number}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Coincarnator #${number} | $MEGY Score`,
      images: [imageUrl],
    },
  };
}

export default function SharePage({ params }) {
  const number = params.number;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🚀 Coincarnator #{number}</h1>
      <p className="mb-6 text-gray-300">This is your official MEGY Score visual. Share it proudly!</p>

      <div className="bg-white rounded-xl p-2">
        <Image
          src={`/generated/score-${number}.png`}
          alt={`MEGY Score ${number}`}
          width={1200}
          height={630}
          priority
        />
      </div>
    </div>
  );
}
