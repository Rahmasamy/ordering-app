import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { paymentService } from '@/shared/api/payment.service';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('Verifying payment signature...');
  const orderId = searchParams.get('merchantOrderId') || searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    // 1. Simulate the successful payment capture in mock database
    paymentService.simulatePaymentSuccess(orderId);

    // 2. Add a short delay to display "verifying security tokens" (simulates webhook latency or signature check)
    const t1 = setTimeout(() => {
      setStatusText('Payment authorized and captured! Redirecting...');
    }, 1500);

    const t2 = setTimeout(() => {
      navigate(`/confirmation?orderId=${orderId}`);
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] p-6 text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white border border-gray-150 p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-6"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 animate-pulse">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Secure Payment Gateway</h2>
          <p className="text-gray-500 text-xs leading-relaxed">
            Verifying your payment credentials with Kashier.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-150 px-4 py-3 rounded-2xl w-full justify-center">
          <Loader2 className="w-4 h-4 text-[#b3360c] animate-spin" />
          <span>{statusText}</span>
        </div>
      </motion.div>
    </div>
  );
}
