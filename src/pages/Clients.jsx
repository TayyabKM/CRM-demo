import { useState } from 'react';
import { Search, Plus, MoreHorizontal, FileText, Briefcase, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { clients } from '../data/mockData';
import StatusBadge from '../components/shared/StatusBadge';
import { cn } from '../components/layout/Sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedClient, setSelectedClient] = useState(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || client.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-brand-text">Clients & CRM</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
              <Plus size={18} />
              Add New Client
            </button>
          </DialogTrigger>
          <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add New Client</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Contact Name</label>
                  <input type="text" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. Ali Khan" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Company</label>
                  <input type="text" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. ABC Corp" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Phone</label>
                  <input type="tel" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="03XX-XXXXXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Email</label>
                  <input type="email" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="email@company.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-text-muted">Address</label>
                <input type="text" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="Full address" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-text-muted">Payment Terms</label>
                <select className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text">
                  <option>Advance (100%)</option>
                  <option>50% Advance, 50% on Delivery</option>
                  <option>Net 15 Days</option>
                  <option>Net 30 Days</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-text-muted">Notes</label>
                <textarea className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary min-h-[80px]" placeholder="Any special instructions or notes..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" className="px-4 py-2 rounded-md text-sm font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text transition-colors">Cancel</button>
                <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Save Client</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-md pl-10 pr-4 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-brand-text-muted">Filter:</span>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-primary"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50 border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Total Jobs</th>
                <th className="px-6 py-4 font-medium">Last Order</th>
                <th className="px-6 py-4 font-medium">Outstanding</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-sm">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  className="hover:bg-brand-bg/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <td className="px-6 py-4 font-medium text-brand-text flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-brand-text-muted">{client.company}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-brand-text-muted">
                      <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={12} /> {client.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-brand-text-muted">{client.totalJobs}</td>
                  <td className="px-6 py-4 text-brand-text-muted">{client.lastOrder}</td>
                  <td className="px-6 py-4 font-medium text-brand-text">
                    {client.outstanding > 0 ? (
                      <span className="text-red-400">PKR {client.outstanding.toLocaleString()}</span>
                    ) : (
                      <span className="text-brand-text-muted">PKR 0</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-brand-text-muted hover:text-brand-text hover:bg-brand-bg rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-brand-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={32} className="mb-3 opacity-20" />
                      <p>No clients found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail Modal */}
      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[700px] p-0 overflow-hidden">
          {selectedClient && (
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Header */}
              <div className="bg-brand-bg p-6 border-b border-brand-border flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-2xl shrink-0">
                    {selectedClient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-brand-text">{selectedClient.name}</h2>
                    <p className="text-brand-text-muted flex items-center gap-2 mt-1">
                      <Building2 size={14} /> {selectedClient.company}
                    </p>
                  </div>
                </div>
                <StatusBadge status={selectedClient.status} />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium">Phone</p>
                    <p className="text-sm font-medium flex items-center gap-2"><Phone size={14} className="text-brand-primary" /> {selectedClient.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium">Email</p>
                    <p className="text-sm font-medium flex items-center gap-2"><Mail size={14} className="text-brand-primary" /> {selectedClient.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium">Address</p>
                    <p className="text-sm font-medium flex items-center gap-2"><MapPin size={14} className="text-brand-primary" /> Karachi, Pakistan</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-brand-bg border border-brand-border rounded-lg p-4 text-center">
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium mb-1">Total Jobs</p>
                    <p className="text-xl font-bold text-brand-text">{selectedClient.totalJobs}</p>
                  </div>
                  <div className="bg-brand-bg border border-brand-border rounded-lg p-4 text-center">
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium mb-1">Total Revenue</p>
                    <p className="text-xl font-bold text-brand-text">PKR {(selectedClient.totalJobs * 45000).toLocaleString()}</p>
                  </div>
                  <div className="bg-brand-bg border border-brand-border rounded-lg p-4 text-center">
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium mb-1">Outstanding</p>
                    <p className={cn("text-xl font-bold", selectedClient.outstanding > 0 ? "text-red-400" : "text-brand-text")}>
                      PKR {selectedClient.outstanding.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Recent Jobs */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Recent Jobs</h3>
                  <div className="border border-brand-border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-brand-bg border-b border-brand-border text-brand-text-muted">
                        <tr>
                          <th className="px-4 py-2 font-medium">JON</th>
                          <th className="px-4 py-2 font-medium">Type</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {[1, 2, 3, 4].map((i) => (
                          <tr key={i} className="hover:bg-brand-bg/50">
                            <td className="px-4 py-3 font-medium">BL-2026-0{50 - i}</td>
                            <td className="px-4 py-3 text-brand-text-muted">{i % 2 === 0 ? 'Vehicle Wrap' : 'Exhibition Stall'}</td>
                            <td className="px-4 py-3 text-brand-text-muted">1{i} Mar 2026</td>
                            <td className="px-4 py-3"><StatusBadge status={i === 1 ? 'In Production' : 'Dispatched'} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-text mb-2 uppercase tracking-wider">Notes</h3>
                  <textarea 
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-primary min-h-[100px] text-brand-text-muted"
                    defaultValue={`Preferred payment terms: 50% advance.\nUsually requires fast turnaround for exhibition materials.\nContact person for billing is different.`}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-brand-bg p-4 border-t border-brand-border flex justify-end gap-3">
                <button className="px-4 py-2 bg-brand-card border border-brand-border hover:bg-brand-border text-brand-text rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                  <FileText size={16} /> Create Quote
                </button>
                <button className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                  <Briefcase size={16} /> New Job Order
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
