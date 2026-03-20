import { useState } from 'react';
import { Plus, Calendar, User, Flag, MoreHorizontal } from 'lucide-react';
import { inquiries } from '../data/mockData';
import { cn } from '../components/layout/Sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const columns = ['New Inquiry', 'Contacted', 'Quoted', 'Converted', 'Lost'];

export default function Inquiries() {
  const [board, setBoard] = useState(inquiries);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddInquiry = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newInquiry = {
      id: Date.now(),
      client: formData.get('clientName'),
      jobType: formData.get('jobType'),
      date: 'Just now',
      rep: formData.get('assignedTo'),
      priority: formData.get('priority'),
      stage: 'New Inquiry'
    };
    
    setBoard([newInquiry, ...board]);
    setIsAddModalOpen(false);
    toast.success('New inquiry added successfully');
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">Inquiries & Leads</h2>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
              <Plus size={18} />
              New Inquiry
            </button>
          </DialogTrigger>
          <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">New Inquiry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddInquiry} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Client Name</label>
                  <input name="clientName" required type="text" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. ABC Corp" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Phone</label>
                  <input name="phone" type="tel" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="03XX-XXXXXXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Job Type</label>
                  <select name="jobType" required className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text">
                    <option>Banner</option>
                    <option>Signage</option>
                    <option>Brochure</option>
                    <option>Vehicle Wrap</option>
                    <option>Exhibition Stall</option>
                    <option>Flex</option>
                    <option>Packaging</option>
                    <option>Standee</option>
                    <option>Window Graphics</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Size / Dimensions</label>
                  <input name="size" type="text" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. 10x20 ft" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Quantity</label>
                  <input name="quantity" type="number" min="1" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Deadline</label>
                  <input name="deadline" type="date" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Assigned To</label>
                  <select name="assignedTo" required className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text">
                    <option>Ali Hassan</option>
                    <option>Maria Khan</option>
                    <option>Sara Ahmed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Priority</label>
                  <select name="priority" required className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-text-muted">Notes</label>
                <textarea name="notes" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary min-h-[80px]" placeholder="Any special instructions or notes..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text transition-colors">Cancel</button>
                <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Save Inquiry</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(col => {
            const colItems = board.filter(item => item.stage === col);
            return (
              <div key={col} className="w-80 flex flex-col h-full bg-brand-bg/50 rounded-xl border border-brand-border overflow-hidden">
                <div className="p-4 border-b border-brand-border bg-brand-card flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-brand-text">{col}</h3>
                    <span className="bg-brand-bg text-brand-text-muted text-xs font-bold px-2 py-0.5 rounded-full border border-brand-border">
                      {colItems.length}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-brand-bg rounded-md text-brand-text-muted hover:text-brand-text transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {colItems.map(item => (
                    <div key={item.id} className="bg-brand-card border border-brand-border rounded-lg p-4 hover:border-brand-primary/50 transition-colors cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-brand-text text-sm leading-tight">{item.client}</h4>
                        <button className="text-brand-text-muted hover:text-brand-text opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <span className="inline-block bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs px-2 py-1 rounded-md font-medium">
                          {item.jobType}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs text-brand-text-muted">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-brand-text-muted/70" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-brand-text-muted/70" />
                          <span>{item.rep}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-brand-border/50">
                          <Flag size={14} className={cn(
                            item.priority === 'High' ? 'text-red-500' : 
                            item.priority === 'Medium' ? 'text-amber-500' : 'text-brand-text-muted'
                          )} />
                          <span className={cn(
                            "font-medium",
                            item.priority === 'High' ? 'text-red-500' : 
                            item.priority === 'Medium' ? 'text-amber-500' : 'text-brand-text-muted'
                          )}>{item.priority} Priority</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {colItems.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-brand-border rounded-lg flex items-center justify-center text-brand-text-muted text-sm">
                      Drop items here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
