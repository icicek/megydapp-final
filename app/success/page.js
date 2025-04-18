import dynamic from 'next/dynamic';

// Client component'i dinamik olarak import ediyoruz
const CoincarnationClient = dynamic(() => import('./CoincarnationClient'), {
  ssr: false,
});

export default function SuccessPage() {
  return <CoincarnationClient />;
}
