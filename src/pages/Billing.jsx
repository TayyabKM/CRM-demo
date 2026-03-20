import { useState } from 'react';
import { Search, Filter, Download, Send, CreditCard, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { invoices } from '../data/mockData';
import StatusBadge from '../components/shared/StatusBadge';
import KPICard from '../components/shared/KPICard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.jon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    toast.success('Invoice PDF downloaded successfully');
  };

  const handleSend = () => {
    toast.success('Invoice sent to client via email');
    setIsPreviewModalOpen(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">Billing & Invoicing</h2>
        <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
          <FileText size={16} /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Billed (YTD)" value="PKR 4.2M" icon={CreditCard} color="blue" />
        <KPICard title="Collected" value="PKR 3.1M" icon={CheckCircle2} color="green" />
        <KPICard title="Outstanding" value="PKR 850K" icon={Clock} color="amber" />
        <KPICard title="Overdue" value="PKR 250K" icon={AlertCircle} color="red" />
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-brand-bg/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search invoices, clients, or JONs..." 
              className="w-full bg-brand-bg border border-brand-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary text-brand-text placeholder:text-brand-text-muted/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-brand-text-muted hover:text-brand-text px-3 py-2 rounded-md border border-brand-border bg-brand-bg hover:bg-brand-card transition-colors text-sm font-medium w-full sm:w-auto justify-center">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-brand-text">
            <thead className="text-xs uppercase bg-brand-bg/80 text-brand-text-muted border-b border-brand-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">JON</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Issue Date</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-brand-bg/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-brand-text">{invoice.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-brand-text">{invoice.client}</div>
                  </td>
                  <td className="px-6 py-4 text-brand-text-muted">{invoice.jon}</td>
                  <td className="px-6 py-4 font-medium text-brand-text">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={invoice.status} type="billing" />
                  </td>
                  <td className="px-6 py-4 text-brand-text-muted">{invoice.issueDate}</td>
                  <td className="px-6 py-4 text-brand-text-muted">{invoice.dueDate}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedInvoice(invoice); setIsPreviewModalOpen(true); }}
                      className="text-brand-primary hover:text-brand-primary-hover font-medium text-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-brand-text-muted">
                    No invoices found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-brand-border bg-brand-bg/50 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText size={20} className="text-brand-primary" />
                Invoice Preview
              </DialogTitle>
              <div className="flex items-center gap-3">
                <button onClick={handleDownload} className="text-brand-text-muted hover:text-brand-text transition-colors p-2 rounded-md hover:bg-brand-bg border border-transparent hover:border-brand-border" title="Download PDF">
                  <Download size={18} />
                </button>
                <button onClick={handleSend} className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                  <Send size={16} /> Send to Client
                </button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 bg-white text-gray-900 font-sans">
            {/* Simulated PDF Document */}
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">INVOICE</h1>
                  <p className="text-gray-500 font-medium">{selectedInvoice?.id}</p>
                </div>
                <div className="text-right">
                  {/* Brandline Logo Placeholder for PDF */}
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#038D46] rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xl leading-none">B</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-gray-900">Brandline</span>
                  </div>
                  <p className="text-sm text-gray-600">123 Agency Row, Phase 5</p>
                  <p className="text-sm text-gray-600">DHA, Lahore, Pakistan</p>
                  <p className="text-sm text-gray-600">hello@brandline.pk</p>
                  <p className="text-sm text-gray-600">+92 300 1234567</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                  <p className="font-bold text-gray-900 text-lg">{selectedInvoice?.client}</p>
                  <p className="text-sm text-gray-600 mt-1">Attn: Accounts Payable</p>
                  <p className="text-sm text-gray-600">Client Address Line 1</p>
                  <p className="text-sm text-gray-600">City, Pakistan</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Date</h3>
                    <p className="font-medium text-gray-900">{selectedInvoice?.issueDate}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</h3>
                    <p className="font-medium text-gray-900">{selectedInvoice?.dueDate}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Job Order No.</h3>
                    <p className="font-medium text-gray-900">{selectedInvoice?.jon}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</h3>
                    <p className="font-medium text-gray-900">{selectedInvoice?.status}</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="text-left py-3 text-sm font-bold text-gray-900 uppercase tracking-wider">Description</th>
                    <th className="text-center py-3 text-sm font-bold text-gray-900 uppercase tracking-wider">Qty</th>
                    <th className="text-right py-3 text-sm font-bold text-gray-900 uppercase tracking-wider">Unit Price</th>
                    <th className="text-right py-3 text-sm font-bold text-gray-900 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4">
                      <p className="font-medium text-gray-900">Print Production Services</p>
                      <p className="text-sm text-gray-500 mt-1">As per Job Order {selectedInvoice?.jon}</p>
                    </td>
                    <td className="py-4 text-center text-gray-900">1</td>
                    <td className="py-4 text-right text-gray-900">{selectedInvoice?.amount}</td>
                    <td className="py-4 text-right font-medium text-gray-900">{selectedInvoice?.amount}</td>
                  </tr>
                  {/* Mock extra item */}
                  <tr>
                    <td className="py-4">
                      <p className="font-medium text-gray-900">Delivery & Logistics</p>
                    </td>
                    <td className="py-4 text-center text-gray-900">1</td>
                    <td className="py-4 text-right text-gray-900">PKR 5,000</td>
                    <td className="py-4 text-right font-medium text-gray-900">PKR 5,000</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-12">
                <div className="w-64">
                  <div className="flex justify-between py-2 text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{selectedInvoice?.amount}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
                    <span>Tax (16%)</span>
                    <span>PKR 0</span> {/* Simplified for mock */}
                  </div>
                  <div className="flex justify-between py-4 text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{selectedInvoice?.amount}</span>
                  </div>
                </div>
              </div>

              {/* Footer / Payment Terms */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Payment Terms & Instructions</h3>
                <p className="text-sm text-gray-600 mb-4">Please pay within 15 days of receiving this invoice. Make all cheques payable to "Brandline".</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-bold text-gray-900 mb-1">Bank Transfer Details:</p>
                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Bank:</span> Standard Chartered Bank</p>
                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Account Title:</span> Brandline (Pvt) Ltd.</p>
                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">IBAN:</span> PK34 SCBL 0000 1234 5678 90</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
