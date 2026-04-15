import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { 
  collection, query, orderBy, onSnapshot,
  updateDoc, doc, serverTimestamp, increment,
  addDoc, getDocs, where, limit, writeBatch,
  deleteDoc, deleteField, getDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Receipt, Plus, Search, Filter, ArrowUpRight, 
  TrendingUp, Clock, AlertCircle, Calendar,
  User, Package, FileText, CheckCircle2,
  MoreVertical, MoreHorizontal, ChevronRight,
  ExternalLink, LayoutGrid, List, Download, 
  Share2, Printer, Trash2, Edit, Save, 
  X, Check, AlertTriangle, ShieldCheck,
  ShieldAlert, Sparkles, Loader2, DollarSign,
  History, Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/layout/Sidebar';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '../components/ui/dialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';

export default function Invoices({ createMode = false }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(createMode);
  
  const { currentUser, userProfile, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Load invoices
  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load invoices");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle highlighted invoice or create mode from location state
  useEffect(() => {
    if (location.state?.highlightId) {
      const inv = invoices.find(i => i.id === location.state.highlightId);
      if (inv) {
        setSelectedInvoice(inv);
        setIsModalOpen(true);
        setIsCreateMode(false);
      }
    }
    if (location.state?.createFromProject || createMode) {
      setIsModalOpen(true);
      setIsCreateMode(true);
    }
  }, [location.state, invoices, createMode]);

  // Filtering & Sorting
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        inv.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.projectName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isOverdueFlag = inv.status === 'sent' && inv.dueDate?.toDate() < new Date();
      const currentStatus = isOverdueFlag ? 'overdue' : inv.status;
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
      
      // Date filtering
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const now = new Date();
        const invDate = inv.createdAt?.toDate();
        if (dateFilter === 'this_month') {
          matchesDate = invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'last_month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          matchesDate = invDate.getMonth() === lastMonth.getMonth() && invDate.getFullYear() === lastMonth.getFullYear();
        } else if (dateFilter === 'last_3_months') {
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          matchesDate = invDate >= threeMonthsAgo;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt?.seconds - a.createdAt?.seconds;
      if (sortBy === 'oldest') return a.createdAt?.seconds - b.createdAt?.seconds;
      if (sortBy === 'highest_amount') return b.totalAmount - a.totalAmount;
      if (sortBy === 'due_soonest') return a.dueDate?.seconds - b.dueDate?.seconds;
      return 0;
    });
  }, [invoices, searchQuery, statusFilter, dateFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    return {
      totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
      collected: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.totalAmount || 0), 0),
      outstanding: invoices.filter(i => i.status === 'sent' || (i.status === 'sent' && i.dueDate?.toDate() < now)).reduce((sum, i) => sum + (i.totalAmount || 0), 0),
      overdue: invoices.filter(i => i.status === 'sent' && i.dueDate?.toDate() < now).reduce((sum, i) => sum + (i.totalAmount || 0), 1).length - 1 // Fix length calculation
    };
  }, [invoices]);
  
  // Re-calculate stats more accurately
  const activeStats = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
    collected: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.totalAmount || 0), 0),
    outstanding: invoices.filter(i => (i.status === 'sent')).reduce((sum, i) => sum + (i.totalAmount || 0), 0),
    overdueCount: invoices.filter(i => i.status === 'sent' && i.dueDate?.toDate() < new Date()).length,
    overdueAmount: invoices.filter(i => i.status === 'sent' && i.dueDate?.toDate() < new Date()).reduce((sum, i) => sum + (i.totalAmount || 0), 0)
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleRowClick = (inv) => {
    setSelectedInvoice(inv);
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (inv) => {
    setSelectedInvoice(inv);
    setIsUpdateStatusModalOpen(true);
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this invoice? This cannot be undone.")) return;
    try {
      const invRef = doc(db, 'invoices', id);
      const invSnap = await getDoc(invRef);
      const invData = invSnap.data();

      const batch = writeBatch(db);
      
      // Delete the invoice
      batch.delete(invRef);

      // Clear the project's invoice link
      if (invData?.projectId) {
        batch.update(doc(db, 'projects', invData.projectId), {
          invoiceId: deleteField(),
          invoiceStatus: deleteField()
        });
      }

      await batch.commit();
      toast.success("Invoice deleted permanently and project link cleared");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-text mb-2">Invoices</h1>
          <p className="text-brand-text-muted font-medium">Manage billing and track organizational performance</p>
        </div>
        
        {hasPermission('createInvoices') && (
          <button 
            onClick={handleCreateInvoice}
            className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Invoice
          </button>
        )}
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Invoiced" value={activeStats.totalInvoiced} icon={TrendingUp} color="text-brand-text" />
        <StatCard label="Collected" value={activeStats.collected} icon={CheckCircle2} color="text-green-500" bg="bg-green-500/10" />
        <StatCard label="Outstanding" value={activeStats.outstanding} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        <StatCard 
          label="Overdue" 
          value={activeStats.overdueAmount} 
          icon={AlertCircle} 
          color="text-red-500" 
          bg="bg-red-500/10"
          alert={activeStats.overdueCount > 0}
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-brand-card p-4 rounded-3xl border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search by invoice #, client, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl pl-12 pr-4 text-brand-text font-medium outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <FilterSelect 
               label="Date Range" 
               value={dateFilter} 
               onChange={setDateFilter}
               options={[
                 { value: 'all', label: 'All Time' },
                 { value: 'this_month', label: 'This Month' },
                 { value: 'last_month', label: 'Last Month' },
                 { value: 'last_3_months', label: 'Last 3 Months' }
               ]}
             />
             <FilterSelect 
               label="Sort By" 
               value={sortBy} 
               onChange={setSortBy}
               options={[
                 { value: 'newest', label: 'Newest First' },
                 { value: 'oldest', label: 'Oldest First' },
                 { value: 'highest_amount', label: 'Highest Amount' },
                 { value: 'due_soonest', label: 'Due Soonest' }
               ]}
             />
          </div>
        </div>
        
        <div className="flex bg-[#3E3E3E] p-1 rounded-2xl border border-brand-border w-fit overflow-x-auto no-scrollbar">
          {['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                statusFilter === tab ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
              )}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50">
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Invoice #</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Project / Ref</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Client</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
              ) : filteredInvoices.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <Receipt size={48} className="text-brand-text-muted opacity-20" />
                         <p className="text-brand-text-muted font-bold italic">No invoices found.</p>
                      </div>
                   </td>
                </tr>
              ) : filteredInvoices.map(inv => (
                <InvoiceRow 
                  key={inv.id} 
                  invoice={inv} 
                  onClick={() => handleRowClick(inv)}
                  onUpdateStatus={() => handleUpdateStatus(inv)}
                  onDownload={() => {
                    toast.info("Generating PDF...");
                    generateInvoicePDF(inv);
                  }}
                  onDelete={() => handleDeleteInvoice(inv.id)}
                  isSuperAdmin={userProfile?.role === 'superadmin' || userProfile?.role === 'admin'}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Modal */}
      {isModalOpen && (
        <InvoiceModal 
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          invoice={selectedInvoice}
          initialCreateFromProject={location.state?.createFromProject}
          isCreateMode={isCreateMode}
          setIsCreateMode={setIsCreateMode}
          onUpdateStatus={() => handleUpdateStatus(selectedInvoice)}
        />
      )}

      {/* Status Update Modal */}
      {isUpdateStatusModalOpen && selectedInvoice && (
        <StatusUpdateModal 
          isOpen={isUpdateStatusModalOpen}
          setIsOpen={setIsUpdateStatusModalOpen}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg = "bg-brand-bg", alert }) {
  return (
    <div className={cn(
      "bg-brand-card border p-6 rounded-3xl shadow-sm hover:border-brand-primary/30 transition-all group relative overflow-hidden",
      alert ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]" : "border-brand-border"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", bg)}>
          <Icon className={color} size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-1">{label}</p>
          <h3 className={cn("text-xl font-black tabular-nums", color)}>PKR {value.toLocaleString()}</h3>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2 bg-brand-bg border border-brand-border px-4 h-12 rounded-xl text-brand-text font-bold text-[10px] uppercase tracking-widest">
      <span className="text-brand-text-muted mr-1">{label}:</span>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none cursor-pointer text-brand-text font-black"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function InvoiceRow({ invoice, onClick, onUpdateStatus, onDownload, onDelete }) {
  const { hasPermission } = useAuth();
  const isOverdue = invoice.status === 'sent' && invoice.dueDate?.toDate() < new Date();
  
  const statusColors = {
    draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    paid: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    overdue: "bg-red-500/10 text-red-500 border-red-500/20",
    cancelled: "bg-gray-700/10 text-gray-500 border-gray-700/20"
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' });
  };

  return (
    <tr className={cn(
      "hover:bg-brand-bg/30 transition-all duration-200 cursor-pointer group border-l-4 border-transparent",
      invoice.status === 'paid' ? "hover:border-brand-primary" : isOverdue ? "hover:border-red-500" : ""
    )}>
      <td className="px-6 py-5" onClick={onClick}>
        <span className="font-mono font-black text-sm text-brand-text">{invoice.invoiceNumber}</span>
      </td>
      <td className="px-6 py-5" onClick={onClick}>
        <div className="space-y-0.5">
           <p className="text-xs font-black text-brand-text line-clamp-1">{invoice.projectName}</p>
           <p className="text-[9px] font-bold text-brand-text-muted uppercase tracking-tight">{invoice.projectNumber}</p>
        </div>
      </td>
      <td className="px-6 py-5" onClick={onClick}>
        <div className="space-y-0.5">
           <p className="text-xs font-bold text-brand-text">{invoice.clientName}</p>
           <p className="text-[9px] text-brand-text-muted uppercase truncate max-w-[120px]">{invoice.clientCompany}</p>
        </div>
      </td>
      <td className="px-6 py-5 text-right font-mono" onClick={onClick}>
        <span className="text-sm font-black text-brand-text">PKR {invoice.totalAmount?.toLocaleString()}</span>
      </td>
      <td className="px-6 py-5 text-center" onClick={onClick}>
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
          isOverdue ? statusColors.overdue : statusColors[invoice.status] || statusColors.draft
        )}>
          {isOverdue ? 'Overdue' : invoice.status}
        </span>
      </td>
      <td className="px-6 py-5" onClick={onClick}>
         <span className={cn(
           "text-xs font-bold",
           isOverdue ? "text-red-500" : "text-brand-text-muted"
         )}>
           {formatDate(invoice.dueDate)}
         </span>
      </td>
      <td className="px-6 py-5 text-right">
        <Dialog>
           <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-2 hover:bg-brand-card rounded-lg text-brand-text-muted hover:text-brand-text transition-all">
                <MoreHorizontal size={18} />
              </button>
           </DialogTrigger>
           <DialogContent className="max-w-xs bg-brand-card border-brand-border">
              <DialogHeader>
                 <DialogTitle className="text-lg font-black italic">Invoice Actions</DialogTitle>
              </DialogHeader>
              <div className="py-4 flex flex-col gap-2">
                 <DialogClose asChild>
                    <ActionBtn icon={Edit} label="View / Edit" onClick={() => { onClick(); }} />
                 </DialogClose>
                 {hasPermission('editInvoices') && (
                    <DialogClose asChild>
                       <ActionBtn icon={TrendingUp} label="Update Status" onClick={onUpdateStatus} />
                    </DialogClose>
                 )}
                 <DialogClose asChild>
                    <ActionBtn icon={Download} label="Download PDF" onClick={onDownload} />
                 </DialogClose>
                 {hasPermission('deleteInvoices') && (
                    <DialogClose asChild>
                       <ActionBtn icon={Trash2} label="Delete Invoice" color="text-red-500" onClick={onDelete} />
                    </DialogClose>
                 )}
              </div>
           </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}

function ActionBtn({ icon: Icon, label, onClick, color = "text-brand-text-muted" }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 bg-brand-bg hover:bg-brand-border rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
        color
      )}
    >
      {label}
      <Icon size={16} />
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-5"><div className="w-20 h-4 bg-brand-bg rounded" /></td>
      <td className="px-6 py-5"><div className="w-32 h-4 bg-brand-bg rounded" /></td>
      <td className="px-6 py-5"><div className="w-24 h-4 bg-brand-bg rounded" /></td>
      <td className="px-6 py-5"><div className="w-24 h-4 bg-brand-bg ml-auto rounded" /></td>
      <td className="px-6 py-5"><div className="w-16 h-6 bg-brand-bg mx-auto rounded-full" /></td>
      <td className="px-6 py-5"><div className="w-24 h-4 bg-brand-bg rounded" /></td>
      <td className="px-6 py-5"><div className="w-10 h-10 bg-brand-bg ml-auto rounded" /></td>
    </tr>
  );
}

// Modal for Create / Edit / View
function InvoiceModal({ isOpen, setIsOpen, invoice, initialCreateFromProject, isCreateMode, setIsCreateMode, onUpdateStatus }) {
  const { hasPermission, currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    projectId: '',
    projectName: '',
    projectNumber: '',
    clientId: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: '50% advance, balance on delivery',
    notes: '',
    status: 'draft',
    lineItems: [],
    subtotal: 0,
    totalAmount: 0
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load projects for linking
    const fetchProjects = async () => {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (invoice && !isCreateMode) {
      setFormData({
        ...invoice,
        issueDate: invoice.issueDate?.toDate().toISOString().split('T')[0],
        dueDate: invoice.dueDate?.toDate().toISOString().split('T')[0]
      });
    } else if (initialCreateFromProject) {
      handleProjectLink(initialCreateFromProject);
    }
  }, [invoice, initialCreateFromProject, isCreateMode]);

  const handleProjectLink = (project) => {
    const items = project.products?.map(p => ({
      description: `${p.productName} × ${p.quantity}`,
      quantity: 1,
      unitPrice: p.clientCost,
      total: p.clientCost
    })) || [];

    const sub = items.reduce((sum, i) => sum + i.total, 0);

    setFormData(prev => ({
      ...prev,
      projectId: project.id,
      projectName: project.projectName,
      projectNumber: project.projectNumber,
      clientId: project.clientId,
      clientName: project.clientName,
      clientCompany: project.clientCompany || project.clientName,
      clientEmail: project.clientEmail || '',
      clientPhone: project.clientPhone || '',
      lineItems: items,
      subtotal: sub,
      totalAmount: sub
    }));
  };

  const calculateTotals = (items) => {
    const sub = items.reduce((sum, i) => sum + i.total, 0);
    setFormData(prev => ({
      ...prev,
      lineItems: items,
      subtotal: sub,
      totalAmount: sub
    }));
  };

  const handleAddItem = () => {
    const newItems = [...formData.lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }];
    calculateTotals(newItems);
  };

  const handleRemoveItem = (idx) => {
    const newItems = formData.lineItems.filter((_, i) => i !== idx);
    calculateTotals(newItems);
  };

  const handleItemChange = (idx, field, val) => {
    const newItems = [...formData.lineItems];
    newItems[idx][field] = val;
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
    }
    calculateTotals(newItems);
  };

  const handleSave = async (forceStatus) => {
    if (!formData.clientId) return toast.error("Please link a project or client first");
    if (formData.lineItems.length === 0) return toast.error("Add at least one line item");

    setLoading(true);
    try {
      const invoicesRef = collection(db, 'invoices');
      let finalNum = formData.invoiceNumber;
      
      if (isCreateMode) {
        const snap = await getDocs(invoicesRef);
        finalNum = `INV-2026-${(snap.size + 1).toString().padStart(3, '0')}`;
      }

      const pdfFileName = `Brandline-${finalNum}-${formData.clientName}-${formData.projectName}`
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .substring(0, 80) + '.pdf';

      const invoiceData = {
        ...formData,
        invoiceNumber: finalNum,
        pdfFileName,
        status: forceStatus || formData.status,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        updatedAt: serverTimestamp(),
      };

      if (isCreateMode) {
        invoiceData.createdAt = serverTimestamp();
        invoiceData.createdBy = currentUser.uid;
        invoiceData.createdByName = userProfile?.displayName || currentUser.email.split('@')[0];
        invoiceData.statusHistory = [{
          status: invoiceData.status,
          changedBy: currentUser.uid,
          changedByName: invoiceData.createdByName,
          changedAt: new Date(),
          note: isCreateMode ? "Initial creation" : "Updated invoice"
        }];
        
        const docRef = await addDoc(invoicesRef, invoiceData);
        
        // Update project to link invoice
        if (formData.projectId) {
          await updateDoc(doc(db, 'projects', formData.projectId), {
            invoiceId: finalNum,
            invoiceStatus: invoiceData.status
          });
        }
        
        // Update client balance if sent
        if (forceStatus === 'sent' || formData.status === 'sent') {
          await updateDoc(doc(db, 'clients', formData.clientId), {
            outstandingBalance: increment(formData.totalAmount)
          });
        }
      } else {
        await updateDoc(doc(db, 'invoices', invoice.id), invoiceData);
      }

      toast.success(`Invoice ${finalNum} saved successfully`);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };


  // State toggle for view/edit in modal
  const [innerEdit, setInnerEdit] = useState(isCreateMode);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl bg-brand-card border-brand-border p-0 overflow-hidden shadow-3xl">
         <DialogHeader className="sr-only">
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>View or edit invoice information</DialogDescription>
         </DialogHeader>
         <div className="h-[90vh] flex flex-col">
            {/* Header */}
            <header className="p-8 border-b border-brand-border bg-brand-card/50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                     <Receipt size={24} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-brand-text">{innerEdit ? (isCreateMode ? 'New Invoice' : `Edit Invoice — ${formData.invoiceNumber}`) : `Invoice ${formData.invoiceNumber}`}</h2>
                     <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Billing & Procurement</p>
                  </div>
               </div>
               <div className="flex gap-2">
                   {!innerEdit && hasPermission('editInvoices') && (
                     <button onClick={() => setInnerEdit(true)} className="px-6 py-2.5 bg-brand-bg hover:bg-brand-border border border-brand-border text-brand-text font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2">
                        <Edit size={14} /> Edit
                     </button>
                   )}
                   <button onClick={() => { toast.info("Downloading PDF..."); generateInvoicePDF(formData); }} className="px-6 py-2.5 bg-brand-bg hover:bg-brand-border border border-brand-border text-brand-text font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2">
                      <Download size={14} /> PDF
                   </button>
                   <button onClick={() => setIsOpen(false)} className="p-2.5 bg-brand-bg hover:bg-brand-border rounded-xl text-brand-text-muted transition-all">
                      <X size={20} />
                   </button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
               {innerEdit ? (
                 <>
                   {/* Step 1: Project Link */}
                   {isCreateMode && !initialCreateFromProject && (
                      <section className="space-y-4">
                         <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] italic">Step 1: Reference Data</h3>
                         <div className="bg-brand-bg/30 p-6 rounded-2xl border border-brand-border space-y-4">
                            <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest block ml-1">Link to Active Project</label>
                            <select 
                               className="w-full h-14 bg-brand-bg border border-brand-border rounded-xl px-4 font-bold text-brand-text outline-none focus:border-brand-primary appearance-none cursor-pointer"
                               onChange={(e) => {
                                 const p = projects.find(proj => proj.id === e.target.value);
                                 if (p) handleProjectLink(p);
                               }}
                            >
                               <option value="">Select a project...</option>
                               {projects.map(p => (
                                 <option key={p.id} value={p.id}>{p.projectName} ({p.projectNumber})</option>
                               ))}
                            </select>
                         </div>
                      </section>
                   )}

                   {formData.projectId && (
                      <div className="flex items-center gap-3 bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl animate-in fade-in zoom-in-95">
                         <Sparkles className="text-brand-primary" size={18} />
                         <p className="text-xs font-bold text-brand-text">Linked to project: <span className="font-black text-brand-primary uppercase underline">{formData.projectName}</span></p>
                      </div>
                   )}

                   {/* Step 2: Details */}
                   <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] italic">Step 2: Dates & Terms</h3>
                         <div className="bg-brand-bg/30 p-8 rounded-3xl border border-brand-border space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Issue Date</label>
                                  <input type="date" value={formData.issueDate} onChange={(e) => setFormData({...formData, issueDate: e.target.value})} className="w-full h-12 bg-brand-bg border border-brand-border rounded-xl px-4 text-xs font-bold text-brand-text outline-none focus:border-brand-primary" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Due Date</label>
                                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full h-12 bg-brand-bg border border-brand-border rounded-xl px-4 text-xs font-bold text-brand-text outline-none focus:border-brand-primary" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Payment Terms</label>
                               <select value={formData.paymentTerms} onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})} className="w-full h-12 bg-brand-bg border border-brand-border rounded-xl px-4 text-xs font-bold text-brand-text outline-none focus:border-brand-primary appearance-none cursor-pointer">
                                  <option value="50% advance, balance on delivery">50% advance, balance on delivery</option>
                                  <option value="Full payment on delivery">Full payment on delivery</option>
                                  <option value="Net 30">Net 30 Days</option>
                                  <option value="Net 15">Net 15 Days</option>
                                  <option value="Immediate">Due Immediately</option>
                               </select>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <h3 className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.3em] italic">Internal Notes</h3>
                         <div className="bg-brand-bg/30 p-8 rounded-3xl border border-brand-border flex-1 h-[calc(100%-34px)]">
                            <textarea 
                              value={formData.notes} 
                              onChange={(e) => setFormData({...formData, notes: e.target.value})}
                              placeholder="Add special instructions, bank details or shipping notes..."
                              className="w-full h-full bg-transparent outline-none resize-none text-sm text-brand-text leading-relaxed"
                            />
                         </div>
                      </div>
                   </section>

                   {/* Step 3: Line Items */}
                   <section className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] italic">Step 3: Financial Items</h3>
                         <button onClick={handleAddItem} className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">
                            <Plus size={14} /> Add Line Item
                         </button>
                      </div>
                      <div className="rounded-2xl border border-brand-border overflow-hidden">
                        <table className="w-full text-left">
                           <thead className="bg-brand-bg/50 border-b border-brand-border">
                              <tr>
                                 <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest">Description</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest text-center w-24">Qty</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest text-right w-40">Unit Price</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest text-right w-40">Total</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest text-center w-16"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-brand-border/50">
                              {formData.lineItems.map((item, idx) => (
                                <tr key={idx} className="bg-brand-bg/10">
                                   <td className="p-2 px-4">
                                      <input 
                                        value={item.description} 
                                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)} 
                                        className="w-full bg-transparent border-none outline-none text-xs font-bold text-brand-text"
                                        placeholder="Item description..."
                                      />
                                   </td>
                                   <td className="p-2">
                                      <input 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))} 
                                        className="w-full bg-transparent border-none outline-none text-xs font-bold text-center text-brand-text tabular-nums"
                                      />
                                   </td>
                                   <td className="p-2">
                                      <input 
                                        type="number" 
                                        value={item.unitPrice} 
                                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))} 
                                        className="w-full bg-transparent border-none outline-none text-xs font-bold text-right text-brand-text tabular-nums"
                                      />
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <span className="text-xs font-black text-brand-text tabular-nums">PKR {item.total?.toLocaleString()}</span>
                                   </td>
                                   <td className="p-2 text-center">
                                      <button onClick={() => handleRemoveItem(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                         <Trash2 size={14} />
                                      </button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>

                      {/* Summary Section */}
                      <div className="flex justify-end pt-4">
                         <div className="w-80 bg-brand-bg/30 p-6 rounded-3xl border border-brand-border space-y-4">
                            <div className="flex justify-between items-center text-brand-text-muted">
                               <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                               <span className="text-sm font-bold tabular-nums">PKR {formData.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-brand-text-muted">
                               <span className="text-[10px] font-black uppercase tracking-widest">Tax (0%)</span>
                               <span className="text-[10px] font-black border border-brand-border px-2 py-0.5 rounded italic">EXEMPT</span>
                            </div>
                            <div className="h-px bg-brand-border" />
                            <div className="flex justify-between items-center">
                               <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Total Amount</span>
                               <div className="flex items-baseline gap-1.5">
                                  <span className="text-sm font-black text-brand-text">PKR</span>
                                  <span className="text-2xl font-black text-brand-text tabular-nums">{formData.totalAmount?.toLocaleString()}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </section>
                 </>
               ) : (
                 /* View Mode UI */
                 <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <section>
                             <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4 italic">Billed To</h4>
                             <div className="space-y-1">
                                <p className="text-2xl font-black text-brand-text">{formData.clientName}</p>
                                <p className="text-sm font-bold text-brand-text-muted">{formData.clientCompany}</p>
                                <div className="pt-4 flex flex-col gap-2">
                                   <div className="flex items-center gap-2 text-brand-text-muted">
                                      <Mail size={14} />
                                      <span className="text-xs">{formData.clientEmail || 'No email provided'}</span>
                                   </div>
                                   <div className="flex items-center gap-2 text-brand-text-muted">
                                      <Phone size={14} />
                                      <span className="text-xs">{formData.clientPhone || 'No contact provided'}</span>
                                   </div>
                                </div>
                             </div>
                          </section>
                          
                          <section>
                             <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4 italic">Project Reference</h4>
                             <div className="bg-brand-bg/30 p-6 rounded-2xl border border-brand-border space-y-2">
                                <p className="text-sm font-black text-brand-text">{formData.projectName}</p>
                                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{formData.projectNumber}</p>
                             </div>
                          </section>
                       </div>

                       <div className="bg-brand-bg/30 p-8 rounded-3xl border border-brand-border h-fit space-y-8">
                           <div className="grid grid-cols-2 gap-8">
                              <div>
                                 <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest block mb-2">Issue Date</label>
                                 <p className="text-sm font-black text-brand-text">
                                    {new Date(formData.issueDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                                 </p>
                              </div>
                              <div>
                                 <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest block mb-2">Due Date</label>
                                 <p className="text-sm font-black text-red-500">
                                    {new Date(formData.dueDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                                 </p>
                              </div>
                           </div>
                           <div>
                              <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest block mb-2">Payment Terms</label>
                              <p className="text-sm font-black text-brand-text italic underline decoration-brand-primary/40 underline-offset-4">{formData.paymentTerms}</p>
                           </div>
                           <div className={cn(
                             "p-4 rounded-xl border flex items-center justify-between",
                             formData.status === 'paid' ? "bg-brand-primary/10 border-brand-primary/30" : "bg-blue-500/10 border-blue-500/30"
                           )}>
                              <span className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Current Status</span>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                formData.status === 'paid' ? "bg-brand-primary text-white" : "bg-blue-500 text-white"
                              )}>{formData.status}</span>
                           </div>
                       </div>
                    </div>

                    <div className="rounded-2xl border border-brand-border overflow-hidden">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-brand-bg/50">
                                <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest text-center">Qty</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest text-right">Unit Price</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-text-muted uppercase tracking-widest text-right">Total</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/30">
                             {formData.lineItems.map((item, i) => (
                               <tr key={i} className="hover:bg-brand-bg/10">
                                  <td className="px-6 py-4 text-xs font-bold text-brand-text">{item.description}</td>
                                  <td className="px-6 py-4 text-center text-xs font-black text-brand-text-muted">{item.quantity}</td>
                                  <td className="px-6 py-4 text-right text-xs font-bold text-brand-text-muted tabular-nums">PKR {item.unitPrice.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-sm font-black text-brand-text tabular-nums">PKR {item.total.toLocaleString()}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12 pt-8 border-t border-brand-border">
                       <div className="flex-1 space-y-6">
                          <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                             <History size={14} /> Status History
                          </h4>
                          <div className="space-y-4">
                             {invoice?.statusHistory && invoice.statusHistory.length > 0 ? (
                               invoice.statusHistory.slice().reverse().map((step, i) => (
                                 <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center shrink-0">
                                       <div className={cn(
                                         "w-3 h-3 rounded-full mt-1 border-2 border-brand-card shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                                         step.status === 'paid' ? "bg-brand-primary" : step.status === 'cancelled' ? "bg-red-500" : "bg-blue-500"
                                       )} />
                                       {i !== invoice.statusHistory.length - 1 && <div className="w-0.5 flex-1 bg-brand-border/30 my-1" />}
                                    </div>
                                    <div className="pb-8">
                                       <div className="flex items-center gap-3">
                                          <span className="text-[11px] font-black uppercase text-brand-text tracking-widest">{step.status}</span>
                                          <span className="text-[9px] font-bold text-brand-text-muted">{step.changedAt?.toDate ? step.changedAt.toDate().toLocaleString() : new Date(step.changedAt).toLocaleString()}</span>
                                       </div>
                                       <p className="text-[10px] text-brand-text-muted font-bold tracking-tight italic mt-1">Updated by {step.changedByName}</p>
                                       {step.note && <p className="mt-2 text-xs text-brand-text leading-relaxed bg-brand-bg/50 p-3 rounded-xl border border-brand-border/50 max-w-sm">{step.note}</p>}
                                    </div>
                                 </div>
                               ))
                             ) : (
                               <p className="text-xs text-brand-text-muted font-medium italic">No history records yet.</p>
                             )}
                          </div>
                       </div>
                       <div className="w-80 space-y-6">
                          <div className="p-6 bg-brand-bg/50 rounded-3xl border border-brand-border space-y-4">
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Subtotal</span>
                                <span className="text-sm font-bold text-brand-text tabular-nums">PKR {formData.subtotal?.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Tax</span>
                                <span className="text-[10px] font-black text-brand-text border border-brand-border px-2 rounded">0%</span>
                             </div>
                             <div className="h-px bg-brand-border/50" />
                             <div className="flex justify-between items-center text-brand-primary">
                                <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                                <span className="text-xl font-black tabular-nums">PKR {formData.totalAmount?.toLocaleString()}</span>
                             </div>
                          </div>
                          
                          <div className="p-6 bg-brand-bg/50 rounded-3xl border border-brand-border space-y-2">
                             <h5 className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-4">Payment Notes</h5>
                             <p className="text-xs text-brand-text leading-relaxed italic">{formData.notes || "No special instructions provided."}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Modal Footer */}
            <footer className="p-8 border-t border-brand-border bg-brand-bg/50 flex justify-between items-center shrink-0">
               <div className="flex gap-3">
                  {innerEdit && (
                     <button onClick={() => setInnerEdit(false)} className="px-8 h-12 text-brand-text font-black text-[10px] uppercase tracking-widest hover:text-brand-primary transition-all">
                        Cancel
                     </button>
                  )}
                  {!isCreateMode && !innerEdit && (
                    <button onClick={onUpdateStatus} className="px-8 h-12 bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                       Update Status
                    </button>
                  )}
               </div>
               
               {innerEdit && (
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleSave('draft')}
                      disabled={loading}
                      className="px-8 h-12 bg-transparent border border-brand-border text-brand-text font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-border transition-all flex items-center gap-2"
                    >
                       Save as Draft
                    </button>
                    <button 
                      onClick={() => handleSave('sent')}
                      disabled={loading}
                      className="px-10 h-12 bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                    >
                       {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                       {isCreateMode ? 'Create & Send' : 'Save Changes'}
                    </button>
                 </div>
               )}
            </footer>
         </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusUpdateModal({ isOpen, setIsOpen, invoice }) {
  const [newStatus, setNewStatus] = useState(invoice.status);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, userProfile } = useAuth();

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'sent', label: 'Sent', color: 'blue' },
    { value: 'paid', label: 'Paid', color: 'green' },
    { value: 'overdue', label: 'Overdue', color: 'red' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
  ];

  const handleUpdate = async () => {
    if (newStatus === invoice.status && !note) return setIsOpen(false);
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const invoiceRef = doc(db, 'invoices', invoice.id);
      
      const historyEntry = {
        status: newStatus,
        changedBy: currentUser.uid,
        changedByName: userProfile?.displayName || currentUser.email.split('@')[0],
        changedAt: new Date(),
        note: note || `Status updated from ${invoice.status} to ${newStatus}`
      };

      batch.update(invoiceRef, {
        status: newStatus,
        statusHistory: [...(invoice.statusHistory || []), historyEntry],
        updatedAt: serverTimestamp(),
        ...(newStatus === 'paid' ? { paidDate: serverTimestamp() } : {})
      });

      // Update related project
      if (invoice.projectId) {
        batch.update(doc(db, 'projects', invoice.projectId), {
          invoiceStatus: newStatus,
          ...(newStatus === 'paid' ? { status: 'completed' } : {})
        });
      }

      // Financial side-effects for 'paid'
      if (newStatus === 'paid' && invoice.status !== 'paid') {
         batch.update(doc(db, 'clients', invoice.clientId), {
           outstandingBalance: increment(-invoice.totalAmount),
           totalRevenue: increment(invoice.totalAmount),
           updatedAt: serverTimestamp()
         });
      }

      await batch.commit();
      toast.success(`Invoice status updated to ${newStatus}`);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md bg-brand-card border-brand-border">
         <DialogHeader>
            <DialogTitle className="text-2xl font-black text-brand-text">Update Status</DialogTitle>
            <DialogDescription className="text-brand-text-muted font-bold italic">INV-XXXX — {invoice.clientName}</DialogDescription>
         </DialogHeader>
         
         <div className="py-8 space-y-8">
            <div className="grid grid-cols-2 gap-3">
               {statuses.map(s => (
                 <button 
                    key={s.value}
                    onClick={() => setNewStatus(s.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                      newStatus === s.value 
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary" 
                        : "border-brand-border bg-brand-bg text-brand-text-muted hover:border-brand-text-muted/30"
                    )}
                 >
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      s.color === 'green' ? "bg-brand-primary" : s.color === 'blue' ? "bg-blue-500" : s.color === 'red' ? "bg-red-500" : "bg-gray-500"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                 </button>
               ))}
            </div>

            <div className="space-y-3">
               <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Notes / Internal Update</label>
               <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Received via Bank Transfer #12345"
                  className="w-full h-24 bg-brand-bg border border-brand-border rounded-xl p-4 text-xs font-bold text-brand-text outline-none focus:border-brand-primary resize-none"
               />
            </div>

            <button 
               onClick={handleUpdate}
               disabled={loading}
               className="w-full h-14 bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
            >
               {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
               Confirm Update
            </button>
         </div>
      </DialogContent>
    </Dialog>
  );
}
