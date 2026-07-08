import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { formatCurrency } from '@/shared/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Milestone, TrendingUp, CheckCircle, Clock, Zap, MapPin, Plus, UserPlus, FileEdit, Trash, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '@/shared/store/auth.store';
import { useAnalyticsOverview } from '@/shared/hooks/useAnalytics';
import { useBranches } from '@/shared/hooks/useBranches';

// Sample data for the beautiful smooth curve graph in Screen 5
const REVENUE_DATA = [
  { name: 'Week 1', revenue: 98000 },
  { name: 'Week 2', revenue: 104000 },
  { name: 'Week 3', revenue: 112000 },
  { name: 'Week 4', revenue: 124502 },
];

export default function MerchantOverview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { metrics: contextMetrics, setMetrics, branches: contextBranches, setBranches, setWizardStep, setNewProductForm } = useAppState();

  const { data: realMetrics } = useAnalyticsOverview(user?.restaurantId);
  const { data: rawBranches = [] } = useBranches(user?.restaurantId);

  // Sync real metrics with AppState context
  useEffect(() => {
    if (realMetrics) {
      setMetrics(realMetrics);
    }
  }, [realMetrics, setMetrics]);

  // Map raw branches to frontend structure
  const branchesList = useMemo(() => {
    return rawBranches.map((b, idx) => {
      let capacityStatus: 'Peak Performance' | 'Low Staff' | 'Closing Soon' | 'Maintenance' | 'Stable' = 'Stable';
      if (!b.acceptOrders) capacityStatus = 'Maintenance';
      else if (idx === 0) capacityStatus = 'Peak Performance';
      else if (idx === 1) capacityStatus = 'Low Staff';
      else if (idx === 3) capacityStatus = 'Closing Soon';

      return {
        id: String(b.id),
        name: b.label || b.name,
        address: b.addressText || b.address || '',
        revenue: b.acceptOrders ? 4820.50 : 0.00,
        activeStaff: b.acceptOrders ? (idx === 0 ? 12 : 8) : 0,
        totalStaff: b.acceptOrders ? (idx === 0 ? 14 : 10) : 8,
        capacityStatus,
        isOpen: b.acceptOrders,
        activeOrders: b.acceptOrders ? (idx === 0 ? 32 : 18) : 0,
        coordinates: { x: 42 + idx * 10, y: 35 + idx * 5 },
        speedMin: b.acceptOrders ? 18.4 : 0,
        fleetEfficiency: b.acceptOrders ? 92 : 0,
        tags: b.acceptOrders ? ['ACTIVE'] : ['MAINTENANCE']
      };
    });
  }, [rawBranches]);

  // Sync branches with AppState context
  useEffect(() => {
    if (branchesList.length > 0) {
      setBranches(branchesList);
    }
  }, [branchesList, setBranches]);

  const metrics = realMetrics || contextMetrics;
  const branches = branchesList.length > 0 ? branchesList : contextBranches;

  const handleStartWizard = () => {
    // Reset wizard
    setWizardStep(1);
    setNewProductForm({
      name: '',
      price: 0,
      description: '',
      category: 'mains',
      tags: [],
      sku: `BURGER-MOCK-${Math.floor(Math.random() * 900) + 100}`,
      stockStatus: 'In Stock',
      warningThreshold: 10,
      taxable: true,
      taxCategory: 'Standard Food (8%)',
      branchAvailability: { b1: true, b2: true },
      fulfillmentOptions: { dineIn: true, takeaway: true, delivery: true },
      allergenWarnings: '',
      rating: 5.0,
      reviewsCount: 1,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      donenessOptions: ['Medium', 'Medium Well', 'Well Done'],
      addons: [
        { name: 'Extra Truffle Mayo', price: 2.50 },
        { name: 'Caramelized Onions', price: 1.50 },
        { name: 'No Onions', price: 0.00 }
      ]
    });
    navigate('/merchant/wizard');
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Command Center</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Real-time performance across your restaurant network.</p>
        </div>
        
       
      </div>

      {/* Main Stats Graph and Side Cards Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Graph Card */}
        <div className="xl:col-span-8 bg-white p-6 md:p-8 rounded-[32px] border border-gray-150/80 shadow-xs">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-gray-400 font-bold text-[10px] uppercase font-mono tracking-wider">Revenue Growth</span>
              <h2 className="text-3xl font-black text-gray-900 mt-1 leading-none tracking-tight">
                {formatCurrency(metrics.revenueThisMonth)}
              </h2>
              <p className="text-xs text-emerald-600 font-extrabold flex items-center gap-1 mt-1.5 bg-emerald-50 px-2.5 py-1 rounded-full w-fit border border-emerald-100/30">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.4% vs last mo.</span>
              </p>
            </div>
            
            <p className="text-xs text-gray-450 font-medium max-w-xs text-right leading-relaxed hidden sm:block">
              Total gross revenue consolidated across 4 active digital outlets for current period.
            </p>
          </div>

          <div className="h-64 mt-4 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b3360c" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#b3360c" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip 
                  contentStyle={{ background: '#121d21', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Consolidated Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#b3360c" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Stack Stats Widgets */}
        <div className="xl:col-span-4 flex flex-col justify-between gap-4">
          {/* Accuracy widget */}
          <div className="bg-emerald-[5px] bg-[#f2fcf6] border border-emerald-100 p-6 rounded-[28px] flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800">Order Accuracy</span>
                <p className="text-2xl font-black text-gray-900 mt-1">{metrics.orderAccuracyPercent}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-6">
              {/* Progress bar */}
              <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${metrics.orderAccuracyPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold mt-2 uppercase tracking-wide">Excellent Score: Near-Zero dispute rate</p>
            </div>
          </div>

          {/* Response time widget */}
          <div className="bg-[#fef8f5] border border-orange-100 p-6 rounded-[28px] flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-850">Avg Response Time</span>
                <p className="text-2xl font-black text-gray-900 mt-1">{metrics.avgResponseTimeMin} min</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-6">
              <span className="text-xs text-orange-700 font-extrabold bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100/50">
                -15s from yesterday
              </span>
              <p className="text-[10px] text-gray-400 font-semibold mt-2.5 uppercase tracking-wider">Fastest category: Beverages & starters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branches grid and side details feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Branch grid */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[32px] border border-gray-150/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Branch Performance</h2>
              <p className="text-gray-400 text-xs font-semibold mt-0.5">Capacity loads and telemetry parameters per hub.</p>
            </div>
            <button 
              onClick={() => navigate('/merchant/branches')}
              className="text-[#b3360c] hover:text-[#942a08] text-xs font-bold uppercase flex items-center gap-1 hover:underline"
            >
              View All Map <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => {
              // Custom colors matching states in mockup
              let statusColor = 'bg-[#fcf3f0] text-[#b3360c] border-red-50';
              if (b.capacityStatus === 'Peak Performance') statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
              if (b.capacityStatus === 'Low Staff') statusColor = 'bg-amber-50 text-amber-800 border-amber-100';
              if (b.capacityStatus === 'Closing Soon') statusColor = 'bg-purple-50 text-purple-800 border-purple-100';
              if (b.capacityStatus === 'Maintenance') statusColor = 'bg-gray-100 text-gray-500 border-gray-200';

              return (
                <div 
                  key={b.id} 
                  onClick={() => navigate('/merchant/branches')}
                  className="bg-gray-50 border border-gray-150/80 p-5 rounded-2xl flex gap-3 cursor-pointer hover:border-gray-300 transition-all duration-200"
                >
                  {/* Square street map placeholder */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-sky-50 border border-gray-200 flex-shrink-0 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#9ca3af_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
                    <MapPin className="w-5 h-5 text-[#b3360c] z-10" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 truncate">{b.name}</h4>
                      <p className="text-[11px] text-gray-400 font-medium truncate">{b.address}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <span className="text-[11px] font-extrabold text-gray-800">
                        {b.isOpen ? `${b.activeOrders} Active Orders` : 'Closed (Disabled)'}
                      </span>
                      
                      <span className={`text-[9px] font-extrabold uppercase tracking-wide border px-2 py-0.5 rounded-full ${statusColor}`}>
                        {b.isOpen ? b.capacityStatus : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Actions & Activity Feed Stack */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Panel from Screenshot 5 */}
          <div className="bg-[#1a2d36] text-white p-6 rounded-[28px] shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#e2f1f5] mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 fill-current" />
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              <button 
                onClick={handleStartWizard}
                className="w-full bg-[#27404b] hover:bg-[#345362] transition p-3.5 rounded-xl flex items-center gap-3 cursor-pointer text-left font-bold text-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#b3360c] flex items-center justify-center text-white flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-white">Create Product</span>
                  <span className="block text-gray-400 text-[10px] font-medium leading-none mt-0.5">Add to all restaurant branch menus</span>
                </div>
              </button>

              <button 
                onClick={() => alert('Invite member magic screen! System token generated.')}
                className="w-full bg-[#27404b] hover:bg-[#345362] transition p-3.5 rounded-xl flex items-center gap-3 cursor-pointer text-left font-bold text-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-white">Invite Member</span>
                  <span className="block text-gray-400 text-[10px] font-medium leading-none mt-0.5">Grant manager permissions</span>
                </div>
              </button>
            </div>
          </div>

          {/* Team Activity Logs Panel from Screen 5 */}
          <div className="bg-white p-6 rounded-[28px] border border-gray-150-80 shadow-xs">
            <h3 className="text-sm font-black text-gray-900 tracking-tight mb-4">Team Activity</h3>
            
            <div className="space-y-4">
              {metrics.activityLogs.map((log) => {
                let badgeColor = 'bg-blue-100 text-blue-800';
                if (log.type === 'alert') badgeColor = 'bg-red-50 text-[#b3360c] border-red-100';
                if (log.type === 'status') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';

                return (
                  <div key={log.id} className="text-xs group relative pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-gray-900">{log.user}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{log.time}</span>
                    </div>
                    <p className="text-gray-500 font-medium pr-2 leading-relaxed">
                      {log.action}
                    </p>
                    {log.details && (
                      <p className="text-[10px] text-[#b3365c] font-mono bg-gray-50 p-2.5 rounded border border-gray-100/50 mt-1.5 leading-tight">
                        {log.details}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
