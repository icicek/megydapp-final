import { notFound } from 'next/navigation';

export default function SharePage({ params, searchParams }) {
  const { id } = params;
  const tokenFrom = searchParams.tokenFrom || 'DOGE';
  const tokenTo = searchParams.tokenTo || 'MEGY';

  if (!id || !tokenFrom || !tokenTo) return notFound();

  const imageUrl = `https://megydapp.vercel.app/api/generatecoincarnationimage?tokenFrom=${tokenFrom}&tokenTo=${tokenTo}&number=${id}`;

  const tweetText = `🚀 I just swapped my $${tokenFrom} for $${tokenTo}. Coincarnator #${id} reporting in.

🌐 We're uniting deadcoins to rescue billions.

🔗 Join us 👉 coincarnation.com`;

  return (
    <>
      <head>
        <title>Coincarnated 🚀</title>
        <meta name="description" content={tweetText} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Coincarnated 🚀" />
        <meta name="twitter:description" content={tweetText} />
        <meta name="twitter:image" content={imageUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:title" content="Coincarnated 🚀" />
        <meta property="og:description" content={tweetText} />
      </head>

      <div style={{ textAlign: 'center', marginTop: '80px', color: 'white' }}>
        <h2>🚀 Coincarnated!</h2>
        <img src={imageUrl} alt="Coincarnation Image" style={{ maxWidth: '100%', marginTop: '20px' }} />
        <p style={{ marginTop: '30px', whiteSpace: 'pre-line' }}>{tweetText}</p>
      </div>
    </>
  );
}
