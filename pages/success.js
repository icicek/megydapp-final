import Head from 'next/head';

export default function SuccessPage({ tokenFrom, number }) {
  const imageUrl = `https://megydapp.vercel.app/api/generatecoincarnationimage?tokenFrom=${tokenFrom}&tokenTo=$MEGY&number=${number}`;
  const tweetText = `🚀 I just swapped my $${tokenFrom} for $MEGY. Coincarnator #${number} reporting in.

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

      <div style={{ backgroundColor: 'black', minHeight: '100vh', padding: '40px', textAlign: 'center', color: 'white' }}>
        <h2>🎉 Congrats! You’ve Coincarnated ${tokenFrom} → $MEGY</h2>
        <img
          src={imageUrl}
          alt="Coincarnation Image"
          style={{ maxWidth: '100%', marginTop: '20px' }}
        />
        <p style={{ marginTop: '30px', whiteSpace: 'pre-line' }}>{tweetText}</p>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#1DA1F2',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none'
          }}
        >
          Share on X 🚀
        </a>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { tokenFrom = '$DOGE', number = '777' } = context.query;

  return {
    props: {
      tokenFrom,
      number,
    },
  };
}
