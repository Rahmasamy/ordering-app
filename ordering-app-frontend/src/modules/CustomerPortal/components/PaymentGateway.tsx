import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { paymentService } from '@/shared/api/payment.service';
import { orderService } from '@/shared/api/order.service';

export default function PaymentGateway() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Order Details
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState('EGP');

  useEffect(() => {
    if (!orderId) {
      setError('Invalid order ID.');
      setLoading(false);
      return;
    }

    // Load order details to show the amount to pay
    const loadDetails = async () => {
      try {
        const order = await orderService.getOrderDetails(orderId);
        setAmount(order.total);
        setCurrency(order.currency || 'EGP');
        setLoading(false);
      } catch (err) {
        console.error('Failed to load order details for payment:', err);
        setError('Could not retrieve order details for payment.');
        setLoading(false);
      }
    };

    loadDetails();
  }, [orderId]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces every 4 digits
    const val = e.target.value.replace(/\D/g, '');
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format MM/YY
    const val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      setExpiry(`${val.substring(0, 2)}/${val.substring(2, 4)}`);
    } else {
      setExpiry(val);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !expiry || cvv.length < 3) {
      alert('Please fill out all payment details.');
      return;
    }

    setProcessing(true);

    // Simulate network delay
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      // Redirect to Return URL after authorization completes
      setTimeout(() => {
        navigate(`/checkout/return?merchantOrderId=${orderId}&paymentStatus=SUCCESS`);
      }, 2000);
    }, 2500);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel the payment?')) {
      navigate(`/checkout/failed?merchantOrderId=${orderId}&paymentStatus=FAILED`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d161a] text-white gap-4">
        <RefreshCw className="w-10 h-10 text-[#b3360c] animate-spin" />
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Connecting to Secure Payment Gateway...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d161a] text-white p-6 text-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Secure Gateway Error</h2>
        <p className="text-gray-400 text-xs max-w-sm">{error}</p>
        <button 
          onClick={() => navigate('/checkout')}
          className="bg-[#b3360c] hover:bg-[#942a08] transition text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
        >
          Return to Checkout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d161a] text-white py-12 px-4 flex flex-col justify-center items-center">
      {/* Top logo & status */}
      <div className="flex items-center gap-2 mb-8">
        <span className="w-6 h-6 rounded-lg bg-[#b3360c] text-white flex items-center justify-center font-bold text-xs">K</span>
        <span className="text-sm font-extrabold tracking-widest text-gray-300 uppercase">Kashier Secure Checkout</span>
      </div>

      <div className="w-full max-w-md bg-[#131e24] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl relative">
        <AnimatePresence mode="wait">
          {processing ? (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center min-h-[420px] flex flex-col justify-center items-center gap-6"
            >
              <div className="w-16 h-16 rounded-full border-4 border-[#b3360c]/20 border-t-[#b3360c] animate-spin flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Authorizing Transaction</h3>
                <p className="text-gray-500 text-xs mt-2 max-w-xs leading-relaxed">
                  Verifying card credentials with the issuing bank. Please do not close this window or click back.
                </p>
              </div>
            </motion.div>
          ) : success ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 text-center min-h-[420px] flex flex-col justify-center items-center gap-6"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-400">Payment Captured</h3>
                <p className="text-gray-400 text-xs mt-2">
                  Transaction succeeded! Redirecting you back to OrderFlow...
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 space-y-6"
            >
              {/* Payment Summary Box */}
              <div className="bg-[#19262d] border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Amount</span>
                  <span className="text-2xl font-black tracking-tight text-white mt-1 block">
                    {amount.toFixed(2)} <span className="text-sm font-bold text-gray-400">{currency}</span>
                  </span>
                </div>
                <div className="bg-[#121d21] border border-gray-800 p-2.5 rounded-xl text-right">
                  <span className="text-[9px] font-mono text-gray-400 block uppercase">Order Reference</span>
                  <span className="text-xs font-mono font-bold text-gray-300 truncate max-w-[120px] block mt-0.5">{orderId?.slice(0, 8)}...</span>
                </div>
              </div>

              {/* Card Inputs */}
              <form onSubmit={handlePay} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cardholder Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-[#1c2930] border border-gray-800 focus:border-[#b3360c] outline-none rounded-xl px-4 py-3 text-xs transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-[#1c2930] border border-gray-800 focus:border-[#b3360c] outline-none rounded-xl pl-4 pr-10 py-3 text-xs transition font-mono"
                    />
                    <CreditCard className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Expiration</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full bg-[#1c2930] border border-gray-800 focus:border-[#b3360c] outline-none rounded-xl px-4 py-3 text-xs transition font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">CVV</label>
                    <input 
                      type="password" 
                      placeholder="***"
                      maxLength={3}
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#1c2930] border border-gray-800 focus:border-[#b3360c] outline-none rounded-xl px-4 py-3 text-xs transition font-mono"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#b3360c] hover:bg-[#942a08] transition text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-6"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize Payment</span>
                </button>
              </form>

              {/* Cancel link */}
              <button 
                type="button"
                onClick={handleCancel}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-red-400 transition uppercase tracking-wider pt-2"
              >
                Cancel Transaction
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer secure tags */}
      <div className="flex items-center gap-4 mt-8 text-gray-600 text-[10px] font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>PCI-DSS Compliant</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}
