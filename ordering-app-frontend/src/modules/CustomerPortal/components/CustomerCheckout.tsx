import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { formatCurrency } from '@/shared/lib/utils';
import { ShieldCheck, MapPin, CreditCard, ChevronRight, CheckCircle, ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '@/shared/hooks/useCart';

import { orderService } from '@/shared/api/order.service';
import api from '@/shared/api/api-client';

export default function CustomerCheckout() {
  const navigate = useNavigate();
  const { cart, clearCart, addActivityLog } = useAppState();
  const [address, setAddress] = useState({ street: '', city: '', phone: '' });
  const [selectedPayment, setSelectedPayment] = useState<'kashier' | 'cash_on_delivery'>('cash_on_delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { fetchCart, clearCart: clearBackendCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = 2.99;
  const taxes = Number((cartTotal * 0.08).toFixed(2));
  const total = Number((cartTotal + deliveryFee + taxes).toFixed(2));

  const handlePlaceOrder = async () => {
    if (!address.street.trim() || !address.city.trim() || !address.phone.trim()) {
      alert('Please fill out all address and contact details.');
      return;
    }

    try {
      setLoading(true);
      const items = cart.map((item) => ({
        productId: parseInt(item.product.id) || 101,
        quantity: item.quantity,
      }));

      const firstItem = cart[0];
      const restaurantId = firstItem ? (firstItem.product as any).restaurantId : null;
      if (!restaurantId) {
        alert("No items in cart.");
        return;
      }

      // Fetch the customer's addresses
      const addressRes = await api.get(`/customer/addresses`);
      let addresses = addressRes.data?.data || [];
      let selectedAddr = addresses[0];

      if (!selectedAddr) {
        // Create an address dynamically first
        const createAddrRes = await api.post(`/customer/addresses`, {
          label: 'Default Address',
          country: 'Egypt',
          city: address.city || 'Cairo',
          street: address.street || 'Default Street',
          type: 'home',
          lat: 30.0444,
          lng: 31.2357,
          isDefault: true
        });
        selectedAddr = createAddrRes.data?.data?.address;
        if (selectedAddr) {
          addresses = [selectedAddr];
        }
      }

      let branchId = Number(restaurantId); // default fallback

      if (selectedAddr) {
        // Fetch nearby active branches using the coring service endpoint
        const branchRes = await api.get(`/branches/nearby`, {
          params: {
            lat: selectedAddr.lat || selectedAddr.latitude,
            lng: selectedAddr.lng || selectedAddr.longitude
          }
        });
        const nearbyBranches = branchRes.data?.data || [];

        // Filter branches that belong to this restaurant
        const restaurantBranches = nearbyBranches.filter((b: any) => Number(b.restaurantId) === Number(restaurantId));

        if (restaurantBranches.length > 0) {
          branchId = Number(restaurantBranches[0].id);
        } else {
          // If none are in delivery range, try fetching all branches of this restaurant as fallback
          const fallbackRes = await api.get(`/restaurants/${restaurantId}/branches`);
          const fallbackBranches = fallbackRes.data?.data || [];
          if (fallbackBranches.length > 0) {
            branchId = Number(fallbackBranches[0].id);
          }
        }
      }

      const payload = {
        branchId,
        customerAddressId: selectedAddr ? Number(selectedAddr.id) : 45,
        paymentMethod: selectedPayment === 'kashier' ? 'online' as const : 'cod' as const,
        items,
      };

      const res = await orderService.placeOrder(payload);

      // Add transaction status alert log for merchants
      addActivityLog(
        'System Ingest',
        `Placed customer order with secure token - Total ${formatCurrency(total)}`,
        'status',
        `Fulfillment: Delivery to ${address.street}, ${address.city}. Notes: "${orderNotes || 'None'}"`
      );

      // Clear basket context
      clearCart();
      localStorage.removeItem('cart');
      localStorage.removeItem('orderflow_cart');
      try {
        await clearBackendCart();
      } catch (e) {
        console.warn('Failed to clear backend cart during checkout:', e);
      }

      if (payload.paymentMethod === 'online' && res.payment?.redirectUrl) {
        // Redirect to the online payment session redirectUrl
        window.location.href = res.payment.redirectUrl;
      } else {
        // Direct to placement confirmation tracker
        navigate(`/confirmation?orderId=${res.publicId}`);
      }
    } catch (err: any) {
      console.error('Failed to place order:', err);
      alert(`Could not place order: ${err.message || 'Please check your connection.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="customer-checkout-container" className="max-w-6xl mx-auto py-4 px-2 min-h-screen">
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-6 mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-xl font-black text-gray-900 tracking-tight italic">OrderFlow</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-bold tracking-wider uppercase text-gray-400">
          <div className="flex items-center gap-2 text-[#b3360c]">
            <span className="w-5 h-5 rounded-full bg-[#b3360c] text-white flex items-center justify-center text-[10px]">1</span>
            <span>Delivery</span>
          </div>
          <span className="h-px w-8 bg-gray-200" />
          <div className="flex items-center gap-2 text-gray-700">
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px]">2</span>
            <span>Payment</span>
          </div>
          <span className="h-px w-8 bg-gray-200" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px]">3</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Form Fields */}
        <div className="lg:col-span-8 space-y-8">
          {/* Address Section */}
          <section id="address-section" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Delivery Address</h2>
            </div>
            
            <div className="bg-gray-50 border border-gray-150 p-5 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Street Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123 Main St, Apt 4B"
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b3360c] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">City</label>
                  <input 
                    type="text" 
                    placeholder="e.g. San Francisco"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b3360c] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +1 234 567 8900"
                    value={address.phone}
                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b3360c] transition"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method Section */}
          <section id="payment-section" className="space-y-4">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Payment Method</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cash on Delivery */}
              <div 
                onClick={() => setSelectedPayment('cash_on_delivery')}
                className={`p-5 rounded-2xl border-2 flex items-center gap-3.5 cursor-pointer transition relative ${
                  selectedPayment === 'cash_on_delivery' 
                    ? 'border-[#b3360c] bg-orange-50/10' 
                    : 'border-gray-150 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Cash on Delivery</h4>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">Pay when you receive</p>
                </div>
                {selectedPayment === 'cash_on_delivery' && (
                  <div className="absolute top-4 right-4 text-[#b3360c]">
                    <CheckCircle className="w-5 h-5 fill-[#b3360c] text-white" />
                  </div>
                )}
              </div>

              {/* Kashier */}
              <div 
                onClick={() => setSelectedPayment('kashier')}
                className={`p-5 rounded-2xl border-2 flex items-center gap-3.5 cursor-pointer transition relative ${
                  selectedPayment === 'kashier' 
                    ? 'border-[#b3360c] bg-orange-50/10' 
                    : 'border-gray-150 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Kashier</h4>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">Secure online payment</p>
                </div>
                {selectedPayment === 'kashier' && (
                  <div className="absolute top-4 right-4 text-[#b3360c]">
                    <CheckCircle className="w-5 h-5 fill-[#b3360c] text-white" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Order Notes Section */}
          <section id="notes-section" className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Order Notes</h2>
            <textarea 
              placeholder="e.g. Please leave the package at the front desk..." 
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#b3360c] min-h-[100px] shadow-xs"
            />
          </section>

          {/* Safety disclaimer banner */}
          <div className="bg-[#f0f4ff] border border-blue-100 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">Safety First</h4>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">Your payment and personal data are encrypted with bank-level security. We never share your details.</p>
            </div>
          </div>
        </div>

        {/* Right Side Sticky Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-[28px] shadow-xs space-y-6">
            <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Order Summary</h3>

            {/* Cart products breakdown */}
            <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3.5 text-xs">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate leading-tight">{item.product.name}</h4>
                    <p className="text-gray-400 font-medium mt-0.5">
                      x{item.quantity} • {item.selectedDoneness || 'Medium'}
                    </p>
                    {item.selectedAddons.length > 0 && (
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        +{item.selectedAddons.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-extrabold text-gray-900 flex-shrink-0">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
              
              {cart.length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400">
                  No items in checkout basket.
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Delivery Fee</span>
                <span className="text-gray-900 font-bold">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Taxes</span>
                <span className="text-gray-900 font-bold">{formatCurrency(taxes)}</span>
              </div>
              <hr className="border-gray-50 pt-1" />
              <div className="flex justify-between text-sm text-gray-900 font-black">
                <span>Total</span>
                <span className="text-[#b3360c] text-base">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || loading}
              className="w-full bg-[#b3360c] hover:bg-[#942a08] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider mt-4"
            >
              <span>{loading ? 'Placing Order...' : 'Place Order'}</span>
              <ChevronRight className="w-4.5 h-4.5" />
            </button>

            <div className="text-[10px] uppercase font-mono tracking-widest text-center text-gray-400 font-bold mt-2.5">
              Secure Checkout
            </div>
          </div>

          {/* Slate Promo Banner block inside Screen 3 */}
          <div className="bg-[#1e2d3d] text-white p-5 rounded-2xl relative overflow-hidden">
            <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400 font-black block">PROMO APPLIED</span>
            <h4 className="font-extrabold text-xs mt-1.5">Free Delivery on your next 3 orders!</h4>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Valid until Nov 15th</p>
          </div>
        </div>
      </div>
    </div>
  );
}
