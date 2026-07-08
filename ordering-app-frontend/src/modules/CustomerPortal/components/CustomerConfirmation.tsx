import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { Check, Clock, MapPin, Phone, RefreshCw, ShoppingBag, Map, BellRing, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { orderService, OrderDetailsResponse } from '@/shared/api/order.service';
import { formatCurrency } from '@/shared/lib/utils';

export default function CustomerConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { clearCart } = useAppState();
  const [notificationActive, setNotificationActive] = useState(true);
  const [eta, setEta] = useState(25);
  const [mapZoomed, setMapZoomed] = useState(false);

  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear cart upon arriving at confirmation to reset buyer context
  useEffect(() => {
    clearCart();
  }, []);

  // Fetch order details & setup polling
  useEffect(() => {
    if (!orderId) {
      setError('Missing order identifier in query parameters.');
      setLoading(false);
      return;
    }

    const fetchOrder = async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        const data = await orderService.getOrderDetails(orderId);
        setOrder(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        if (!isSilent) setError('Could not load order tracking details.');
      } finally {
        if (!isSilent) setLoading(false);
      }
    };

    fetchOrder();

    // Poll every 3 seconds for live status & courier GPS movement
    const interval = setInterval(() => {
      const activeStatuses = ['pending_payment', 'placed', 'accepted', 'preparing', 'ready', 'picked'];
      // Only keep polling if the order status is active
      if (order && !activeStatuses.includes(order.status)) {
        clearInterval(interval);
        return;
      }
      fetchOrder(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] gap-4">
        <RefreshCw className="w-8 h-8 text-[#b3360c] animate-spin" />
        <p className="text-xs font-bold tracking-wider uppercase text-gray-500 font-mono">Connecting to live tracker...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] p-6 text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-150 text-red-700 flex items-center justify-center font-bold text-lg">⚠️</div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Tracker Unavailable</h2>
        <p className="text-gray-500 text-xs max-w-sm leading-relaxed">{error || 'The requested order details could not be found.'}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#b3360c] hover:bg-[#942a08] transition text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  // Calculate SVG rider coordinates based on mock GPS coordinates
  // Kitchen starts at (100, 80), Home (Destination) is at (380, 250)
  const getRiderCoords = () => {
    if (!order.delivery || !order.delivery.agent) {
      return { x: 100, y: 80 }; // Default to kitchen
    }
    const agent = order.delivery.agent;
    const restaurantLat = 30.0544;
    const restaurantLng = 31.2257;
    const customerLat = 30.0444;
    const customerLng = 31.2357;

    const totalLatDiff = customerLat - restaurantLat;
    const totalLngDiff = customerLng - restaurantLng;

    const currentLatDiff = agent.lastLat - restaurantLat;
    const currentLngDiff = agent.lastLng - restaurantLng;

    const latProgress = totalLatDiff !== 0 ? (currentLatDiff / totalLatDiff) : 0.5;
    const lngProgress = totalLngDiff !== 0 ? (currentLngDiff / totalLngDiff) : 0.5;
    const progress = Math.min(Math.max((latProgress + lngProgress) / 2, 0), 1);

    const startX = 100;
    const startY = 80;
    const endX = 380;
    const endY = 250;

    return {
      x: startX + (endX - startX) * progress,
      y: startY + (endY - startY) * progress
    };
  };

  const riderCoords = getRiderCoords();

  const getStepStatusClass = (step: string) => {
    const s = order.status.toLowerCase();
    
    if (step === 'pending_payment') {
      return s === 'pending_payment' ? 'text-orange-600 font-bold border-orange-500 bg-orange-50' : 'text-gray-400 border-gray-200';
    }
    
    const stepsOrder = ['placed', 'accepted', 'preparing', 'ready', 'delivered'];
    const currentIndex = stepsOrder.indexOf(s);
    const stepIndex = stepsOrder.indexOf(step);

    if (s === 'pending_payment') {
      return 'text-gray-300 border-gray-100';
    }

    if (s === 'cancelled' || s === 'rejected') {
      return 'text-red-300 border-red-100';
    }

    if (stepIndex < currentIndex) {
      return 'text-[#b3360c] font-semibold border-[#b3360c] bg-orange-50/20'; // Completed
    } else if (stepIndex === currentIndex) {
      return 'text-[#b3360c] font-black border-[#b3360c] bg-[#b3360c] text-white animate-pulse scale-105'; // Active
    } else {
      return 'text-gray-400 border-gray-200'; // Upcoming
    }
  };

  return (
    <div id="customer-confirmation-view" className="max-w-6xl mx-auto py-10 px-4 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Order Confirmed details */}
        <div className="lg:col-span-6 space-y-8 text-left">
          {/* Big success check bubble */}
          <div className="w-16 h-16 rounded-full bg-[#b3360c] text-white flex items-center justify-center shadow-xl shadow-red-900/15">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-[#b3360c] tracking-tight">
              {order.status === 'pending_payment' ? 'Order Processing' : 'Order Confirmed'}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md font-medium">
              {order.status === 'pending_payment' 
                ? 'Your order is currently awaiting checkout clearance via our secure online gateway.'
                : 'Your delicious meal has been registered and is progressing through preparation at our kitchen.'}
            </p>
          </div>

          {/* KPI metrics row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">ORDER ID</span>
              <span className="text-sm font-black text-gray-900 block mt-1.5 font-mono truncate">{order.publicId.slice(0, 8)}...</span>
            </div>

            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">ESTIMATED ARRIVAL</span>
              <div className="flex items-center gap-2 mt-1.5">
                <Clock className="w-4 h-4 text-[#b3360c]" />
                <span className="text-xl font-black text-gray-900">{eta - 3}-{eta + 7} min</span>
              </div>
            </div>
          </div>

          {/* Timeline tracker */}
          <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Preparation Journey</h3>
            
            <div className="relative flex justify-between items-center px-2">
              <div className="absolute h-0.5 left-8 right-8 bg-gray-100 top-4 -z-10" />
              
              {order.status === 'pending_payment' ? (
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getStepStatusClass('pending_payment')}`}>
                    💳
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Pay</span>
                </div>
              ) : null}

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getStepStatusClass('placed')}`}>
                  📋
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Placed</span>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getStepStatusClass('accepted')}`}>
                  👨‍🍳
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Accepted</span>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getStepStatusClass('preparing')}`}>
                  🍳
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Kitchen</span>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getStepStatusClass('ready')}`}>
                  📦
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Ready</span>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getStepStatusClass('delivered')}`}>
                  🏠
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Arrived</span>
              </div>
            </div>
          </div>

          {/* Items breakdown list */}
          <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Ticket details</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.productId} className="flex justify-between items-center text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#b3360c] bg-orange-50 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(item.lineTotal, order.currency)}</span>
                </div>
              ))}
              <hr className="border-gray-100 my-2" />
              <div className="flex justify-between items-center text-xs font-black text-gray-900">
                <span>Total Amount Paid</span>
                <span className="text-[#b3360c] text-sm">{formatCurrency(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            {order.status === 'pending_payment' && order.payment?.redirectUrl && (
              <button 
                onClick={() => window.location.href = order.payment!.redirectUrl}
                className="bg-[#b3360c] hover:bg-[#942a08] text-white font-bold text-xs px-6 py-4 rounded-2xl transition shadow-lg flex items-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Complete Payment</span>
              </button>
            )}

            <button 
              onClick={() => {
                setMapZoomed(!mapZoomed);
                if (order.delivery?.agent) {
                  alert(mapZoomed ? 'Resetting courier camera feed.' : `Focusing camera tracking on rider: ${order.delivery.agent.name}`);
                }
              }}
              disabled={!order.delivery?.agent}
              className="bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-xs px-6 py-4 rounded-2xl transition shadow-lg flex items-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>Track Courier</span>
            </button>

            <button 
              onClick={() => navigate('/')}
              className="bg-transparent hover:bg-gray-50 text-gray-700 font-bold text-xs px-6 py-4 rounded-2xl transition uppercase tracking-wider cursor-pointer border border-gray-200"
            >
              <span>Back to Browse</span>
            </button>
          </div>
        </div>

        {/* Right Side: Map & Rider Tracker (Image 2 accuracy) */}
        <div className="lg:col-span-6 relative">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-150/80 shadow-2xl relative">
            
            {/* Header info bubble */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#b3360c] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  🍳
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">{order.branch.name}</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Preparing your premium burger order</p>
                </div>
              </div>
              <MapPin className="w-5 h-5 text-[#b3360c]" />
            </div>

            {/* Simulated Vector Grid Map */}
            <div className="h-80 bg-[#e4eff2] relative overflow-hidden select-none flex items-center justify-center">
              
              {/* Map background grid pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#121d21_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
              
              {/* Simulated Map Streets */}
              <svg className="absolute inset-0 w-full h-full text-white/50" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0 50 L 500 50 M 0 150 L 500 150 M 0 250 L 500 250" stroke="white" strokeWidth="6" strokeLinecap="round" />
                <path d="M 100 0 L 100 400 M 250 0 L 250 400 M 380 0 L 380 400" stroke="white" strokeWidth="6" strokeLinecap="round" />
                
                {/* Dashed Red path from Kitchen to Home */}
                <path d="M 100 80 L 250 150 L 380 250" stroke="#b3360c" strokeWidth="3" strokeDasharray="6,4" fill="none" className="animate-pulse" />
              </svg>

              {/* Sausalito text */}
              <span className="absolute top-6 left-12 text-[10px] uppercase font-mono font-bold text-gray-400">Sausalito</span>
              {/* Golden Gate Bridge landmark */}
              <span className="absolute top-16 left-32 text-[10px] uppercase font-mono font-bold text-gray-400">Golden Gate Bridge</span>
              {/* Alcatraz Island */}
              <span className="absolute top-8 right-24 text-[10px] uppercase font-mono font-bold text-gray-400">Alcatraz Island</span>
              {/* Cairo text */}
              <span className="absolute bottom-20 left-1/2 -translate-x-1/2 text-lg font-black tracking-wider uppercase text-gray-300">Maadi District</span>

              {/* Kitchen Marker (Pin 1) */}
              <div className="absolute top-[80px] left-[100px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#121d21] text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                  🍳
                </div>
                <span className="bg-white/90 text-[8px] font-mono font-bold px-1.5 rounded-md shadow mt-1">HUB</span>
              </div>

              {/* Live Courier Rider Marker moving along path */}
              {order.delivery && order.delivery.agent && (
                <motion.div 
                  animate={{ x: riderCoords.x, y: riderCoords.y }}
                  transition={{ type: 'spring', stiffness: 50 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-15 flex flex-col items-center"
                  style={{ left: 0, top: 0 }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#b3360c] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    🚲
                  </div>
                  <span className="bg-[#b3360c] text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow mt-1 uppercase tracking-wide truncate max-w-[80px]">
                    {order.delivery.agent.name.split(' ')[0]}
                  </span>
                </motion.div>
              )}

              {/* Destination Marker (Pin 2) */}
              <div className="absolute top-[250px] left-[380px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                  🏠
                </div>
                <span className="bg-white/90 text-[8px] font-mono font-bold px-1.5 rounded-md shadow mt-1">HOME</span>
              </div>
            </div>

            {/* Courier Card details footer */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white">
              {order.delivery && order.delivery.agent ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100">
                      <img 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" 
                        alt="Courier Rider" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{order.delivery.agent.name}</h4>
                      <p className="text-xs text-gray-400 font-semibold">★ 4.9 • Top Rated Fleet courier</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert(`Dialing secure routing mask number to connect with ${order.delivery?.agent?.name}.`)}
                    className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 flex items-center justify-center cursor-pointer transition border border-blue-100"
                    title="Call Courier Rider"
                  >
                    <Phone className="w-4 h-4 text-blue-900" />
                  </button>
                </>
              ) : (
                <div className="py-2 text-center text-xs text-gray-400 font-semibold w-full">
                  {order.status === 'pending_payment' 
                    ? 'Awaiting checkout clearance before delivery dispatch.'
                    : 'Dispatching fleet agent to pick up your order.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Toast Alert */}
      {notificationActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white border border-gray-150 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#b3360c]/10 text-[#b3360c] flex items-center justify-center flex-shrink-0">
              <BellRing className="w-4.5 h-4.5 text-[#b3360c]" />
            </div>
            <span className="text-xs font-bold text-gray-800">Notification enabled for order updates</span>
            <button 
              onClick={() => setNotificationActive(false)}
              className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest ml-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
