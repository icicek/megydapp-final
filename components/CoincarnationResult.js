// ✅ File: components/CoincarnationResult.js
'use client';

import React, { useState } from 'react';

export default function CoincarnationResult({ tokenFrom, number, imageUrl, walletAddress }) {
  const [tweetUrl, setTweetUrl] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null);

  const tweetText = `🚀 I just swapped my $${tokenFrom} for $MEGY. Coincarnator #${number} reporting in.\n\n🌐 We&apos;re uniting deadcoins to rescue billions.\n\n🔗 Join us 👉 coincarnation.com`;

  const tweetLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/tweet-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: walletAddress,
          tweet: tweetUrl,
          token: tokenFrom,
          number,
        })
      });
      const data = await res.json();
      setSubmitMessage(data.success ? '✅ Submission received!' : '❌ Submission failed.');
    } catch (err) {
      console.error('Tweet submission error:', err);
      setSubmitMessage('❌ Submission failed.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'black', color: 'white' }}>
      <h2>🚀 Coincarnated!</h2>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Coincarnation Image"
          style={{ maxWidth: '100%', marginTop: '20px', borderRadius: '8px' }}
        />
      )}

      <p style={{ marginTop: '30px', whiteSpace: 'pre-line' }}>{tweetText}</p>

      <div style={{ marginTop: '40px' }}>
        {imageUrl && (
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
        )}

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

      {/* NFT Call to Action */}
      <div style={{
        backgroundColor: '#222',
        padding: '20px',
        marginTop: '40px',
        borderRadius: '12px',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        color: 'white',
      }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>🔥 Think your loss was legendary?</p>
        <p>Tweet your Coincarnation to earn a shot at the rarest NFTs!</p>
        <p style={{ fontSize: '13px', color: '#bbb', marginTop: '6px' }}>💎 The more you&apos;ve lost, the rarer your NFT. The biggest losses get priority.</p>

        <a
          href={tweetLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#00bcd4',
            color: 'black',
            fontWeight: 'bold',
            borderRadius: '8px',
            textDecoration: 'none'
          }}
        >
          🐦 Tweet & Join the NFT Hunt!
        </a>

        {/* Tweet submission form */}
        <div style={{ marginTop: '30px' }}>
          <input
            type="url"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            placeholder="Paste your tweet link here"
            style={{
              padding: '10px',
              width: '80%',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginBottom: '10px'
            }}
          />
          <br />
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4caf50',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ✅ Submit Tweet for Review
          </button>
          {submitMessage && <p style={{ marginTop: '10px', fontSize: '14px' }}>{submitMessage}</p>}
        </div>
      </div>
    </div>
  );
}
