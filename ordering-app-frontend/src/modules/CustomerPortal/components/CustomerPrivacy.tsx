import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle } from 'lucide-react';

export default function CustomerPrivacy() {
  const navigate = useNavigate();

  return (
    <div id="customer-privacy-view" className="max-w-4xl mx-auto py-6 px-4 space-y-10 min-h-screen">
      
      {/* Header */}
      <div className="pb-4 border-b border-gray-150">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 text-xs mt-1 font-semibold">Last Updated: June 23, 2026</p>
      </div>

      {/* Main text content (Beautiful typography) */}
      <div className="bg-white border border-gray-150 p-8 rounded-3xl shadow-xs space-y-8 text-gray-700 leading-relaxed text-sm">
        
        {/* Intro block */}
        <div className="flex gap-4 items-start pb-6 border-b border-gray-50">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#b3360c] shrink-0 shadow-sm">
            <Shield className="w-6 h-6 text-[#b3360c]" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">Your privacy is our priority</h3>
            <p className="text-xs text-gray-500 mt-1 leading-normal">
              OrderFlow Pro Technologies Inc. is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your security rights.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="font-black text-gray-900 text-base tracking-tight uppercase font-mono text-xs">1. Information We Collect</h3>
          <p className="font-medium text-gray-500">
            We collect information you provide directly to us when creating a customer or partner account, scheduling food delivery, or communicating with us. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-2.5 font-medium text-gray-500">
            <li>Account identifiers: Name, business email, password, profile photo.</li>
            <li>Fulfillment parameters: Delivery address, location pins, customer notes.</li>
            <li>Billing tokens: Secure credit card information (masked ended in 4242).</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h3 className="font-black text-gray-900 text-base tracking-tight uppercase font-mono text-xs">2. How We Use Your Data</h3>
          <p className="font-medium text-gray-500">
            OrderFlow utilizes compiled database records to streamline our delivery networks and optimize merchant kitchen operations:
          </p>
          <ul className="list-disc pl-5 space-y-2.5 font-medium text-gray-500">
            <li>Process transactions securely and routing to correct kitchen hubs.</li>
            <li>Live location map tracking for riders and estimated arrival countdowns.</li>
            <li>Generate analytical predictions for merchant inventory capacity control.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="font-black text-gray-900 text-base tracking-tight uppercase font-mono text-xs">3. Security & Safety</h3>
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-3 text-emerald-800">
            <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-xs">Bank-Level Encryption Protocol</h4>
              <p className="text-xs text-emerald-700 leading-normal mt-1">
                Your payment and password credentials are fully hashed and encrypted using industry standard protocols. We never share your transaction logs or data details with unauthorized third parties.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h3 className="font-black text-gray-900 text-base tracking-tight uppercase font-mono text-xs">4. Cookies and Preferences</h3>
          <p className="font-medium text-gray-500">
            We use standard local storage browser caches to keep your cart basket contents saved between active browser sessions. You may clear your cache settings at any time in your device browser properties.
          </p>
        </section>

      </div>

    </div>
  );
}
