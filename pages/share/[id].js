import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SharePage() {
  const router = useRouter();
  const { id, tokenFrom, tokenTo } = router.query;

  if (!id || !tokenFrom || !tokenTo) return null;

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

      <div style={{ textAlign: 'center', marginTop: '80px', color: 'white' }}>
        <h2>🚀 Coincarnated!</h2>
        <img src={imageUrl} alt="Coincarnation Image" style={{ maxWidth: '100%', marginTop: '20px' }} />
        <p style={{ marginTop: '30px', whiteSpace: 'pre-line' }}>{tweetText}</p>
      </div>
    </>
  );
}
