import { useState } from 'react';
import { Plus, MoreHorizontal, FileText, Download, Send, Save } from 'lucide-react';
import { quotes, clients } from '../data/mockData';
import StatusBadge from '../components/shared/StatusBadge';
import KPICard from '../components/shared/KPICard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Quotations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [quoteData, setQuoteData] = useState({
    client: '',
    jobType: '',
    quantity: 1,
    size: '',
    requirements: '',
    materialCost: 0,
    printingCost: 0,
    finishingCost: 0,
    installCost: 0,
    transportCost: 0,
    margin: 20,
    includeInstall: false
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  
  const subtotal = Number(quoteData.materialCost) + Number(quoteData.printingCost) + Number(quoteData.finishingCost) + (quoteData.includeInstall ? Number(quoteData.installCost) : 0) + Number(quoteData.transportCost);
  const total = subtotal * (1 + quoteData.margin / 100);

  const handleSend = () => {
    toast.success('Quote sent to client successfully');
    setIsModalOpen(false);
    setStep(1);
  };

  const handleSave = () => {
    toast.success('Quote saved as draft');
    setIsModalOpen(false);
    setStep(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-brand-text">Quotations</h2>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
              <Plus size={18} />
              Create Quote
            </button>
          </DialogTrigger>
          <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText size={20} className="text-brand-primary" />
                Create New Quotation
                <span className="ml-auto text-sm font-normal text-brand-text-muted">Step {step} of 3</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              {/* Progress Bar */}
              <div className="w-full bg-brand-bg rounded-full h-2 mb-6 border border-brand-border overflow-hidden">
                <div 
                  className="bg-brand-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>

              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-lg font-medium text-brand-text mb-4">Job Details</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Select Client</label>
                    <select 
                      className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text"
                      value={quoteData.client}
                      onChange={e => setQuoteData({...quoteData, client: e.target.value})}
                    >
                      <option value="">Select a client...</option>
                      {clients.map(c => <option key={c.id} value={c.name}>{c.name} - {c.company}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text-muted">Job Type</label>
                      <select 
                        className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text"
                        value={quoteData.jobType}
                        onChange={e => setQuoteData({...quoteData, jobType: e.target.value})}
                      >
                        <option value="">Select type...</option>
                        <option>Banner</option>
                        <option>Signage</option>
                        <option>Brochure</option>
                        <option>Vehicle Wrap</option>
                        <option>Exhibition Stall</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text-muted">Quantity</label>
                      <input 
                        type="number" min="1" 
                        className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" 
                        value={quoteData.quantity}
                        onChange={e => setQuoteData({...quoteData, quantity: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Size / Dimensions</label>
                    <input 
                      type="text" 
                      className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" 
                      placeholder="e.g. 10x20 ft"
                      value={quoteData.size}
                      onChange={e => setQuoteData({...quoteData, size: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text-muted">Special Requirements</label>
                    <textarea 
                      className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary min-h-[80px]" 
                      placeholder="Any specific materials, finishes, etc."
                      value={quoteData.requirements}
                      onChange={e => setQuoteData({...quoteData, requirements: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-lg font-medium text-brand-text mb-4">Cost Breakdown (PKR)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text-muted">Material Cost</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted text-sm">Rs</span>
                        <input type="number" className="w-full bg-brand-bg border border-brand-border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-brand-primary" value={quoteData.materialCost} onChange={e => setQuoteData({...quoteData, materialCost: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text-muted">Printing Cost</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted text-sm">Rs</span>
                        <input type="number" className="w-full bg-brand-bg border border-brand-border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-brand-primary" value={quoteData.printingCost} onChange={e => setQuoteData({...quoteData, printingCost: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text-muted">Finishing Cost</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted text-sm">Rs</span>
                        <input type="number" className="w-full bg-brand-bg border border-brand-border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-brand-primary" value={quoteData.finishingCost} onChange={e => setQuoteData({...quoteData, finishingCost: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-text-muted">Transport Cost</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted text-sm">Rs</span>
                        <input type="number" className="w-full bg-brand-bg border border-brand-border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-brand-primary" value={quoteData.transportCost} onChange={e => setQuoteData({...quoteData, transportCost: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 pb-2 border-y border-brand-border my-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={quoteData.includeInstall}
                        onChange={e => setQuoteData({...quoteData, includeInstall: e.target.checked})}
                        className="w-4 h-4 rounded border-brand-border bg-brand-bg text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm font-medium text-brand-text">Include Installation</span>
                    </label>
                    {quoteData.includeInstall && (
                      <div className="mt-3 relative w-1/2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted text-sm">Rs</span>
                        <input type="number" className="w-full bg-brand-bg border border-brand-border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-brand-primary" value={quoteData.installCost} onChange={e => setQuoteData({...quoteData, installCost: e.target.value})} placeholder="Installation Cost" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-text-muted">Subtotal</span>
                      <span className="font-medium">PKR {subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-brand-text-muted">Margin ({quoteData.margin}%)</label>
                        <span className="font-medium">PKR {(subtotal * (quoteData.margin / 100)).toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" max="40" step="5"
                        value={quoteData.margin}
                        onChange={e => setQuoteData({...quoteData, margin: e.target.value})}
                        className="w-full accent-brand-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                      <span className="text-lg font-bold text-brand-text">Total Amount</span>
                      <span className="text-2xl font-bold text-brand-primary">PKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-inner">
                    <div className="flex items-start justify-between border-b border-brand-border pb-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-brand-text tracking-tight">BRANDLINE</h2>
                        <p className="text-xs text-brand-text-muted mt-1">Print Production & Branding</p>
                      </div>
                      <div className="text-right">
                        <h3 className="text-lg font-semibold text-brand-text">QUOTATION</h3>
                        <p className="text-xs text-brand-text-muted mt-1">Date: {new Date().toLocaleDateString()}</p>
                        <p className="text-xs text-brand-text-muted">Valid for: 7 days</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-xs text-brand-text-muted uppercase tracking-wider font-semibold mb-1">Prepared For:</p>
                      <p className="font-medium text-brand-text">{quoteData.client || 'Client Name'}</p>
                    </div>

                    <table className="w-full text-sm mb-6">
                      <thead className="border-b border-brand-border text-brand-text-muted">
                        <tr>
                          <th className="text-left py-2 font-medium">Description</th>
                          <th className="text-center py-2 font-medium">Qty</th>
                          <th className="text-right py-2 font-medium">Amount (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/50">
                        <tr>
                          <td className="py-3">
                            <p className="font-medium text-brand-text">{quoteData.jobType || 'Job Type'}</p>
                            <p className="text-xs text-brand-text-muted mt-0.5">Size: {quoteData.size || 'N/A'}</p>
                          </td>
                          <td className="py-3 text-center text-brand-text">{quoteData.quantity}</td>
                          <td className="py-3 text-right text-brand-text">{total.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-end border-t border-brand-border pt-4">
                      <div className="w-1/2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-brand-text-muted">Subtotal</span>
                          <span className="text-brand-text">{total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-brand-text-muted">Tax (0%)</span>
                          <span className="text-brand-text">0</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-brand-border">
                          <span className="text-brand-text">Total</span>
                          <span className="text-brand-primary">PKR {total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-between items-center border-t border-brand-border mt-6">
                {step > 1 ? (
                  <button type="button" onClick={handleBack} className="px-4 py-2 rounded-md text-sm font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text transition-colors">Back</button>
                ) : <div></div>}
                
                <div className="flex gap-3">
                  {step < 3 ? (
                    <button type="button" onClick={handleNext} className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">Next</button>
                  ) : (
                    <>
                      <button type="button" onClick={handleSave} className="px-4 py-2 bg-brand-bg border border-brand-border hover:bg-brand-card text-brand-text rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                        <Save size={16} /> Save Draft
                      </button>
                      <button type="button" onClick={handleSend} className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                        <Send size={16} /> Send to Client
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Quotes" value="18" icon={FileText} colorClass="bg-brand-bg text-brand-text-muted" />
        <KPICard title="Approved" value="11" icon={FileText} colorClass="bg-brand-primary/15 text-brand-primary" />
        <KPICard title="Pending" value="4" icon={FileText} colorClass="bg-blue-500/15 text-blue-500" />
        <KPICard title="Rejected" value="3" icon={FileText} colorClass="bg-red-500/15 text-red-500" />
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50 border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
                <th className="px-6 py-4 font-medium">Quote ID</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Job Type</th>
                <th className="px-6 py-4 font-medium">Amount (PKR)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date Sent</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-sm">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-brand-bg/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-text">{quote.id}</td>
                  <td className="px-6 py-4 text-brand-text">{quote.client}</td>
                  <td className="px-6 py-4 text-brand-text-muted">{quote.jobType}</td>
                  <td className="px-6 py-4 font-medium text-brand-text">PKR {quote.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={quote.status} />
                  </td>
                  <td className="px-6 py-4 text-brand-text-muted">{quote.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors" title="Download PDF">
                        <Download size={16} />
                      </button>
                      <button className="p-1.5 text-brand-text-muted hover:text-brand-text hover:bg-brand-bg rounded-md transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
