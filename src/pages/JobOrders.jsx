import { useState } from 'react';
import { Plus, LayoutGrid, List, MoreHorizontal, Calendar, User, FileText, CheckCircle2, Circle } from 'lucide-react';
import { jobs, clients } from '../data/mockData';
import StatusBadge from '../components/shared/StatusBadge';
import { cn } from '../components/layout/Sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const stages = ['Design', 'Pre-Press', 'Production', 'QC', 'Finishing', 'Dispatch'];

export default function JobOrders() {
  const [view, setView] = useState('table'); // 'table' or 'kanban'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleCreateJob = (e) => {
    e.preventDefault();
    toast.success('New Job Order created successfully');
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-brand-text">Job Orders</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-brand-card border border-brand-border rounded-md p-1 flex items-center">
            <button 
              onClick={() => setView('table')}
              className={cn("p-1.5 rounded-sm transition-colors", view === 'table' ? "bg-brand-bg text-brand-text shadow-sm" : "text-brand-text-muted hover:text-brand-text")}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={cn("p-1.5 rounded-sm transition-colors", view === 'kanban' ? "bg-brand-bg text-brand-text shadow-sm" : "text-brand-text-muted hover:text-brand-text")}
              title="Kanban View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
                <Plus size={18} />
                New Job Order
              </button>
            </DialogTrigger>
            <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Create Job Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Client</label>
                  <select required className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text">
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id}>{c.name} - {c.company}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Job Type</label>
                    <select required className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text">
                      <option>Banner</option>
                      <option>Signage</option>
                      <option>Brochure</option>
                      <option>Vehicle Wrap</option>
                      <option>Exhibition Stall</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Quantity</label>
                    <input required type="number" min="1" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Size / Dimensions</label>
                    <input type="text" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" placeholder="e.g. 10x20 ft" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Deadline</label>
                    <input required type="date" className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text-muted" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Priority</label>
                    <select required className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text">
                      <option>HIGH</option>
                      <option>MEDIUM</option>
                      <option>LOW</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Assign To</label>
                    <select required className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text">
                      <option>Design Team A</option>
                      <option>Pre-Press Team</option>
                      <option>Production Floor</option>
                      <option>Finishing Team</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-muted">Notes</label>
                  <textarea className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary min-h-[80px]" placeholder="Any special instructions..."></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text transition-colors">Cancel</button>
                  <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Create Job Order</button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === 'table' ? (
        <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/50 border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
                  <th className="px-6 py-4 font-medium">JON</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Job Type</th>
                  <th className="px-6 py-4 font-medium">Qty</th>
                  <th className="px-6 py-4 font-medium">Stage</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                  <th className="px-6 py-4 font-medium">Assigned</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-sm">
                {jobs.map((job) => (
                  <tr 
                    key={job.id} 
                    className="hover:bg-brand-bg/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    <td className="px-6 py-4 font-medium text-brand-text">{job.id}</td>
                    <td className="px-6 py-4 text-brand-text">{job.client}</td>
                    <td className="px-6 py-4 text-brand-text-muted">{job.jobType}</td>
                    <td className="px-6 py-4 text-brand-text-muted">{job.qty}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-brand-bg border border-brand-border text-brand-text px-2.5 py-1 rounded-md text-xs font-medium">
                        {job.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.priority} />
                    </td>
                    <td className="px-6 py-4 text-brand-text-muted">{job.deadline}</td>
                    <td className="px-6 py-4 text-brand-text-muted">{job.assigned}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-brand-text-muted hover:text-brand-text hover:bg-brand-bg rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max">
            {stages.map(stage => {
              const stageJobs = jobs.filter(j => j.stage === stage);
              return (
                <div key={stage} className="w-80 flex flex-col h-full bg-brand-bg/50 rounded-xl border border-brand-border overflow-hidden">
                  <div className="p-4 border-b border-brand-border bg-brand-card flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-brand-text">{stage}</h3>
                      <span className="bg-brand-bg text-brand-text-muted text-xs font-bold px-2 py-0.5 rounded-full border border-brand-border">
                        {stageJobs.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {stageJobs.map(job => (
                      <div 
                        key={job.id} 
                        onClick={() => setSelectedJob(job)}
                        className="bg-brand-card border border-brand-border rounded-lg p-4 hover:border-brand-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-mono text-brand-text-muted">{job.id}</span>
                          <StatusBadge status={job.priority} className="px-1.5 py-0.5 text-[10px]" />
                        </div>
                        <h4 className="font-semibold text-brand-text text-sm mb-1">{job.client}</h4>
                        <p className="text-xs text-brand-text-muted mb-3">{job.jobType} • {job.qty}</p>
                        
                        <div className="flex items-center justify-between text-xs text-brand-text-muted pt-3 border-t border-brand-border/50">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>{job.deadline.split(' ')[0]} {job.deadline.split(' ')[1]}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User size={12} />
                            <span className="truncate max-w-[80px]">{job.assigned.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {stageJobs.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-brand-border rounded-lg flex items-center justify-center text-brand-text-muted text-sm">
                        No jobs in {stage}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Job Detail Side Panel */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[600px] h-[100dvh] sm:h-[85vh] p-0 flex flex-col !left-auto !right-0 sm:!right-4 !top-0 sm:!top-[7.5vh] !translate-x-0 !translate-y-0 rounded-none sm:rounded-xl data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full duration-300">
          {selectedJob && (
            <>
              <div className="p-6 border-b border-brand-border bg-brand-bg shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-brand-text-muted bg-brand-card px-2 py-1 rounded border border-brand-border">{selectedJob.id}</span>
                  <StatusBadge status={selectedJob.priority} />
                </div>
                <h2 className="text-2xl font-bold text-brand-text mb-1">{selectedJob.client}</h2>
                <p className="text-brand-text-muted">{selectedJob.jobType} • {selectedJob.qty}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Progress Bar */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Production Stage</h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-brand-border"></div>
                    <div className="space-y-6 relative">
                      {stages.map((stage, idx) => {
                        const currentIdx = stages.indexOf(selectedJob.stage);
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        
                        return (
                          <div key={stage} className="flex items-center gap-4">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center z-10 border-2",
                              isPast ? "bg-brand-primary border-brand-primary text-white" : 
                              isCurrent ? "bg-brand-bg border-brand-primary text-brand-primary" : 
                              "bg-brand-bg border-brand-border text-brand-text-muted"
                            )}>
                              {isPast ? <CheckCircle2 size={16} /> : <Circle size={12} className={isCurrent ? "fill-brand-primary" : ""} />}
                            </div>
                            <span className={cn(
                              "font-medium",
                              isPast ? "text-brand-text" : 
                              isCurrent ? "text-brand-primary font-bold" : 
                              "text-brand-text-muted"
                            )}>{stage}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4 bg-brand-bg border border-brand-border rounded-xl p-4">
                  <div>
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium mb-1">Deadline</p>
                    <p className="text-sm font-medium text-brand-text">{selectedJob.deadline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium mb-1">Assigned To</p>
                    <p className="text-sm font-medium text-brand-text">{selectedJob.assigned}</p>
                  </div>
                  <div className="col-span-2 pt-3 border-t border-brand-border">
                    <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium mb-2">Specifications</p>
                    <p className="text-sm text-brand-text-muted leading-relaxed">
                      Standard material, matte finish. Ensure color matching with previous batch. Client requires delivery before 5 PM on the deadline date.
                    </p>
                  </div>
                </div>

                {/* Files */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-text mb-3 uppercase tracking-wider">Attached Files</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-brand-bg border border-brand-border rounded-lg hover:border-brand-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-card rounded-md text-brand-text-muted">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-text">artwork_final_v2.pdf</p>
                          <p className="text-xs text-brand-text-muted">24.5 MB • Uploaded yesterday</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-brand-bg border border-brand-border rounded-lg hover:border-brand-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-card rounded-md text-brand-text-muted">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-text">client_po_1029.pdf</p>
                          <p className="text-xs text-brand-text-muted">1.2 MB • Uploaded 2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Log */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Activity Log</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center shrink-0 mt-1">
                        <User size={14} className="text-brand-text-muted" />
                      </div>
                      <div>
                        <p className="text-sm text-brand-text"><span className="font-medium">Admin User</span> moved job to {selectedJob.stage}</p>
                        <p className="text-xs text-brand-text-muted mt-0.5">Today at 10:45 AM</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center shrink-0 mt-1">
                        <User size={14} className="text-brand-text-muted" />
                      </div>
                      <div>
                        <p className="text-sm text-brand-text"><span className="font-medium">System</span> generated Job Order</p>
                        <p className="text-xs text-brand-text-muted mt-0.5">Mar 15, 2026 at 09:00 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-brand-border bg-brand-bg shrink-0">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="w-full bg-brand-card border border-brand-border rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-brand-primary text-brand-text"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
