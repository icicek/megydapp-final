import Head from 'next/head';

export default function SharePage({ number }) {
  const amount = '4,560,932';
  const percent = '1.72';

  return (
    <>
      <Head>
        <title>Your MEGY Score</title>
        <meta property="og:title" content="I just earned millions of $MEGY! 🚀" />
        <meta property="og:description" content="Join the Coincarnation. Claim your MEGY, share your score, and rise above the ruins of failed tokens!" />
        <meta property="og:image" content={`https://megydapp.vercel.app/generated/score-${number}.png`} />
        <meta property="og:url" content={`https://megydapp.vercel.app/share/${number}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center p-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">🚀 Coincarnator #{number}</h1>
          <p className="text-lg md:text-2xl text-yellow-400 font-semibold mb-2">{amount} $MEGY</p>
          <p className="text-base md:text-xl text-teal-300 mb-4">Top {percent}% Contributor</p>
          <img
            src={`/generated/score-${number}.png`}
            alt="MEGY Score Image"
            className="w-full max-w-xl rounded-xl shadow-lg border border-gray-700"
          />
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { number } = context.params;
  return {
    props: {
      number,
    },
  };
}
