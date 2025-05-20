import dynamic from 'next/dynamic';

// HomePage bileşeni dinamik olarak sadece client-side'da yüklenecek
const HomePage = dynamic(() => import('@/components/HomePage'), { ssr: false });

export default function Page() {
  return <HomePage />;
}
