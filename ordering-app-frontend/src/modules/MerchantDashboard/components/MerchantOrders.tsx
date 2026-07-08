import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Clock, MapPin, Check, X, ChevronRight, Package, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { orderService, OrderDetailsResponse, OrderSummaryResponse } from '@/shared/api/order.service';
import { formatCurrency } from '@/shared/lib/utils';
import { useAuthStore } from '@/shared/store/auth.store';
import { useBranches } from '@/shared/hooks/useBranches';

export default function MerchantOrders() {
  const { user } = useAuthStore();
  const { data: branches = [], isLoading: isLoadingBranches } = useBranches(user?.restaurantId);
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>('');
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsResponse | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);

  const hasNoBranches = branches.length === 0;

  // Initialize selectedBranchId to the first branch (prioritizing active branch if available)
  useEffect(() => {
    if (branches.length > 0) {
      const exists = branches.some(b => String(b.id) === String(selectedBranchId));
      if (!exists) {
        const active = branches.find(b => b.isActive);
        setSelectedBranchId(String(active ? active.id : branches[0].id));
      }
    } else {
      setSelectedBranchId('');
    }
  }, [branches]);

  const fetchOrders = async () => {
    if (!selectedBranchId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getRestaurantOrders(Number(selectedBranchId));
      setOrders(res.data);
      
      // If there's an active selected order, refresh its details too
      if (selectedOrder) {
        loadOrderDetails(selectedOrder.publicId);
      }
    } catch (err: any) {
      console.error('Failed to fetch restaurant orders:', err);
      setError('Could not retrieve orders for this branch.');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (publicId: string) => {
    try {
      setDetailsLoading(true);
      const details = await orderService.getOrderDetails(publicId);
      setSelectedOrder(details);
    } catch (err) {
      console.error('Failed to load order details:', err);
      alert('Failed to retrieve order items.');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBranchId) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [selectedBranchId]);

  const handleStatusChange = async (status: 'accepted' | 'rejected' | 'preparing' | 'ready' | 'cancelled', reason?: string) => {
    if (!selectedOrder) return;
    try {
      setActionProcessing(true);
      await orderService.updateOrderStatus(selectedOrder.publicId, status, reason);
      
      // Reload details and list
      await loadOrderDetails(selectedOrder.publicId);
      const listRes = await orderService.getRestaurantOrders(Number(selectedBranchId));
      setOrders(listRes.data);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(`Error updating status: ${err.message || 'Unknown error'}`);
    } finally {
      setActionProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let classes = 'bg-gray-100 text-gray-700';
    if (s === 'pending_payment') classes = 'bg-orange-100 text-orange-850';
    else if (s === 'placed') classes = 'bg-blue-100 text-blue-800';
    else if (s === 'accepted') classes = 'bg-indigo-100 text-indigo-850';
    else if (s === 'preparing') classes = 'bg-yellow-100 text-yellow-850';
    else if (s === 'ready') classes = 'bg-teal-100 text-teal-850';
    else if (s === 'cancelled' || s === 'rejected') classes = 'bg-red-100 text-red-800';

    return (
      <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${classes}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8 min-h-screen">
      {/* Top Banner Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Queue</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Manage incoming orders, preparations, and delivery Handshakes.</p>
        </div>
        
        {/* Branch select filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Branch:</label>
          <select 
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setSelectedOrder(null);
            }}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#b3360c]"
            disabled={hasNoBranches}
          >
            {hasNoBranches ? (
              <option value="">No Branches</option>
            ) : (
              branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.label || b.name || b.addressText} {!b.isActive ? ' (Inactive)' : ''}
                </option>
              ))
            )}
          </select>
          <button
            onClick={fetchOrders}
            className="p-2 border border-gray-200 hover:border-gray-300 rounded-xl transition bg-white"
            title="Refresh order queue"
            disabled={hasNoBranches}
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-xs text-red-750 font-bold">{error}</span>
        </div>
      )}

      {isLoadingBranches ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100 shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#b3360c] animate-spin" />
          <p className="text-xs text-gray-450 font-bold uppercase tracking-wider">Loading Branches...</p>
        </div>
      ) : hasNoBranches ? (
        <div className="bg-amber-50 border border-amber-250/60 p-10 rounded-[28px] text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-amber-600" />
          <h3 className="text-base font-bold text-gray-900">No Branches Found</h3>
          <p className="text-gray-500 text-xs leading-relaxed max-w-md font-semibold">
            Before you can view or process restaurant orders, you must have at least one branch. 
            Go to the **Branches** page to register a branch location.
          </p>
        </div>
      ) : (
        /* Main Split Layout */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Side: Order List Feed */}
          <div className="xl:col-span-7 space-y-4">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100 shadow-xs">
                <RefreshCw className="w-8 h-8 text-[#b3360c] animate-spin" />
                <p className="text-xs text-gray-450 font-bold uppercase tracking-wider">Loading Branch Orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[28px] border border-gray-150/80 shadow-xs">
                <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-base font-bold text-gray-900">No Orders in Queue</h3>
                <p className="text-gray-400 text-xs mt-1.5 max-w-xs mx-auto leading-relaxed">
                  There are no active or historical orders registered for this branch. Incoming orders will show up here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => {
                  const isSelected = selectedOrder?.publicId === o.publicId;
                  return (
                    <div
                      key={o.publicId}
                      onClick={() => loadOrderDetails(o.publicId)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected 
                          ? 'border-[#b3360c] bg-orange-50/5 ring-1 ring-[#b3360c]/20 shadow-sm' 
                          : 'border-gray-150/80 hover:border-gray-300 bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 border ${
                          isSelected ? 'bg-orange-50 text-[#b3360c] border-orange-100' : 'bg-gray-50 text-gray-650 border-gray-100'
                        }`}>
                          📦
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-gray-900 truncate">Order #{o.publicId.slice(0, 8)}</h4>
                            {getStatusBadge(o.status)}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-gray-450 font-semibold mt-1 flex-wrap">
                            <span>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span>{o.itemsCount} {o.itemsCount === 1 ? 'item' : 'items'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-mono font-black text-sm text-gray-900">
                          {formatCurrency(o.total, o.currency)}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-gray-400 ${isSelected ? 'text-[#b3360c]' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Order details Panel */}
          <div className="xl:col-span-5 bg-white border border-gray-150/80 p-6 md:p-8 rounded-[28px] shadow-xs min-h-[460px] relative">
            <AnimatePresence mode="wait">
              {detailsLoading ? (
                <motion.div
                  key="loading-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col justify-center items-center gap-3 rounded-[28px] z-10"
                >
                  <RefreshCw className="w-8 h-8 text-[#b3360c] animate-spin" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Details...</p>
                </motion.div>
              ) : null}

              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.publicId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Header detail */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4 flex-wrap gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">Order Reference ID</span>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight mt-0.5">{selectedOrder.publicId}</h3>
                      <p className="text-xs text-gray-450 font-medium mt-1">Placed: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    {getStatusBadge(selectedOrder.status)}
                  </div>

                  {/* Items breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-gray-450 tracking-wider">Ordered items</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {selectedOrder.items.map((item) => (
                        <div key={item.productId} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-lg border border-gray-150 flex items-center justify-center">🍔</div>
                            )}
                            <div className="min-w-0">
                              <span className="font-extrabold text-gray-900 truncate block leading-snug">{item.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</span>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900">{formatCurrency(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Pricing / Payments */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Subtotal</span>
                      <span className="font-bold text-gray-900">{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Delivery Fee</span>
                      <span className="font-bold text-gray-900">{formatCurrency(selectedOrder.deliveryFee, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between text-gray-900 font-black text-sm pt-2 border-t border-gray-50">
                      <span>Total Amount</span>
                      <span className="text-[#b3360c] text-base">{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block">Dropoff Address</span>
                        <span className="font-semibold text-gray-700 block mt-0.5">{selectedOrder.customerAddress.addressText}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block">Payment Status</span>
                        <span className="font-semibold text-gray-700 block mt-0.5">
                          {(selectedOrder.paymentSummary?.method || selectedOrder.paymentMethod || 'COD').toUpperCase()} • <span className="text-emerald-700 font-bold uppercase">{selectedOrder.paymentSummary?.status || (selectedOrder.status === 'pending_payment' ? 'pending' : 'paid')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons based on status */}
                  <div className="pt-2">
                    {selectedOrder.status === 'placed' && (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleStatusChange('accepted')}
                          disabled={actionProcessing}
                          className="bg-indigo-650 hover:bg-indigo-750 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept Order</span>
                        </button>
                        <button
                          onClick={() => {
                            const r = prompt('Reason for rejection:');
                            if (r) handleStatusChange('rejected', r);
                          }}
                          disabled={actionProcessing}
                          className="bg-red-50 hover:bg-red-100 text-red-750 border border-red-200 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {selectedOrder.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusChange('preparing')}
                        disabled={actionProcessing}
                        className="w-full bg-yellow-600 hover:bg-yellow-750 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Package className="w-4.5 h-4.5" />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {selectedOrder.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange('ready')}
                        disabled={actionProcessing}
                        className="w-full bg-teal-650 hover:bg-teal-750 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-5 h-5" />
                        <span>Mark as Ready</span>
                      </button>
                    )}

                    {selectedOrder.status === 'ready' && (
                      <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-850 font-bold">
                        Order is ready! Awaiting delivery courier dispatch.
                      </div>
                    )}

                    {selectedOrder.status === 'pending_payment' && (
                      <div className="text-center p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-850 font-bold">
                        Awaiting secure customer online payment session clearance.
                      </div>
                    )}

                    {selectedOrder.status === 'cancelled' && (
                      <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-bold">
                        This order was cancelled.
                      </div>
                    )}
                    
                    {selectedOrder.status === 'rejected' && (
                      <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-bold">
                        This order was rejected by the kitchen.
                      </div>
                    )}

                    {/* Cancel order backup button */}
                    {['placed', 'accepted', 'preparing'].includes(selectedOrder.status) && (
                      <button
                        onClick={() => {
                          const r = prompt('Reason for cancellation:');
                          if (r) handleStatusChange('cancelled', r);
                        }}
                        disabled={actionProcessing}
                        className="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 transition uppercase tracking-wider mt-4"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="py-24 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                  Select an order from the list to view full kitchen ticket & details.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
