export default function HomePage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: 'white' }}>
      <h1>🚀 Welcome to MEGY Coincarnation</h1>
      <p>The place where deadcoins come back stronger.</p>
      <p>
        Try this test link 👉{" "}
        <a
          href="/share/777?tokenFrom=DOGE&tokenTo=MEGY"
          style={{ color: '#0ff', textDecoration: 'underline' }}
        >
          /share/777
        </a>
      </p>
    </div>
  );
}
