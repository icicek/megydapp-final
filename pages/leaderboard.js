// ✅ File: pages/leaderboard.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.leaderboard);
        setLoading(false);
      });
  }, []);

  const shorten = (addr) => addr.slice(0, 6) + '...' + addr.slice(-4);

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 md:px-12">
      <h1 className="text-4xl font-bold text-center mb-10">🏆 MEGY Leaderboard</h1>
      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Wallet</th>
                <th className="py-3 px-4">Contribution (USD)</th>
                <th className="py-3 px-4">Coincarnator No</th>
                <th className="py-3 px-4">Profile</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const isCurrentUser = publicKey && row.wallet_address.toLowerCase() === publicKey.toBase58().toLowerCase();
                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-700 hover:bg-gray-900 ${
                      isCurrentUser ? 'bg-indigo-900 text-yellow-300' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td className="py-3 px-4 font-mono">{shorten(row.wallet_address)}</td>
                    <td className="py-3 px-4 text-green-400 font-semibold">${parseFloat(row.contribution_usd).toFixed(2)}</td>
                    <td className="py-3 px-4">#{row.coincarnator_no}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/share/${row.coincarnator_no}`}
                        className="text-blue-400 hover:underline text-sm"
                        target="_blank"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
