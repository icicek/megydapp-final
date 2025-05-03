'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SupabaseTestPage() {
  useEffect(() => {
    const supabase = createClient(
      'https://waylfrbnanfsubpxiiyg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheWxmcmJuYW5mc3VicHhpaXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNjgxMjIsImV4cCI6MjA2MTg0NDEyMn0.ori31QzgK_aZqxeYbfJQuLjafEvZcoYI4m78IW6pPxg'
    );

    const testInsert = async () => {
      console.log('🔥 testInsert() started');
      const { data, error } = await supabase.from('claims_test').insert([
        {
          wallet_address: 'TestWallet123',
          claim_address: 'ClaimWalletXYZ456',
          amount: 789.42,
          claimed_at: new Date().toISOString(),
        },
      ]);

      console.log('✅ Data:', data);
      console.log('❌ Error:', error);
    };

    testInsert();
  }, []);

  return (
    <div className="p-4 text-lg">
      🧪 Supabase Insert Test is running... Check console!
    </div>
  );
}
