'use client';

import React, { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const json = await res.json();
        setData(json.topWallets || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">🏆 Top Coincarnators</h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading leaderboard...</p>
      ) : (
        <div className="overflow-x-auto max-w-4xl mx-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Wallet</th>
                <th className="py-3 px-4">$MEGY Earned</th>
                <th className="py-3 px-4">Contribution (USD)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-2 px-4 text-yellow-400 font-bold">#{index + 1}</td>
                  <td className="py-2 px-4 text-white break-all">{entry.wallet_address}</td>
                  <td className="py-2 px-4 text-cyan-300 font-medium">{Math.floor(entry.ratio * 5000000000).toLocaleString()}</td>
                  <td className="py-2 px-4 text-green-400">${entry.total_usd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
