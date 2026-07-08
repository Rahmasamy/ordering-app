import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Check, ArrowLeft } from 'lucide-react';
import { useOffers } from '@/shared/hooks/useOffers';
import type { OfferResponse } from '@/shared/api/offers.service';

function formatExpiryDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CustomerOffers() {
  const navigate = useNavigate();
  const { offers, isLoading, error, refetch, getRestaurantName } = useOffers();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-[#b3360c]/20 border-t-[#b3360c] rounded-full animate-spin" />
        <p className="text-gray-500 text-xs font-bold tracking-wider uppercase">Loading promotions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <p className="text-red-500 text-sm font-medium">{error}</p>
        <button
          onClick={refetch}
          className="bg-[#b3360c] hover:bg-[#942a08] text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div id="customer-offers-view" className="max-w-6xl mx-auto py-6 px-4 space-y-10 min-h-screen">
      <div className="pb-4 border-b border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </button>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exclusive Promotions</h1>
          <p className="text-gray-500 text-xs mt-1 font-semibold leading-relaxed">
            Satisfy your cravings with these handpicked hot deals from top kitchen creators.
          </p>
        </div>

        <div className="bg-[#fff2ee] text-[#b3360c] text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full border border-red-50/50 flex items-center gap-1.5 shrink-0 self-start">
          <Sparkles className="w-4 h-4 animate-spin text-orange-500" />
          <span>{offers.length} active promo{offers.length !== 1 ? 's' : ''} available</span>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">No active promotions right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer: OfferResponse) => (
            <div
              key={offer.id}
              className="bg-white border border-gray-150 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-4 left-4 bg-orange-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-md">
                  {offer.badgeText}
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow">
                  {getRestaurantName(offer.restaurantId)}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-snug">{offer.title}</h3>
                  <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">{offer.description}</p>
                </div>

                <hr className="border-gray-50" />

                <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
                  <div className="text-xs">
                    <span className="text-gray-400 font-semibold block uppercase text-[9px] tracking-wider">EXPIRY DATE</span>
                    <span className="font-extrabold text-gray-900 block mt-0.5">{formatExpiryDate(offer.expiresAt)}</span>
                  </div>

                  <div className="flex bg-gray-50 border border-gray-150 p-1 rounded-xl">
                    <span className="px-3.5 py-2 font-mono text-xs font-black text-gray-900 uppercase bg-white border border-gray-100 rounded-lg shadow-xs tracking-wider select-all">
                      {offer.promoCode}
                    </span>

                    <button
                      onClick={() => handleCopyCode(offer.id, offer.promoCode)}
                      className="p-2.5 hover:bg-gray-150 text-gray-500 hover:text-gray-900 rounded-lg transition shrink-0 cursor-pointer"
                      title="Copy promo code"
                    >
                      {copiedId === offer.id ? <Check className="w-4 h-4 text-green-600 stroke-[3]" /> : <Copy className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#121d21] text-white p-8 rounded-[32px] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="bg-[#c23e11] text-white uppercase text-[9px] tracking-widest font-extrabold px-2.5 py-0.5 rounded-full inline-block">
            REWARDS
          </span>
          <h3 className="text-xl md:text-2xl font-black">Get $20 for every friend you invite</h3>
          <p className="text-gray-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Invite your colleagues and family to order premium gourmet meals. Once they place their first order, $20 credit is loaded instantly onto your digital wallet.
          </p>
        </div>

        <button
          onClick={() => alert('Referral link copied to clipboard!')}
          className="bg-white text-gray-950 font-extrabold text-xs px-6 py-4 rounded-xl transition hover:bg-gray-100 shrink-0 self-start md:self-auto cursor-pointer uppercase tracking-wider"
        >
          Invite Foodies
        </button>
      </div>
    </div>
  );
}
