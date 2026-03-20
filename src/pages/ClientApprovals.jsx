import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Image as ImageIcon, Send, MessageSquare } from 'lucide-react';
import { approvals } from '../data/mockData';
import { cn } from '../components/layout/Sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ClientApprovals() {
  const [items, setItems] = useState(approvals);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const pendingItems = items.filter(i => i.status === 'Pending');
  const approvedItems = items.filter(i => i.status === 'Approved');

  const handleApprove = () => {
    setItems(items.map(i => i.id === selectedItem.id ? { ...i, status: 'Approved' } : i));
    setIsApproveModalOpen(false);
    setSelectedItem(null);
    toast.success('Design approved. Job moved to Pre-Press.');
  };

  const handleRevision = (e) => {
    e.preventDefault();
    setIsRevisionModalOpen(false);
    setSelectedItem(null);
    toast.success('Revision sent to client');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-brand-text">Pending Approvals</h2>
          <span className="bg-amber-500/20 text-amber-500 text-sm font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
            {pendingItems.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 space-y-4">
          {pendingItems.map((item) => (
            <div key={item.id} className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 group hover:border-brand-primary/50 transition-colors">
              <div className="w-full sm:w-32 h-32 rounded-lg bg-brand-bg border border-brand-border flex flex-col items-center justify-center text-brand-text-muted shrink-0 relative overflow-hidden group-hover:border-brand-primary/30 transition-colors">
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-brand-card px-2 py-1 rounded-md border border-brand-border">{item.jobType}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                  <span className="text-xs font-medium text-brand-text">View Proof</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-brand-text-muted bg-brand-bg px-2 py-0.5 rounded border border-brand-border">{item.id}</span>
                      <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">{item.round}</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md", item.daysWaiting > 3 ? "bg-red-500/10 text-red-500" : "bg-brand-bg text-brand-text-muted")}>
                      <Clock size={12} />
                      {item.daysWaiting} {item.daysWaiting === 1 ? 'day' : 'days'} waiting
                    </div>
                  </div>
                  <h3 className="font-semibold text-brand-text text-lg">{item.client}</h3>
                  <p className="text-sm text-brand-text-muted">{item.company}</p>
                  <p className="text-xs text-brand-text-muted mt-2">Sent on {item.dateSent}</p>
                </div>

                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                  <button 
                    onClick={() => { setSelectedItem(item); setIsApproveModalOpen(true); }}
                    className="flex-1 sm:flex-none bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Mark Approved
                  </button>
                  <button 
                    onClick={() => { setSelectedItem(item); setIsRevisionModalOpen(true); }}
                    className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Request Revision
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingItems.length === 0 && (
            <div className="bg-brand-card border border-brand-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <CheckCircle2 size={48} className="text-brand-primary mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-brand-text mb-2">All caught up!</h3>
              <p className="text-brand-text-muted">There are no pending approvals at the moment.</p>
            </div>
          )}

          {approvedItems.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-brand-text mb-4 flex items-center gap-2">
                Recently Approved
                <span className="bg-brand-primary/20 text-brand-primary text-xs font-bold px-2 py-0.5 rounded-full border border-brand-primary/30">
                  {approvedItems.length}
                </span>
              </h3>
              <div className="space-y-3">
                {approvedItems.map(item => (
                  <div key={item.id} className="bg-brand-bg border border-brand-border rounded-lg p-3 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-text">{item.client} — {item.jobType}</p>
                        <p className="text-xs text-brand-text-muted">{item.id} • Approved today</p>
                      </div>
                    </div>
                    <button className="text-xs text-brand-primary hover:underline font-medium">View Job</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-6 h-fit sticky top-6">
          <h3 className="text-lg font-semibold text-brand-text mb-6">Approval Timeline</h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-brand-border before:to-transparent">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-brand-card bg-amber-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                <Clock size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-brand-bg p-4 rounded-xl border border-brand-border shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-brand-text text-sm">Round 2 Sent</span>
                  <span className="text-xs text-brand-text-muted">Today, 10:30 AM</span>
                </div>
                <p className="text-sm text-brand-text-muted">Waiting for client feedback on revised colors.</p>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-brand-card bg-red-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                <XCircle size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-brand-bg p-4 rounded-xl border border-brand-border shadow opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-brand-text text-sm">Revision Requested</span>
                  <span className="text-xs text-brand-text-muted">Yesterday</span>
                </div>
                <p className="text-sm text-brand-text-muted">"Please make the logo 20% larger and use the darker green."</p>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-brand-card bg-blue-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                <Send size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-brand-bg p-4 rounded-xl border border-brand-border shadow opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-brand-text text-sm">Round 1 Sent</span>
                  <span className="text-xs text-brand-text-muted">Mar 16</span>
                </div>
                <p className="text-sm text-brand-text-muted">Initial design concepts sent for review.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-brand-border text-center">
            <p className="text-sm text-brand-text-muted mb-4">Select an item to view its specific timeline.</p>
            <button className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover flex items-center justify-center gap-2 mx-auto">
              <MessageSquare size={16} /> View Client Messages
            </button>
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      <Dialog open={isRevisionModalOpen} onOpenChange={setIsRevisionModalOpen}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <XCircle size={20} className="text-red-500" />
              Request Revision
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRevision} className="space-y-4 mt-4">
            <div className="bg-brand-bg border border-brand-border rounded-lg p-3 flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-brand-text">{selectedItem?.client}</p>
                <p className="text-xs text-brand-text-muted">{selectedItem?.jobType} • {selectedItem?.id}</p>
              </div>
              <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full border border-brand-primary/20">
                Moving to Round {selectedItem ? parseInt(selectedItem.round.split(' ')[1]) + 1 : 2}
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-brand-text-muted">Revision Categories</label>
              <div className="grid grid-cols-2 gap-3">
                {['Color/Branding', 'Dimensions/Size', 'Text/Copy', 'Layout/Structure', 'Images/Assets', 'Other'].map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-brand-bg transition-colors border border-transparent hover:border-brand-border">
                    <input type="checkbox" className="w-4 h-4 rounded border-brand-border bg-brand-bg text-brand-primary focus:ring-brand-primary" />
                    <span className="text-sm text-brand-text">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-brand-text-muted">Detailed Notes</label>
              <textarea 
                required
                className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary min-h-[100px] text-brand-text" 
                placeholder="Describe the requested changes in detail..."
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-brand-border">
              <button type="button" onClick={() => setIsRevisionModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text transition-colors">Cancel</button>
              <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                <Send size={16} /> Send Revision Request
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 size={20} className="text-brand-primary" />
              Confirm Approval
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-brand-text-muted mb-4">
              Are you sure you want to mark this design as approved? This will move the job to the Pre-Press stage.
            </p>
            <div className="bg-brand-bg border border-brand-border rounded-lg p-3">
              <p className="text-sm font-medium text-brand-text">{selectedItem?.client}</p>
              <p className="text-xs text-brand-text-muted">{selectedItem?.jobType} • {selectedItem?.id}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setIsApproveModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text transition-colors">Cancel</button>
            <button onClick={handleApprove} className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Confirm & Approve
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
