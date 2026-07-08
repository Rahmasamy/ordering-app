import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('merchantOrderId') || searchParams.get('orderId');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] p-6 text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white border border-gray-150 p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-6"
      >
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-650 flex items-center justify-center border border-red-100">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Payment Declined</h2>
          <p className="text-gray-500 text-xs leading-relaxed">
            The transaction was cancelled or declined by your bank. Your basket has been preserved so you can try again.
          </p>
        </div>

        {orderId && (
          <div className="bg-gray-50 border border-gray-150 p-3 rounded-xl text-center w-full">
            <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400">Order Reference</span>
            <span className="text-xs font-mono font-bold text-gray-700 block mt-0.5">{orderId}</span>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#b3360c] hover:bg-[#942a08] transition text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry checkout</span>
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-700 transition uppercase tracking-wider py-2"
          >
            Return to Browse
          </button>
        </div>
      </motion.div>
    </div>
  );
}
