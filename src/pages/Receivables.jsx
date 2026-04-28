import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { 
  collection, onSnapshot, query, where, 
  updateDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Banknote, MessageCircle, Search, Filter, 
  Clock, AlertTriangle, CheckCircle, ExternalLink,
  Copy, Loader2, User, Receipt, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['Not Contacted', 'Reminded', 'Promised', 'Escalated', 'Disputed'];

const toDate = (val) => {
  if (!val) return null;
  if (val?.toDate) return val.toDate(); // Firestore Timestamp
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export default function Receivables() {
  const { currentUser, userProfile } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reminderModal, setReminderModal] = useState(null);
  const [bulkReminderModal, setBulkReminderModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);

  useEffect(() => {
    // Fetch outstanding invoices
    const q = query(
      collection(db, 'invoices'), 
      where('status', 'in', ['sent', 'overdue'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubscribeClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      unsubscribeClients();
    };
  }, []);

  const calculateOverdue = (val) => {
    const due = toDate(val);
    if (!due) return 0;
    const today = new Date();
    const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const stats = useMemo(() => {
    const outstandingInvoices = invoices.filter(inv => 
      inv.status === 'sent' || inv.status === 'overdue'
    );
    const total = outstandingInvoices.reduce((sum, inv) => {
      return sum + (Number(inv.totalAmount) || Number(inv.total) || 0);
    }, 0);
    const overdue30 = invoices.filter(inv => calculateOverdue(inv.dueDate) > 30).reduce((sum, inv) => {
      return sum + (Number(inv.totalAmount) || Number(inv.total) || 0);
    }, 0);
    const clientCount = new Set(invoices.map(inv => inv.clientName)).size;

    return { total, overdue30, clientCount };
  }, [invoices]);

  const filteredInvoices = invoices.filter(inv => {
    const days = calculateOverdue(inv.dueDate);
    const matchesTab = 
      activeTab === 'All' || 
      (activeTab === 'Current' && days <= 0) ||
      (activeTab === 'Overdue' && days > 0 && days <= 30) ||
      (activeTab === 'Critical' && days > 30);
    
    const matchesSearch = 
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTab && matchesSearch;
  });

  const getWhatsAppMessage = (inv) => {
    const amount = Number(inv.totalAmount) || Number(inv.total) || 0;
    const dueDate = toDate(inv.dueDate);
    return `Assalamu Alaikum ${inv.clientName}!

I hope you are doing well.

This is a gentle reminder for Invoice *[${inv.invoiceNumber}]* — *PKR ${amount.toLocaleString('en-PK')}* is currently outstanding.

Kindly arrange payment at your earliest convenience.

🏦 *Bank Details:*
Meezan Bank
Account Title: Brandline Advertising
Account No: 0123-4567890-1

JazakAllah Khair 🙏

*Brandline*
+92 324-8488766`;
  };

  const handleUpdateStatus = async (invId, status) => {
    try {
      await updateDoc(doc(db, 'invoices', invId), {
        receivableStatus: status,
        updatedAt: serverTimestamp()
      });
      toast.success('Follow-up status updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied!');
  };

  const openWhatsApp = (inv) => {
    const msg = encodeURIComponent(getWhatsAppMessage(inv));
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    handleUpdateStatus(inv.id, 'Reminded');
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-brand-text-muted font-bold">Fetching Receivables...</p>
      </div>
    );
  }

  const overdue30Count = invoices.filter(inv => calculateOverdue(inv.dueDate) > 30).length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Receivables</h1>
          <p className="text-brand-text-muted mt-1">Outstanding payments and collections</p>
        </div>
        
        <button 
          onClick={() => setBulkReminderModal(true)}
          className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-500 border border-green-600/30 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg"
        >
          <MessageCircle size={18} />
          Send WhatsApp Reminder
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Outstanding', value: stats.total, icon: Banknote, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { 
            label: 'Overdue (30+ Days)', 
            value: stats.overdue30, 
            icon: AlertTriangle, 
            color: 'text-red-500', 
            bg: 'bg-red-500/10',
            pulse: overdue30Count > 0 
          },
          { label: 'Pending Clients', value: stats.clientCount, icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' }
        ].map(stat => (
          <div key={stat.label} className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-black ${stat.color}`}>
                    {typeof stat.value === 'number' && stat.label !== 'Pending Clients' ? `PKR ${stat.value.toLocaleString()}` : stat.value}
                  </p>
                  {stat.pulse && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  )}
                </div>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {overdue30Count > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-8 flex items-center gap-3 text-red-500 font-bold text-sm animate-in slide-in-from-top-2">
          <AlertTriangle size={20} className="animate-bounce" />
          <span>⚠ {overdue30Count} invoices are 30+ days overdue. Immediate follow-up required.</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-brand-card border border-brand-border p-4 rounded-2xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex bg-brand-bg p-1 rounded-xl w-full lg:w-auto">
          {['All', 'Current', 'Overdue', 'Critical'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
          <input 
            type="text"
            placeholder="Search by client name or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Receivables Table */}
      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-brand-bg/50 text-brand-text-muted border-b border-brand-border">
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Client</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Invoice #</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase text-right">Amount (PKR)</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase text-center">Due Date</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase text-center">Overdue</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Follow-up</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredInvoices.map(inv => {
                const overdueDays = calculateOverdue(inv.dueDate);
                return (
                  <tr 
                    key={inv.id} 
                    className={`hover:bg-brand-bg/30 transition-colors ${
                      overdueDays > 30 ? 'bg-red-500/[0.03]' : 
                      overdueDays > 0 ? 'bg-amber-500/[0.02]' : ''
                    }`}
                  >
                    <td className={`px-6 py-4 border-l-4 ${
                      overdueDays > 30 ? 'border-red-500' :
                      overdueDays > 7 ? 'border-orange-500' :
                      overdueDays > 0 ? 'border-amber-500' :
                      'border-transparent'
                    }`}>
                      <div className="font-bold text-xs">{inv.clientName}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-brand-primary font-bold">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-right font-black text-brand-text">
                      {(Number(inv.totalAmount) || Number(inv.total) || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="px-6 py-4 text-center text-xs">
                      {toDate(inv.dueDate) 
                        ? toDate(inv.dueDate).toLocaleDateString('en-PK', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      {overdueDays > 0 ? (
                        <span className="text-red-500 font-bold text-xs">{overdueDays} days</span>
                      ) : (
                        <span className="text-green-500 font-bold text-xs">Due in {Math.abs(overdueDays)} days</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={inv.receivableStatus || 'Not Contacted'}
                        onChange={(e) => handleUpdateStatus(inv.id, e.target.value)}
                        className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-[10px] font-bold focus:outline-none"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setReminderModal(inv)}
                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                          title="WhatsApp Reminder"
                        >
                          <MessageCircle size={14} />
                        </button>
                        <button 
                          onClick={() => window.open(`/invoices?id=${inv.id}`, '_blank')}
                          className="p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-white transition-all"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <CheckCircle size={48} className="text-brand-primary/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-1">All clear — no outstanding receivables</h3>
                    <p className="text-brand-text-muted">All invoices have been collected.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {reminderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-card border border-brand-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="p-6 border-b border-brand-border bg-green-500/10 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-green-500">
                <MessageCircle size={22} />
                WhatsApp — {reminderModal.clientName}
              </h2>
              <button onClick={() => setReminderModal(null)} className="text-brand-text-muted hover:text-white transition-colors">
                <AlertTriangle size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-brand-bg rounded-xl p-4 border border-brand-border relative">
                <textarea 
                  className="w-full bg-transparent text-sm h-64 focus:outline-none resize-none custom-scrollbar leading-relaxed"
                  value={getWhatsAppMessage(reminderModal)}
                  readOnly
                />
                <button 
                  onClick={() => copyToClipboard(getWhatsAppMessage(reminderModal))}
                  className="absolute bottom-4 right-4 bg-brand-card border border-brand-border p-2 rounded-lg hover:text-brand-primary transition-all shadow-xl"
                  title="Copy Message"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setReminderModal(null)}
                  className="flex-1 py-3 rounded-xl border border-brand-border font-bold hover:bg-brand-bg transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    openWhatsApp(reminderModal);
                    setReminderModal(null);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  Open WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State / Seed Data logic not needed here as it reads from existing invoices */}
    </div>
  );
}
