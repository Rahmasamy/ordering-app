import React, { useState } from 'react';
import { useAppState } from '@/app/providers/StateContext';
import { formatCurrency } from '@/shared/lib/utils';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, Calendar, FileText, Download, TrendingUp, AlertCircle, RefreshCw, BarChart2, ShieldCheck, Zap, Server, Activity, Users, Star, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';

// Spline data matching Image 6
const REVENUE_TIMELINE = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Mar', revenue: 62000 },
  { month: 'May', revenue: 85000 },
  { month: 'Jul', revenue: 78000 },
  { month: 'Sep', revenue: 110000 },
  { month: 'Nov', revenue: 124502 },
];

// Peak hours habits matching mockup
const PEAK_HOURS_DATA = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 25 },
  { name: 'Wed', value: 85 },
  { name: 'Thu', value: 50 },
  { name: 'Fri', value: 95 },
  { name: 'Sat', value: 90 },
  { name: 'Sun', value: 65 },
];

// Simple circular gauge values
const GAUGE_DATA = [
  { name: 'Margin', value: 68 },
  { name: 'Remaining', value: 32 },
];

const GAUGE_COLORS = ['#b3360c', '#e4eff2'];

export default function MerchantAnalytics() {
  const { addActivityLog } = useAppState();
  const [selectedRange, setSelectedRange] = useState('Month');

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-150 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics Insights</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Consolidated live performance and intelligence telemetry.</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-150">
          {['Week', 'Month', 'Year'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Charts & Performance Logs */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Revenue Overview spline line chart (Image 6 left top) */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-150 shadow-xs relative">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
              <div>
                <span className="text-gray-400 font-bold text-[10px] uppercase font-mono tracking-widest">Gross Revenue Volume</span>
                <h2 className="text-2xl font-black text-gray-900 mt-1 leading-none tracking-tight">Revenue Overview</h2>
                <p className="text-gray-500 text-xs mt-1 font-medium">Monthly growth trends across 12 active digital restaurant branches.</p>
              </div>

              <div className="bg-[#fff2ee] text-[#b3360c] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-red-50/50">
                +12.4% VS LY
              </div>
            </div>

            {/* Recharts Area Spline Chart */}
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b3360c" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#b3360c" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `$${v/1000}k`}
                    tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    contentStyle={{ background: '#121d21', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }}
                    formatter={(v: any) => [formatCurrency(v), 'Gross Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#b3360c" 
                    strokeWidth={4.5} 
                    fillOpacity={1} 
                    fill="url(#analyticsRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Branch Performance Mini List (Image 6 middle-left) */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-150 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Branch Performance</h3>
                <p className="text-gray-400 text-xs font-semibold mt-0.5">Capacity loads and revenue indicators per digital outlet hub.</p>
              </div>
              <button onClick={() => alert('Opening full branches list matrix.')} className="text-[#b3360c] hover:underline text-xs font-bold uppercase tracking-wider">View All</button>
            </div>

            <div className="space-y-4">
              {/* Branch 1 */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#b3360c] flex items-center justify-center font-bold text-sm">
                    🏢
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Downtown Flagship</h4>
                    <p className="text-xs text-gray-400 font-medium">42 Active Tables • 12 Staff</p>
                  </div>
                </div>

                {/* Micro sparkline */}
                <div className="w-24 h-8 hidden sm:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{v:10},{v:14},{v:12},{v:19},{v:24}]}>
                      <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-gray-900 block">$48,200.00</span>
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">+15% GROWING</span>
                </div>
              </div>

              {/* Branch 2 */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-sm">
                    🍴
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Westside Bistro</h4>
                    <p className="text-xs text-gray-400 font-medium">28 Active Tables • 8 Staff</p>
                  </div>
                </div>

                {/* Micro sparkline */}
                <div className="w-24 h-8 hidden sm:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{v:15},{v:15},{v:16},{v:15},{v:16}]}>
                      <Line type="monotone" dataKey="v" stroke="#6b7280" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-gray-900 block">$32,100.00</span>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">STABLE</span>
                </div>
              </div>

              {/* Branch 3 */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold text-sm">
                    ☕
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Harbor Cafe</h4>
                    <p className="text-xs text-gray-400 font-medium">15 Active Tables • 4 Staff</p>
                  </div>
                </div>

                {/* Micro sparkline */}
                <div className="w-24 h-8 hidden sm:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{v:22},{v:18},{v:19},{v:15},{v:12}]}>
                      <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-gray-900 block">$14,500.00</span>
                  <span className="text-[10px] text-red-600 font-black uppercase tracking-wider">-4% DECLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance AI Suggestions (Image 6 left bottom) */}
          <div className="bg-[#121d21] text-white p-8 rounded-[32px] relative overflow-hidden space-y-6">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5.5 h-5.5 text-orange-400 animate-pulse" />
              <h3 className="text-base font-black uppercase tracking-widest text-orange-400">Optimization Suggestions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1e2d36] p-5 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-black text-[#e2f1f5] uppercase tracking-wide">Westside Bistro</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Staffing levels are 15% too high for Wednesday lunch hours. Consider rescheduling 2 servers to Friday night.
                </p>
              </div>

              <div className="bg-[#1e2d36] p-5 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-black text-orange-400 uppercase tracking-wide">Menu Alert</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  The "Truffle Pasta" has seen a 40% margin decrease due to ingredient cost surges. Adjust pricing to $24.99.
                </p>
              </div>

              <div className="bg-[#1e2d36] p-5 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-black text-[#e2f1f5] uppercase tracking-wide">Expansion</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Customer heatmaps suggest high demand for delivery in the East Quarter. Potential for a Cloud Kitchen.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: KPIs, Ordering Habits, Data Hub, Network Health */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Key Metric cards widget list */}
          <div className="space-y-4">
            
            {/* Total Revenue */}
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
                <span className="text-2xl font-black text-gray-900 block mt-1">$124,502.00</span>
                <span className="text-[10px] text-green-600 font-bold block mt-1">↗ 8% increase this month</span>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 shrink-0" />
            </div>

            {/* Average Order Value */}
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Average Order Value</span>
                  <span className="text-2xl font-black text-gray-900 block mt-1">$42.50</span>
                </div>
                <div className="text-[10px] text-[#b3360c] font-black uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full">
                  Target: $45
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#b3360c] rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Gross Margin Widget with Gauge representation */}
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Gross Margin</span>
                <span className="text-2xl font-black text-gray-900 block mt-1">68%</span>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Healthy margin range (+2%)</p>
              </div>

              {/* Piechart gauge */}
              <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={GAUGE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={28}
                      startAngle={180}
                      endAngle={0}
                      dataKey="value"
                    >
                      {GAUGE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index % GAUGE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <span className="absolute bottom-1 text-[10px] font-black text-gray-950">68%</span>
              </div>
            </div>

          </div>

          {/* Ordering Habits habits bar chart (Image 6 right center) */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-gray-950 tracking-tight">Ordering Habits</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Consolidated customer pickup and delivery hourly spikes.</p>
            </div>

            {/* Mini Bar Chart */}
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PEAK_HOURS_DATA} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 700 }} />
                  <Bar dataKey="value" fill="#b3360c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <hr className="border-gray-50" />

            {/* Retention Rate metric and progress */}
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-gray-400 font-black block">RETENTION RATE</span>
                <span className="text-base font-black text-gray-900 block mt-0.5">74%</span>
              </div>
              <p className="text-[9px] text-gray-400 leading-normal font-semibold max-w-[180px] text-right">
                High volume of returning customers at Downtown branch.
              </p>
            </div>
          </div>

          {/* Data Hub exports (Image 6 right bottom) */}
          <div className="bg-[#1a2d36] text-white p-6 rounded-2xl shadow-xs space-y-5">
            <div>
              <span className="text-[#e2f1f5] font-black text-[10px] uppercase font-mono tracking-widest block">DATA HUB</span>
              <h3 className="text-sm font-black text-white mt-1">Recent Exports</h3>
            </div>

            <div className="space-y-3">
              <div 
                onClick={() => alert('Initiating Q3_Revenue.csv CSV download.')}
                className="bg-[#27404b] hover:bg-[#345362] transition p-3 rounded-xl flex items-center justify-between cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-[#b3360c]" />
                  <div>
                    <span className="block font-bold">Q3_Revenue.csv</span>
                    <span className="block text-[10px] text-gray-400">2 hours ago</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-400 hover:text-white" />
              </div>

              <div 
                onClick={() => alert('Initiating Weekly_Insight.pdf PDF download.')}
                className="bg-[#27404b] hover:bg-[#345362] transition p-3 rounded-xl flex items-center justify-between cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-emerald-400" />
                  <div>
                    <span className="block font-bold">Weekly_Insight.pdf</span>
                    <span className="block text-[10px] text-gray-400">Yesterday</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-400 hover:text-white" />
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
              <span>Monthly CEO Digest</span>
              <span className="text-emerald-400 font-black">Oct 1st, 09:00 AM</span>
            </div>

            <button 
              onClick={() => {
                addActivityLog('System Ingest', 'Generated custom analytical PDF report token', 'status');
                alert('Report generated and added to Data Hub download queue.');
              }}
              className="w-full bg-[#b3360c] hover:bg-[#942a08] text-white py-3 rounded-xl font-bold transition shadow text-xs uppercase tracking-wider cursor-pointer"
            >
              Create Report
            </button>
          </div>

          {/* Live Network Health widgets list */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest font-mono">Live Network Health</h4>
            
            <div className="space-y-3 text-xs font-bold">
              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Terminal Uptime</span>
                <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">99.9%</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Avg Kitchen Time</span>
                <span className="text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">14.2m</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Global NPS Score</span>
                <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">4.8 / 5</span>
              </div>
            </div>

            <button 
              onClick={() => alert('Surgical terminal connection and diagnostics test succeeded!')}
              className="w-full bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-200 py-3 rounded-xl font-bold transition text-xs uppercase tracking-wider cursor-pointer"
            >
              Diagnostic Report
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
