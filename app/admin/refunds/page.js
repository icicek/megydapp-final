'use client';
import { useEffect, useState } from 'react';

export default function AdminRefundPanel() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedChain, setSelectedChain] = useState('all');

  useEffect(() => {
    const fetchParticipants = async () => {
      const res = await fetch('/api/admin/participants');
      const data = await res.json();
      setParticipants(data);
    };

    fetchParticipants();
  }, []);

  const chains = [...new Set(participants.map(p => p.chain))];

  const filtered = participants.filter(p => {
    const matchesSearch =
      p.wallet_address.toLowerCase().includes(search.toLowerCase()) ||
      p.token_from.toLowerCase().includes(search.toLowerCase()) ||
      p.mint.toLowerCase().includes(search.toLowerCase()) ||
      p.chain.toLowerCase().includes(search.toLowerCase());

    const matchesChain = selectedChain === 'all' || p.chain === selectedChain;

    return matchesSearch && matchesChain;
  });

  const refunded = filtered.filter(p => p.status === 'refunded');
  const pending = filtered.filter(p => p.status === 'invalidated' && p.refund_requested === true);

  const totalRefundedAmount = refunded.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">🛠️ Refund Management</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-green-400 text-lg">
          💵 Total Refunded: <span className="font-bold">{totalRefundedAmount}</span> Tokens
        </h2>

        <div className="flex gap-4 flex-col md:flex-row">
          <input
            type="text"
            placeholder="Search by wallet, token, mint, or chain..."
            className="p-2 rounded bg-gray-800 text-white placeholder-gray-400 w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 rounded bg-gray-800 text-white border border-gray-600"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
          >
            <option value="all">🌐 All Chains</option>
            {chains.map(chain => (
              <option key={chain} value={chain}>
                🌍 {chain.charAt(0).toUpperCase() + chain.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold text-cyan-400 mb-2">
          ⏳ Pending Refunds ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-gray-400">No pending refunds 🎉</p>
        ) : (
          <ul className="space-y-3">
            {pending.map(p => (
              <li key={p.id} className="bg-gray-800 p-4 rounded">
                <strong>Wallet:</strong> {p.wallet_address} <br />
                <strong>Token:</strong> {p.token_from} <br />
                <strong>Mint:</strong> {p.mint} <br />
                <strong>Amount:</strong> {p.amount} <br />
                <strong>Chain:</strong> {p.chain}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-green-400 mb-2">
          ✅ Completed Refunds ({refunded.length})
        </h3>
        {refunded.length === 0 ? (
          <p className="text-gray-400">No completed refunds yet 💤</p>
        ) : (
          chains.map(chain => {
            const byChain = refunded.filter(p => p.chain === chain);
            if (byChain.length === 0) return null;

            return (
              <div key={chain} className="mb-6">
                <h4 className="text-lg font-bold text-blue-300 mb-2">{chain.charAt(0).toUpperCase() + chain.slice(1)}</h4>
                <ul className="space-y-3">
                  {byChain.map(p => (
                    <li key={p.id} className="bg-gray-800 p-4 rounded relative">
                      <div><span className="font-semibold">🪪 Wallet:</span> {p.wallet_address}</div>
                      <div><span className="font-semibold">🌐 Token:</span> {p.token_from}</div>
                      <div><span className="font-semibold">🔗 Mint:</span> {p.mint}</div>
                      <div><span className="font-semibold">💰 Amount:</span> {p.amount}</div>
                      <div><span className="font-semibold">🌍 Chain:</span> {p.chain}</div>
                      <span className="absolute right-4 top-4 text-green-400 font-bold">✅ Refunded</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
