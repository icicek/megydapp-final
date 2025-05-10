'use client';

import React from 'react';

export default function CoincarnationResult({ tokenFrom, number }) {
  const imageUrl = `/generated/coincarnator_${number}.png`;

  const tweetText = `🚀 I just swapped my $${tokenFrom} for $MEGY. Coincarnator #${number} reporting in.\n\n🌐 We're uniting deadcoins to rescue billions.\n\n🔗 Join us 👉 coincarnation.com`;

  const tweetLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'black', color: 'white' }}>
      <h2>🚀 Coincarnated!</h2>
      <img
        src={imageUrl}
        alt="Coincarnation Image"
        style={{ maxWidth: '100%', marginTop: '20px', borderRadius: '8px' }}
      />
      <p style={{ marginTop: '30px', whiteSpace: 'pre-line' }}>{tweetText}</p>

      <div style={{ marginTop: '40px' }}>
        <a
          href={imageUrl}
          download={`coincarnation-${number}.png`}
          style={{
            padding: '12px 24px',
            backgroundColor: '#00FFFF',
            color: 'black',
            fontWeight: 'bold',
            borderRadius: '6px',
            textDecoration: 'none',
            marginRight: '20px'
          }}
        >
          ⬇️ Download Image
        </a>

        <a
          href={tweetLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '12px 24px',
            backgroundColor: '#1DA1F2',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          🐦 Share Tweet (add image manually)
        </a>
      </div>
    </div>
  );
}
