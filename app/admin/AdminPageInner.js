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
  const [isCcActive, setIsCcActive] = useState(false);
  const [ccStatusMessage, setCcStatusMessage] = useState('');
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

  // 🔐 Secret key kontrol
  useEffect(() => {
    const key = searchParams.get('key');
    if (key === SECRET_KEY) {
      setAccessGranted(true);
    }
  }, [searchParams]);

  // 🟢 Coincarnation ve Claim durumlarını getir
  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch('/api/config');
      const data = await res.json();
      setIsCcActive(data.cc_active);
      setIsClaimOpen(data.claim_open);
    };
    fetchStatus();
  }, []);

  const toggleCcStatus = async () => {
    try {
      const res = await fetch('/api/config/toggleCcStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isCcActive }),
      });
      const result = await res.json();
      if (res.ok) {
        setIsCcActive(result.active);
        setCcStatusMessage(`✅ Coincarnation ${result.active ? 'activated' : 'deactivated'}!`);
      } else {
        setCcStatusMessage('❌ Failed to update status.');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setCcStatusMessage('❌ Error toggling status.');
    }
  };

  const toggleClaimStatus = async () => {
    try {
      const res = await fetch('/api/config/toggleClaimStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open: !isClaimOpen }),
      });
      const result = await res.json();
      if (res.ok) {
        setIsClaimOpen(result.open);
        setClaimMessage(`✅ Claim ${result.open ? 'opened' : 'closed'} successfully!`);
      } else {
        setClaimMessage('❌ Failed to update claim status.');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      setClaimMessage('❌ Error while toggling claim status.');
    }
  };

  const handleEndDateSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate }),
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

      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        <button
          className={`py-2 px-4 rounded ${activeTab === 'config' ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('config')}
        >
          📅 End Date
        </button>
        <button
          className={`py-2 px-4 rounded ${activeTab === 'cc' ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('cc')}
        >
          🔁 Coincarnation Status
        </button>
        <button
          className={`py-2 px-4 rounded ${activeTab === 'claim' ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-700'}`}
          onClick={() => setActiveTab('claim')}
        >
          🧾 Claim Status
        </button>
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
            <p className={`mt-4 text-sm ${status.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
              {status}
            </p>
          )}
        </div>
      )}

      {activeTab === 'cc' && (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">Toggle Coincarnation</h2>
          <p className="mb-4">
            Current status:{' '}
            <span className={isCcActive ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {isCcActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </p>
          <button
            onClick={toggleCcStatus}
            className={`py-2 px-6 rounded font-bold ${
              isCcActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-500 hover:bg-green-400'
            }`}
          >
            {isCcActive ? '🛑 Deactivate' : '🚀 Activate'}
          </button>
          {ccStatusMessage && (
            <p className="mt-4 text-sm text-yellow-400">{ccStatusMessage}</p>
          )}
        </div>
      )}

      {activeTab === 'claim' && (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">Toggle Claim Availability</h2>
          <p className="mb-4">
            Current status:{' '}
            <span className={isClaimOpen ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {isClaimOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </p>
          <button
            onClick={toggleClaimStatus}
            className={`py-2 px-6 rounded font-bold ${
              isClaimOpen ? 'bg-red-600 hover:bg-red-500' : 'bg-green-500 hover:bg-green-400'
            }`}
          >
            {isClaimOpen ? '🛑 Close Claim' : '🚀 Open Claim'}
          </button>
          {claimMessage && (
            <p className="mt-4 text-sm text-yellow-400">{claimMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
