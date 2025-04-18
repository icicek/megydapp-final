import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'black',
        color: 'white',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
        🚀 Welcome to MEGY Coincarnation
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
        The place where deadcoins come back stronger.
      </p>
      <p style={{ marginTop: '20px' }}>
        Try a test link 👉{' '}
        <Link href="/share/777?tokenFrom=DOGE&tokenTo=MEGY">
          <span style={{ color: '#00FFFF', textDecoration: 'underline' }}>
            /share/777
          </span>
        </Link>
      </p>
    </main>
  );
}
