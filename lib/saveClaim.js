// ✅ lib/saveClaim.js
import { supabase } from './supabase';

const saveClaim = async ({ walletAddress, targetAddress, amount, solFeeTx, megyClaimTx }) => {
  const { data, error } = await supabase
    .from('claims')
    .insert([
      {
        wallet_address: walletAddress,
        target_address: targetAddress,
        amount,
        sol_fee_tx: solFeeTx,
        megy_claim_tx: megyClaimTx,
        timestamp: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('❌ Claim kayıt hatası:', error.message);
    return { success: false, error };
  }

  console.log('✅ Claim kaydı başarılı:', data);
  return { success: true, data };
};

export default saveClaim;
