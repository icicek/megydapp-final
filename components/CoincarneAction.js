import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CoincarneAction({ walletAddress, selectedTokenMint, selectedTokenSymbol, amount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleCoincarne = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5050/coincarne', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallet: walletAddress,
          mint: selectedTokenMint,
          amount: amount
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Coincarnation failed.');
      }

      const number = result.number;
      const tokenFrom = `$${selectedTokenSymbol}`;

      router.push(`/success?tokenFrom=${tokenFrom}&number=${number}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={handleCoincarne}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#1DA1F2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Processing...' : '🚀 Coincarne Now'}
      </button>

      {error && (
        <p style={{ marginTop: '10px', color: 'red' }}>{error}</p>
      )}
    </div>
  );
}
