import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function SharePage() {
  const router = useRouter();
  const [queryReady, setQueryReady] = useState(false);

  const { id, tokenFrom, tokenTo } = router.query;

  useEffect(() => {
    if (id && tokenFrom && tokenTo) {
      setQueryReady(true);
    }
  }, [id, tokenFrom, tokenTo]);

  if (!queryReady) {
    return <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Preparing...</p>;
  }

  const imageUrl = `https://megydapp.vercel.app/api/generatecoincarnationimage?tokenFrom=${tokenFrom}&tokenTo=${tokenTo}&number=${id}`;

  const tweetText = `🚀 I just swapped my $${tokenFrom} for $${tokenTo}. Coincarnator #${id} reporting in.

🌐 We're uniting deadcoins to rescue billions.

🔗 Join us 👉 coincarnation.com`;

  return (
    <>
      <Head>
        <title>Coincarnated 🚀</title>
        <meta name="description" content={tweetText} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Coincarnated 🚀" />
        <meta name="twitter:description" content={tweetText} />
        <meta name="twitter:image" content={imageUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:title" content="Coincarnated 🚀" />
        <meta property="og:description" content={tweetText} />
      </Head>

      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <h2 style={{ color: 'white' }}>🚀 Coincarnated!</h2>
        <img src={imageUrl} alt="Coincarnation Image" style={{ maxWidth: '100%', marginTop: '20px' }} />
        <p style={{ marginTop: '30px', whiteSpace: 'pre-line', color: 'white' }}>{tweetText}</p>
      </div>
    </>
  );
}
