'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const SECRET_KEY = 'megymaster2025';

export default function AdminPageInner() {
  const searchParams = useSearchParams();
  const [accessGranted, setAccessGranted] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  // Şifre kontrolü
  useEffect(() => {
    const key = searchParams.get('key');
    if (key === SECRET_KEY) {
      setAccessGranted(true);
    }
  }, [searchParams]);

  const handleEndDateSubmit = async (e) => {
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

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center text-center">
        <p>🚫 Unauthorized access. Add ?key=megymaster2025 to the URL.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">🛠 Admin Panel</h1>

      <div className="flex justify-center mb-6 gap-4">
        <button
          className={`py-2 px-4 rounded ${
            activeTab === 'config' ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('config')}
        >
          📅 End Date
        </button>
        {/* Diğer sekmeler: Token Listesi, Stats, Katılımcılar (ileride ekleyebiliriz) */}
      </div>

      {activeTab === 'config' && (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Update Coincarnation End Date</h2>
          <form onSubmit={handleEndDateSubmit} className="flex flex-col gap-4">
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
      )}
    </div>
  );
}
