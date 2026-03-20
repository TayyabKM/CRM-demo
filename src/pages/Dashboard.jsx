import { useState } from 'react';
import { Briefcase, Clock, FileText, TrendingUp, Lock, Eye, MessageCircle, Cpu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { dashboardCharts, jobs } from '../data/mockData';
import KPICard from '../components/shared/KPICard';
import StatusBadge from '../components/shared/StatusBadge';
import { cn } from '../components/layout/Sidebar';

export default function Dashboard() {
  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Good morning, Admin 👋</h2>
          <p className="text-brand-text-muted mt-1">{today}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Active Jobs" value="24" icon={Briefcase} colorClass="bg-brand-primary/15 text-brand-primary" />
        <KPICard title="Pending Approvals" value="7" icon={Clock} colorClass="bg-amber-500/15 text-amber-500" />
        <KPICard title="Quotes Sent Today" value="3" icon={FileText} colorClass="bg-blue-500/15 text-blue-500" />
        <KPICard title="Revenue This Month" value="PKR 2,840,000" icon={TrendingUp} colorClass="bg-brand-primary/15 text-brand-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-text mb-6">Jobs Completed — Last 6 Weeks</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardCharts.jobsCompleted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" vertical={false} />
                <XAxis dataKey="name" stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#313131' }}
                  contentStyle={{ backgroundColor: '#3E3E3E', borderColor: '#4A4A4A', borderRadius: '8px', color: '#FBFCFB' }}
                  itemStyle={{ color: '#038D46' }}
                />
                <Bar dataKey="value" fill="#038D46" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-text mb-6">Job Status Breakdown</h3>
          <div className="h-72 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardCharts.jobStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dashboardCharts.jobStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#3E3E3E', borderColor: '#4A4A4A', borderRadius: '8px', color: '#FBFCFB' }}
                  itemStyle={{ color: '#FBFCFB' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-brand-text">24</span>
              <span className="text-xs text-brand-text-muted uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
            {dashboardCharts.jobStatus.map((status) => (
              <div key={status.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                <span className="text-xs text-brand-text-muted truncate">{status.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-brand-text">Recent Jobs</h3>
            <button className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/50 border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
                  <th className="px-6 py-4 font-medium">JON</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                  <th className="px-6 py-4 font-medium">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-sm">
                {jobs.slice(0, 6).map((job) => (
                  <tr key={job.id} className="hover:bg-brand-bg/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-text">{job.id}</td>
                    <td className="px-6 py-4 text-brand-text">{job.client}</td>
                    <td className="px-6 py-4 text-brand-text-muted">{job.jobType}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.stage} />
                    </td>
                    <td className="px-6 py-4 text-brand-text-muted">{job.deadline}</td>
                    <td className="px-6 py-4 text-brand-text-muted">{job.assigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-brand-text">Today's Priorities</h3>
            <span className="bg-brand-primary/20 text-brand-primary text-xs font-bold px-2 py-1 rounded-md">5</span>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { task: 'Review Shan Foods artwork', client: 'Shan Foods', time: '10:00 AM', done: false },
              { task: 'Send quote for Vehicle Wraps', client: 'Engro Corp', time: '11:30 AM', done: true },
              { task: 'Approve final proof', client: 'Packages Ltd', time: '2:00 PM', done: false },
              { task: 'Dispatch Shop Signage', client: 'Dawlance', time: '4:00 PM', done: false },
              { task: 'Follow up on pending invoice', client: 'Metro C&C', time: '5:00 PM', done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-bg/50 transition-colors border border-transparent hover:border-brand-border">
                <div className="mt-0.5">
                  <input 
                    type="checkbox" 
                    defaultChecked={item.done}
                    className="w-4 h-4 rounded border-brand-border bg-brand-bg text-brand-primary focus:ring-brand-primary focus:ring-offset-brand-card"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", item.done ? "text-brand-text-muted line-through" : "text-brand-text")}>{item.task}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-brand-text-muted">
                    <span className="truncate">{item.client}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-brand-text mb-4">Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'AI Production Scheduler', icon: Cpu, desc: 'Auto-optimize machine allocation based on deadlines and material availability.' },
            { title: 'Computer Vision QC', icon: Eye, desc: 'Automated defect detection for high-volume print runs using camera feeds.' },
            { title: 'WhatsApp Alerts', icon: MessageCircle, desc: 'Automated status updates and approval requests sent directly to clients.' },
          ].map((feature, i) => (
            <div key={i} className="relative bg-brand-card border border-brand-border rounded-xl p-6 overflow-hidden group">
              <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Lock className="text-brand-text-muted mb-2" size={24} />
                <span className="bg-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-brand-primary/30">Full Build Feature</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center text-brand-text-muted border border-brand-border">
                  <feature.icon size={24} />
                </div>
                <h4 className="font-semibold text-brand-text">{feature.title}</h4>
              </div>
              <p className="text-sm text-brand-text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
