'use client';

import React from 'react';

export default function CoincarnationResult({ tokenFrom, number, imageUrl }) {
  const shareText = `🚀 I just swapped my $${tokenFrom} for $MEGY. Coincarnator #${number} reporting in.

🌐 We're uniting deadcoins to rescue billions.

🔗 Join us 👉 coincarnation.com

#Coincarnation`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="text-center mt-10">
      {/* 🎉 Tebrik Mesajı */}
      <h2 className="text-2xl font-bold text-green-400 mb-4">
        🎉 Congrats! You’ve Coincarnated ${tokenFrom} → $MEGY
      </h2>

      {/* 🚀 Görsel */}
      <img
        src={imageUrl}
        alt="Coincarnated"
        className="mx-auto rounded-xl shadow-xl w-[600px]"
      />

      {/* 📣 Paylaşım Metni */}
      <p className="text-lg font-medium text-white mt-6 whitespace-pre-line">
        {shareText}
      </p>

      {/* 🐦 Paylaşım Butonu */}
      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Share on Twitter 🚀
      </a>
    </div>
  );
}
