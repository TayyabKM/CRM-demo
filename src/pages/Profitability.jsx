import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  PieChart, BarChart, Download, Filter, Search, 
  ArrowUpRight, ArrowDownRight, Loader2, Briefcase, 
  Users, Layers, ExternalLink
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#038D46', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export default function Profitability() {
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Highest Revenue');

  useEffect(() => {
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snap) => {
      setInvoices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snap) => {
      setExpenses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubProjects();
      unsubInvoices();
      unsubExpenses();
    };
  }, []);

  const kpis = useMemo(() => {
    const totalRevenue = projects.reduce((sum, p) => sum + (Number(p.totalClientCost) || 0), 0);
    const totalDirectCost = projects.reduce((sum, p) => sum + (Number(p.totalInternalCost) || 0), 0);
    const grossProfit = totalRevenue - totalDirectCost;
    const netMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalDirectCost, grossProfit, netMarginPercent };
  }, [projects]);

  const monthlyTrendData = useMemo(() => {
    if (projects.length < 2) {
      return [
        {month:"Nov", revenue:1850000, cost:1202500},
        {month:"Dec", revenue:2240000, cost:1456000},
        {month:"Jan", revenue:1920000, cost:1248000},
        {month:"Feb", revenue:2680000, cost:1742000},
        {month:"Mar", revenue:3120000, cost:2028000},
        {month:"Apr", revenue:2840000, cost:1846000},
      ];
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const grouped = {};
    
    projects.forEach(p => {
      const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
      const monthLabel = months[date.getMonth()];
      if (!grouped[monthLabel]) grouped[monthLabel] = { month: monthLabel, revenue: 0, cost: 0 };
      grouped[monthLabel].revenue += Number(p.totalClientCost) || 0;
      grouped[monthLabel].cost += Number(p.totalInternalCost) || 0;
    });

    return Object.values(grouped);
  }, [projects]);

  const sortedProjects = useMemo(() => {
    let result = projects.map(p => {
      const revenue = Number(p.totalClientCost) || 0;
      const cost = Number(p.totalInternalCost) || 0;
      const gp = revenue - cost;
      const gpPercent = revenue > 0 ? (gp / revenue) * 100 : 0;
      const overhead = revenue * 0.12;
      const netProfit = gp - overhead;
      const npPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      return { 
        ...p, revenue, cost, gp, gpPercent, overhead, netProfit, npPercent 
      };
    });

    if (sortBy === 'Highest Revenue') result.sort((a, b) => b.revenue - a.revenue);
    if (sortBy === 'Highest Margin') result.sort((a, b) => b.gpPercent - a.gpPercent);
    if (sortBy === 'Most Recent') result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    if (sortBy === 'Client A-Z') result.sort((a, b) => a.clientName.localeCompare(b.clientName));

    return result;
  }, [projects, sortBy]);

  const clientRevenueData = useMemo(() => {
    const clients = {};
    projects.forEach(p => {
      clients[p.clientName] = (clients[p.clientName] || 0) + (Number(p.totalClientCost) || 0);
    });
    
    const sorted = Object.entries(clients)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    if (sorted.length < 2) {
      return [
        {name: "Shan Foods", revenue: 2800000},
        {name: "HBL Bank", revenue: 1900000},
        {name: "Engro Corp", revenue: 1500000},
        {name: "Packages Ltd", revenue: 900000},
        {name: "Metro C&C", revenue: 700000}
      ];
    }
    return sorted;
  }, [projects]);

  const marginDistribution = useMemo(() => {
    let high = 0, mid = 0, low = 0;
    sortedProjects.forEach(p => {
      if (p.gpPercent > 40) high++;
      else if (p.gpPercent >= 25) mid++;
      else low++;
    });

    return [
      { name: 'High Margin (>40%)', value: high, color: '#038D46' },
      { name: 'Mid Margin (25-40%)', value: mid, color: '#F59E0B' },
      { name: 'Low Margin (<25%)', value: low, color: '#EF4444' }
    ];
  }, [sortedProjects]);

  const formatCurrency = (val) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val;
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-brand-text-muted font-bold">Analyzing Profitability Data...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-brand-card rounded-3xl flex items-center justify-center mb-8 border border-brand-border shadow-2xl">
          <BarChart3 size={48} className="text-brand-text-muted" />
        </div>
        <h2 className="text-2xl font-bold mb-3">No project data yet</h2>
        <p className="text-brand-text-muted max-w-md mb-8">
          Save projects from the Job Estimator to see profitability analysis, revenue trends, and margin distribution.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20"
        >
          Go to Job Estimator
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Profitability</h1>
          <p className="text-brand-text-muted mt-1">Revenue, cost, and margin analysis</p>
        </div>
        
        <button 
          onClick={() => toast.info("Export coming in full build")}
          className="flex items-center gap-2 border border-brand-border hover:bg-brand-bg px-6 py-2.5 rounded-xl font-bold transition-all"
        >
          <Download size={18} />
          Export Report
        </button>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: kpis.totalRevenue, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Total Direct Cost', value: kpis.totalDirectCost, icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Gross Profit', value: kpis.grossProfit, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { 
            label: 'Net Margin %', 
            value: `${kpis.netMarginPercent.toFixed(1)}%`, 
            icon: BarChart3, 
            color: kpis.netMarginPercent > 30 ? 'text-green-500' : kpis.netMarginPercent > 15 ? 'text-amber-500' : 'text-red-500', 
            bg: kpis.netMarginPercent > 30 ? 'bg-green-500/10' : kpis.netMarginPercent > 15 ? 'bg-amber-500/10' : 'bg-red-500/10' 
          }
        ].map(kpi => (
          <div key={kpi.label} className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-xl group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">{kpi.label}</p>
                <p className={`text-2xl font-black ${kpi.color}`}>
                  {typeof kpi.value === 'string' ? kpi.value : `PKR ${kpi.value.toLocaleString()}`}
                </p>
              </div>
              <div className={`${kpi.bg} ${kpi.color} p-4 rounded-xl transition-transform group-hover:scale-110`}>
                <kpi.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-12 bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {projects.length < 2 && (
            <div className="absolute top-4 right-4 z-10 bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              Sample Data
            </div>
          )}
          <h3 className="font-bold mb-8 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-primary" />
            Revenue vs Cost — Monthly Trend
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#A0A0A0" 
                  fontSize={12} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#A0A0A0" 
                  fontSize={10} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#3E3E3E', border: '1px solid #4A4A4A', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend iconType="circle" />
                <Bar name="Revenue" dataKey="revenue" fill="#038D46" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar name="Direct Cost" dataKey="cost" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per-Project Table */}
      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl mb-8">
        <div className="p-6 border-b border-brand-border flex flex-wrap justify-between items-center gap-4">
          <h3 className="font-bold flex items-center gap-2">
            <Briefcase size={18} className="text-brand-primary" />
            Project Breakdown
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              <option>Highest Revenue</option>
              <option>Highest Margin</option>
              <option>Most Recent</option>
              <option>Client A-Z</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-brand-bg/50 text-brand-text-muted border-b border-brand-border uppercase">
                <th className="px-6 py-4 font-bold text-[10px]">Project</th>
                <th className="px-6 py-4 font-bold text-[10px]">Client</th>
                <th className="px-6 py-4 font-bold text-[10px] text-right">Revenue</th>
                <th className="px-6 py-4 font-bold text-[10px] text-right">Direct Cost</th>
                <th className="px-6 py-4 font-bold text-[10px] text-right">Gross Profit</th>
                <th className="px-6 py-4 font-bold text-[10px] text-center">GP %</th>
                <th className="px-6 py-4 font-bold text-[10px] text-right">Overhead (12%)</th>
                <th className="px-6 py-4 font-bold text-[10px] text-right">Net Profit</th>
                <th className="px-6 py-4 font-bold text-[10px] text-center">NP %</th>
                <th className="px-6 py-4 font-bold text-[10px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {sortedProjects.map(p => (
                <tr key={p.id} className="hover:bg-brand-bg/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-xs">{p.projectName}</div>
                    <div className="text-[10px] font-mono text-brand-primary uppercase mt-0.5">{p.id.substring(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase">{p.clientName}</td>
                  <td className="px-6 py-4 text-right font-black text-white">{p.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-amber-500/80">{p.cost.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-brand-primary">{p.gp.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-center font-black ${p.gpPercent > 40 ? 'text-green-500' : p.gpPercent >= 25 ? 'text-amber-500' : 'text-red-500'}`}>
                    {p.gpPercent.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right text-[10px] text-brand-text-muted italic">{p.overhead.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-brand-primary">{p.netProfit.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-center font-black ${p.npPercent > 40 ? 'text-green-500' : p.npPercent >= 25 ? 'text-amber-500' : 'text-red-500'}`}>
                    {p.npPercent.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-brand-bg border border-brand-border text-[9px] font-black uppercase text-brand-text-muted">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Clients Chart */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {projects.length < 2 && (
            <div className="absolute top-4 right-4 z-10 bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              Sample Data
            </div>
          )}
          <h3 className="font-bold mb-8 flex items-center gap-2">
            <Users size={18} className="text-brand-primary" />
            Top Clients by Revenue
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart layout="vertical" data={clientRevenueData} margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" horizontal={false} />
                <XAxis type="number" stroke="#A0A0A0" fontSize={10} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                <YAxis type="category" dataKey="name" stroke="#FBFCFB" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#3E3E3E', border: '1px solid #4A4A4A', borderRadius: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="revenue" fill="#038D46" radius={[0, 4, 4, 0]} barSize={25} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margin Distribution */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl flex flex-col">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-brand-primary" />
            Margin Distribution
          </h3>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={marginDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {marginDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black">{projects.length}</span>
                <span className="text-[10px] text-brand-text-muted font-bold uppercase">Projects</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {marginDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase">{item.name}</span>
                    <span className="text-sm font-black">{item.value} Projects ({((item.value / projects.length) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
