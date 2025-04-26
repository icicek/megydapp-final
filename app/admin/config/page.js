'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const SECRET_KEY = 'megymaster2025'; // değiştirilebilir

export default function ConfigAdminPage() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const searchParams = useSearchParams();

  // Şifre kontrolü
  useEffect(() => {
    const key = searchParams.get('key');
    if (key === SECRET_KEY) {
      setAccessGranted(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate })
      });

      const result = await res.json();
      if (res.ok) {
        setStatus('✅ End date updated successfully!');
      } else {
        setStatus('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Failed to update end date.');
    }
  };

  // Erişim reddedildiyse mesaj göster
  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center text-center">
        <p>🚫 Unauthorized access. You need a valid key in the URL.</p>
      </div>
    );
  }

  // Panel gösterimi
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold mb-6">🛠 Update Coincarnation End Date</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="datetime-local"
          className="p-2 rounded bg-white text-black font-medium"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-yellow-500 text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition"
        >
          Update End Date
        </button>
      </form>

      {status && (
        <p className={`mt-4 text-sm ${
          status.includes('successfully') ? 'text-green-400' : 'text-red-400'
        }`}>
          {status}
        </p>
      )}
    </div>
  );
}
