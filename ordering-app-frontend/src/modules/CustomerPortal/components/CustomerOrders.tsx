import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Clock, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { orderService, OrderSummaryResponse } from '@/shared/api/order.service';
import { formatCurrency } from '@/shared/lib/utils';

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getCustomerOrders();
      setOrders(res.data);
    } catch (err: any) {
      console.error('Failed to load customer orders:', err);
      setError(err.message || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let classes = 'bg-gray-100 text-gray-700 border-gray-200';
    
    if (s === 'pending_payment') classes = 'bg-orange-50 text-orange-700 border-orange-100';
    else if (s === 'placed') classes = 'bg-blue-50 text-blue-700 border-blue-100';
    else if (s === 'accepted') classes = 'bg-indigo-50 text-indigo-700 border-indigo-100';
    else if (s === 'preparing') classes = 'bg-yellow-50 text-yellow-700 border-yellow-100';
    else if (s === 'ready') classes = 'bg-teal-50 text-teal-700 border-teal-100';
    else if (s === 'cancelled' || s === 'rejected') classes = 'bg-red-50 text-red-700 border-red-100';
    
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${classes}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfbfc] gap-4">
        <RefreshCw className="w-8 h-8 text-[#b3360c] animate-spin" />
        <p className="text-xs font-bold tracking-wider uppercase text-gray-500">Loading Order History...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 min-h-screen">
      <div className="flex items-center justify-between border-b border-gray-150 pb-6 mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">View details and track all your incoming meals.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="p-2 px-4 border border-gray-200 hover:border-gray-300 rounded-xl transition text-xs font-bold text-gray-650 flex items-center gap-1.5 cursor-pointer bg-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh list
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs text-gray-900">Failed to Load Orders</h4>
            <p className="text-[11px] text-red-500 mt-0.5 leading-normal">{error}</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-150/80 shadow-xs">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No Orders Yet</h3>
          <p className="text-gray-500 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
            You haven't placed any orders on OrderFlow yet. Hungry? Start browsing our chef specials!
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 bg-[#b3360c] hover:bg-[#942a08] transition text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order.publicId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/confirmation?orderId=${order.publicId}`)}
              className="bg-white border border-gray-150/80 hover:border-gray-300 rounded-[24px] p-5 md:p-6 transition shadow-xs hover:shadow-md cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-orange-50 text-[#b3360c] rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg border border-orange-100/40">
                  🍳
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-gray-900 leading-tight group-hover:text-[#b3360c] transition truncate">
                      {order.restaurant.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">#{order.publicId.slice(0, 8)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 font-medium flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {order.branchId === 12 ? "Maadi Branch" : "Downtown Core"}
                    </span>
                    <span>•</span>
                    <span>{order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t border-gray-50 md:border-t-0 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">Total paid</span>
                  <span className="text-lg font-black text-gray-955 tracking-tight mt-0.5 block">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#b3360c] transition group-hover:translate-x-1 duration-200" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
