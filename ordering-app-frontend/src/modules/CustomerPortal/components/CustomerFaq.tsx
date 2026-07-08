import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { HelpCircle, ArrowLeft, ChevronDown, ChevronUp, Clock, ShieldAlert, Utensils } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function CustomerFaq() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>('q1');

  const faqs: FaqItem[] = [
    {
      id: 'q1',
      question: 'How fast is the delivery service on OrderFlow?',
      answer: 'Our average delivery time is 25-35 minutes. OrderFlow Pro routing software assigns your order to the nearest available digital kitchen hub and coordinates the fastest courier fleet path to minimize wait times.'
    },
    {
      id: 'q2',
      question: 'What is the "Artisan Kitchen" and where are dishes prepared?',
      answer: 'All dishes featured on OrderFlow are handcrafted by certified premium culinary partners. Meals are cooked with surgical precision in commercial cloud kitchen spaces adhering to peak hygiene standard practices.'
    },
    {
      id: 'q3',
      question: 'How can I apply a promotional offer to my checkout?',
      answer: 'Simply navigate to our "Offers" tab from the header menu, copy the desired promo code (e.g. ARTISAN50), and insert it during checkout to receive automatic discounts and deductions.'
    },
    {
      id: 'q4',
      question: 'Can I cancel or edit my order after placement?',
      answer: 'Once you place an order, it is ingested within 60 seconds by our partner kitchens to guarantee freshness. For safety and speed reasons, cancellations or modifications can only be processed before the cooking cycle initiates.'
    },
    {
      id: 'q5',
      question: 'Are payments secure and which card systems do you support?',
      answer: 'We utilize bank-grade encryption protocols to process all transaction invoices. We accept all major credit cards including Visa, Mastercard, and American Express. Your actual details are fully masked and never exposed.'
    }
  ];

  return (
    <div id="customer-faq-view" className="max-w-4xl mx-auto py-6 px-4 space-y-10 min-h-screen">
      
      {/* Header */}
      <div className="pb-4 border-b border-gray-150">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight font-sans">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-xs mt-1 font-semibold">Everything you need to know about premium gourmet food delivery.</p>
      </div>

      {/* Accordion FAQ Grid */}
      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div 
              key={faq.id}
              className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-sm text-gray-950 focus:outline-none cursor-pointer hover:bg-gray-50"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4.5 h-4.5 text-[#b3360c] shrink-0" />
                  <span>{faq.question}</span>
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
              </button>

              {isOpen && (
                <div className="p-5 pt-0 text-xs text-gray-500 leading-relaxed font-semibold border-t border-gray-50 bg-gray-50/20">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Section card */}
      <div className="bg-[#e4eff2] p-6 rounded-3xl flex items-center gap-4 border border-blue-50">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#b3360c] shrink-0 shadow-xs">
          💬
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-900">Still have questions?</h4>
          <p className="text-gray-500 text-xs mt-0.5">Connect with our live customer support agents available 24 hours a day, 7 days a week.</p>
          <button 
            onClick={() => alert('Live support chat initialized.')}
            className="text-xs font-black text-[#b3360c] uppercase tracking-wider hover:underline mt-2 inline-block block"
          >
            Start Chat Now
          </button>
        </div>
      </div>

    </div>
  );
}
