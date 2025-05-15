'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import CoincarneForm from '@/components/CoincarneForm';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from '@solana/spl-token';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Home() {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const walletAddress = publicKey?.toBase58();
  const [stats, setStats] = useState({ participantCount: 0, totalUsdValue: 0, latest: null });
  const [endDate, setEndDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [swapAnimationData, setSwapAnimationData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ token: '', amount: 0 });
  const [selectedAmount, setSelectedAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});

  const COINCARNATION_DESTINATION = 'HPBNVF9ATsnkDhGmQB4xoLC5tWBWQbTyBjsiQAN3dYXH';

  useEffect(() => {
    fetch('/animations/looping-swap.json')
      .then(res => res.json())
      .then(data => setSwapAnimationData(data))
      .catch(err => console.error("Lottie animation fetch error:", err));
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/coincarnation/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Stats fetch failed', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchEndDate = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setEndDate(new Date(data.endDate));
      } catch (err) {
        console.error("Couldn't fetch end date", err);
      }
    };
    fetchEndDate();
  }, []);

  useEffect(() => {
    if (!endDate) return;
    const updateTimer = () => {
      const now = new Date();
      const distance = endDate - now;
      if (distance <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json");
        const data = await res.json();
        const metadataMap = {};
        data.tokens.forEach((token) => {
          metadataMap[token.address] = {
            symbol: token.symbol,
            name: token.name,
            logoURI: token.logoURI,
            decimals: token.decimals,
          };
        });
        metadataMap['SOL'] = {
          symbol: 'SOL',
          name: 'Solana',
          logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
          decimals: 9,
        };
        setTokenMetadata(metadataMap);
      } catch (err) {
        console.error("Token metadata fetch error:", err);
      }
    };
    fetchTokenList();
  }, []);

  const metaName = (mint) => {
    if (mint === 'SOL') return 'SOL';
    const meta = tokenMetadata[mint];
    return meta?.symbol || meta?.name || mint?.slice(0, 4) + '...' + mint?.slice(-4);
  };

  const handleTokenSelect = (token, amount) => {
    setModalData({ token, amount });
    setSelectedAmount('');
    setConfirmed(false);
    setModalOpen(true);
  };

  const handleCoincarnation = async () => {
    try {
      if (!wallet || !wallet.publicKey || !modalData.token || !selectedAmount) {
        alert("Missing wallet connection or data.");
        return;
      }

      const amount = parseFloat(selectedAmount);
      if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount.");
        return;
      }

      const transaction = new Transaction();

      if (modalData.token === 'SOL') {
        const lamports = Math.floor(amount * 1e9);
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(COINCARNATION_DESTINATION),
            lamports,
          })
        );
      } else {
        const mintEntry = Object.entries(tokenMetadata).find(
          ([, value]) => value.symbol === modalData.token
        );
        if (!mintEntry) throw new Error("Token mint not found.");
        const [mintAddress, metadata] = mintEntry;

        const sourceTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(mintAddress),
          wallet.publicKey
        );
        const destinationTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(mintAddress),
          new PublicKey(COINCARNATION_DESTINATION)
        );

        const decimals = metadata.decimals || 6;

        transaction.add(
          createTransferInstruction(
            sourceTokenAccount,
            destinationTokenAccount,
            wallet.publicKey,
            Math.floor(amount * 10 ** decimals)
          )
        );
      }

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      console.log("✅ Coincarnation successful:", signature);
      setConfirmed(true);
    } catch (err) {
      console.error("❌ Coincarnation failed:", err);
      alert("Transaction failed: " + err.message);
    }
  };

  // ... JSX kısmı değişmedi
}
