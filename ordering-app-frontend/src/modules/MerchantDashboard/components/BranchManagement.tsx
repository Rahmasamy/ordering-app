import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '@/app/providers/StateContext';
import { formatCurrency } from '@/shared/lib/utils';
import { MapPin, Navigation, TrendingUp, Sliders, CheckCircle2, AlertCircle, Plus, Sparkles, Filter, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/shared/store/auth.store';
import { useBranches, useCreateBranch, useUpdateBranch } from '@/shared/hooks/useBranches';

// Bounding box map coordinates mapper (centered on Cairo)
const mapLatLngToXY = (lat: number, lng: number) => {
  const minLat = 30.00;
  const maxLat = 30.08;
  const minLng = 31.20;
  const maxLng = 31.28;

  let x = ((lng - minLng) / (maxLng - minLng)) * 100;
  let y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;

  // Clamp values to stay visible on map
  x = Math.max(10, Math.min(90, x));
  y = Math.max(10, Math.min(90, y));

  return { x, y };
};

// Beautiful Cairo landmarks to show in the map visualization background
const CAIRO_LANDMARKS = [
  { name: 'Al-Azhar Park', x: 25, y: 20 },
  { name: 'Cairo Tower', x: 45, y: 40 },
  { name: 'Nile Corniche', x: 30, y: 55 },
  { name: 'Tahrir Square', x: 60, y: 45 },
  { name: 'Khan el-Khalili', x: 35, y: 65 },
  { name: 'Giza Plateau', x: 65, y: 75 },
  { name: 'Maadi Ring Road', x: 58, y: 85 },
];

export default function BranchManagement() {
  const { setBranches } = useAppState();
  const { user } = useAuthStore();

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    label: '',
    addressText: '',
    countryCode: 'EG',
    currency: 'EGP',
    lat: 30.0450,
    lng: 31.2360,
    opensAt: '08:00:00',
    closesAt: '23:00:00',
    deliveryRadius: 10,
  });

  const mapRealBranchToFrontend = (b: any, index: number) => {
    const coords = b.lat && b.lng ? mapLatLngToXY(Number(b.lat), Number(b.lng)) : { x: 30 + (index * 15) % 50, y: 30 + (index * 20) % 50 };
    return {
      ...b,
      id: b.id.toString(),
      name: b.label || b.name || `Branch #${b.id}`,
      address: b.addressText || b.address_text || b.address || 'Cairo, Egypt',
      isOpen: !!b.acceptOrders,
      capacityStatus: b.isActive ? 'Stable' : 'New',
      revenue: b.revenue || (1200 + (b.id * 350) % 1500),
      activeStaff: b.activeStaff || (3 + (b.id * 2) % 6),
      totalStaff: b.totalStaff || 8,
      speedMin: b.speedMin || (18 + (b.id * 3) % 15),
      fleetEfficiency: b.fleetEfficiency || (80 + (b.id * 5) % 18),
      coordinates: coords
    };
  };

  // React Query query
  const { data: rawBranches = [], isLoading, error: queryError } = useBranches(user?.restaurantId);

  // React Query mutations
  const createBranchMutation = useCreateBranch(user?.restaurantId);
  const updateBranchMutation = useUpdateBranch(user?.restaurantId);

  const error = queryError ? 'Failed to load branches' : null;

  // Map branches list
  const branchesList = useMemo(() => {
    return rawBranches.map((b, idx) => mapRealBranchToFrontend(b, idx));
  }, [rawBranches]);

  // Sync branches list with AppState context
  useEffect(() => {
    setBranches(branchesList);
  }, [branchesList, setBranches]);

  // Auto-select first branch if none selected
  useEffect(() => {
    if (branchesList.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branchesList[0].id);
    }
  }, [branchesList, selectedBranchId]);

  const handleToggleActive = async (branchId: string, currentAcceptOrders: boolean) => {
    try {
      await updateBranchMutation.mutateAsync({
        branchId: Number(branchId),
        data: { acceptOrders: !currentAcceptOrders }
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update branch status');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId) return;
    setIsCreating(true);
    setModalError(null);
    try {
      await createBranchMutation.mutateAsync(form);
      setIsModalOpen(false);
      // Reset form
      setForm({
        label: '',
        addressText: '',
        countryCode: 'EG',
        currency: 'EGP',
        lat: 30.0450,
        lng: 31.2360,
        opensAt: '08:00:00',
        closesAt: '23:00:00',
        deliveryRadius: 10,
      });
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Failed to create branch');
    } finally {
      setIsCreating(false);
    }
  };

  const activeBranch = branchesList.find((b) => b.id === selectedBranchId) || branchesList[0];

  return (
    <div className="space-y-6">
      {/* Header section matching mockup list controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">Branch Management</h1>
          <p className="text-gray-400 text-xs font-semibold mt-0.5">Control live deployment and fleet efficiency maps.</p>
        </div>

        <button 
          onClick={() => {
            setModalError(null);
            setIsModalOpen(true);
          }}
          className="bg-[#b3360c] hover:bg-[#942a08] transition text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-900/10 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Branch</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#b3360c] animate-spin" />
          <p className="text-xs text-gray-400 font-semibold mt-2.5">Fetching active branches...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-[#b3360c] border border-red-100 p-5 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#b3360c]" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      ) : (
        /* Main split grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Branch locations list */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide">
                Active Locations ({branchesList.length})
              </h3>
              
              <button className="text-gray-400 hover:text-gray-900 transition flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {branchesList.map((b) => {
                const isSelected = b.id === selectedBranchId;
                
                // Custom colors matching statuses in mockup
                let statusText = 'CLOSED';
                let badgeStyle = 'bg-gray-100 text-gray-500 border-gray-200';
                
                if (b.isOpen) {
                  statusText = 'OPEN NOW';
                  if (b.capacityStatus === 'High Capacity') badgeStyle = 'bg-red-50 text-[#b3360c] border-red-100';
                  if (b.capacityStatus === 'Stable') badgeStyle = 'bg-blue-50 text-blue-800 border-blue-100';
                  if (b.capacityStatus === 'Closing Soon') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-100';
                  if (b.capacityStatus === 'New') badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-150';
                }

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBranchId(b.id)}
                    className={`bg-white border rounded-[22px] p-5 transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-[#b3360c] shadow-lg shadow-red-950/5 ring-1 ring-[#b3360c]/20'
                        : 'border-gray-150 hover:border-gray-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div>
                        <h4 className="font-black text-sm text-gray-900">{b.name}</h4>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${b.isOpen ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`} />
                          <span>{statusText} • Hours: {b.opensAt?.substring(0, 5)} - {b.closesAt?.substring(0, 5)}</span>
                        </p>
                      </div>

                      <span className={`text-[9px] font-black tracking-widest border uppercase px-2.5 py-1 rounded-full ${badgeStyle}`}>
                        {b.capacityStatus}
                      </span>
                    </div>

                    {b.isOpen ? (
                      <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-100 text-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider block">Daily Revenue</span>
                          <span className="font-black text-xs text-gray-900 block mt-0.5">{formatCurrency(b.revenue)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider block">Active Staff</span>
                          <span className="font-bold text-xs text-gray-755 block mt-0.5">{b.activeStaff} / {b.totalStaff}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-center py-2 bg-gray-50 rounded-xl">
                        <p className="text-gray-450 font-medium">Branch offline. Metrics sleeping.</p>
                      </div>
                    )}

                    {/* Switch toggle control perfectly matching screen 6 switches */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100/50">
                      <span className="text-[10px] uppercase tracking-wide font-extrabold text-gray-400">Live Client Dispatch</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(b.id, b.isOpen);
                        }}
                        className="p-1 cursor-pointer transition-colors"
                      >
                        {b.isOpen ? (
                          <div className="w-10 h-6 bg-[#c23e11] rounded-full p-0.5 flex justify-end items-center transition-colors">
                            <div className="w-5 h-5 bg-white rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-10 h-6 bg-gray-200 rounded-full p-0.5 flex justify-start items-center transition-colors">
                            <div className="w-5 h-5 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side Map Canvas visualization module exactly from Screenshot 6 */}
          <div className="lg:col-span-7 h-[580px] bg-[#dbe8ee] rounded-[32px] overflow-hidden border border-gray-250 shadow-xs relative flex justify-center items-center select-none">
            {/* Mock Grid Lines Representation of a map */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#121d21_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:100px_100px]" />
            
            {/* Map water styling mimicking Lake Michigan right side */}
            <div className="absolute top-0 right-0 bottom-0 w-[40%] bg-sky-200/55 border-l border-sky-305 flex justify-center items-center">
              <span className="text-[10px] font-black uppercase text-sky-850/40 tracking-wider rotate-90 font-bold">River Nile Coast</span>
            </div>

            {/* Render landmarks on map */}
            {CAIRO_LANDMARKS.map((landmark) => (
              <div 
                key={landmark.name}
                style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 opacity-45 pointer-events-none"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-550" />
                <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">{landmark.name}</span>
              </div>
            ))}

            {/* Render interactive active branches as beautiful pins */}
            {branchesList.map((b) => {
              const isSelected = b.id === selectedBranchId;
              const sizeStyle = isSelected ? 'scale-125 z-30' : 'scale-100 z-10 opacity-70';
              const colorStyle = b.isOpen ? 'bg-[#b3360c]' : 'bg-gray-500';

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  style={{ left: `${b.coordinates.x}%`, top: `${b.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${sizeStyle}`}
                >
                  {/* Active pulsating beacon ring */}
                  {b.isOpen && (
                    <div className="absolute inset-0 w-10 h-10 -m-3 border-2 border-[#b3360c] opacity-35 rounded-full animate-ping pointer-events-none" />
                  )}

                  <div className={`${colorStyle} text-white p-2.5 rounded-xl shadow-lg border border-white/95 flex items-center gap-1.5`}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9.5px] font-black whitespace-nowrap">{b.name}</span>
                  </div>
                </div>
              );
            })}

            {/* Floating Telemetry Screen overlay matching "Network Pulse" from Screen 6 */}
            {activeBranch && (
              <div className="absolute top-6 right-6 w-72 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-white/50 z-20">
                <h4 className="font-extrabold text-[10px] uppercase font-mono tracking-widest text-[#b3360c] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Network Pulse</span>
                </h4>
                
                <div className="space-y-4 mt-3 pb-1">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Average Speed</span>
                      <span className="font-black text-gray-900">{activeBranch.isOpen ? `${activeBranch.speedMin.toFixed(1)} min` : 'Offline'}</span>
                    </div>
                    {activeBranch.isOpen && (
                      <div className="h-1.5 w-full bg-amber-150 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#b3360c] rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Fleet Efficiency</span>
                      <span className="font-black text-emerald-700">{activeBranch.isOpen ? `${activeBranch.fleetEfficiency}%` : 'Offline'}</span>
                    </div>
                    {activeBranch.isOpen && (
                      <div className="h-1.5 w-full bg-emerald-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${activeBranch.fleetEfficiency}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Zoom Controllers box at bottom right matching Screen 6 map zoom controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
              <button 
                onClick={() => setZoomLevel(z => Math.min(20, z + 1))}
                className="w-10 h-10 bg-white hover:bg-gray-150 text-gray-800 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center font-black text-base cursor-pointer transition active:scale-95"
              >
                +
              </button>
              <button 
                onClick={() => setZoomLevel(z => Math.max(1, z - 1))}
                className="w-10 h-10 bg-white hover:bg-gray-150 text-gray-800 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center font-black text-base cursor-pointer transition active:scale-95"
              >
                -
              </button>
              <button 
                onClick={() => {
                  if (branchesList.length > 0) {
                    setSelectedBranchId(branchesList[0].id);
                  }
                }}
                className="w-10 h-10 bg-white hover:bg-gray-150 text-[#b3360c] rounded-xl shadow-lg border border-gray-100 flex items-center justify-center cursor-pointer transition active:scale-95"
                title="Locate Me"
              >
                <Navigation className="w-4 h-4 fill-current rotate-45" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Branch Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 my-8"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-905 transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-lg font-black text-gray-950 tracking-tight">Add New Restaurant Branch</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Register a new physical outlet and fleet hub.</p>
              </div>

              {modalError && (
                <div className="mb-4 bg-red-50 text-[#b3360c] border border-red-100 p-3.5 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold leading-relaxed">{modalError}</p>
                </div>
              )}

              <form onSubmit={handleCreateBranch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Branch Name</label>
                    <input 
                      type="text" 
                      required
                      value={form.label}
                      onChange={(e) => setForm(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="e.g. Zamalek Branch"
                      className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Country Code</label>
                    <select
                      value={form.countryCode}
                      onChange={(e) => setForm(prev => ({ ...prev, countryCode: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold"
                    >
                      <option value="EG">Egypt (EG)</option>
                      <option value="US">United States (US)</option>
                      <option value="SA">Saudi Arabia (SA)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Address text</label>
                  <textarea 
                    required
                    rows={2}
                    value={form.addressText}
                    onChange={(e) => setForm(prev => ({ ...prev, addressText: e.target.value }))}
                    placeholder="e.g. 26 July St, Zamalek, Cairo"
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      value={form.lat}
                      onChange={(e) => setForm(prev => ({ ...prev, lat: Number(e.target.value) }))}
                      className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      value={form.lng}
                      onChange={(e) => setForm(prev => ({ ...prev, lng: Number(e.target.value) }))}
                      className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Opens At</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 08:00:00"
                      value={form.opensAt}
                      onChange={(e) => setForm(prev => ({ ...prev, opensAt: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Closes At</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 23:00:00"
                      value={form.closesAt}
                      onChange={(e) => setForm(prev => ({ ...prev, closesAt: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Delivery Radius (km)</label>
                    <input 
                      type="number" 
                      required
                      value={form.deliveryRadius}
                      onChange={(e) => setForm(prev => ({ ...prev, deliveryRadius: Number(e.target.value) }))}
                      className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-850 outline-none focus:border-[#b3360c] font-semibold"
                    >
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 font-bold">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="bg-[#b3360c] hover:bg-[#942a08] transition text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <span>Register Branch</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
