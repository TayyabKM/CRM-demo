import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, query, orderBy, onSnapshot,
  updateDoc, doc, serverTimestamp, increment,
  addDoc, getDocs, where, setDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Users, UserPlus, Search, Filter, 
  Trash2, Edit, X, Check, 
  Mail, Phone, MapPin, FileText,
  TrendingUp, Wallet, CheckCircle2,
  MoreVertical, ChevronRight,
  Loader2, Plus, Save, PhoneCall,
  History, DollarSign, ExternalLink,
  ShieldCheck, ShieldAlert
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
  DialogTrigger
} from '../components/ui/dialog';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, outstanding, idle
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  
  const { currentUser, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(data);
      setLoading(false);
      
      // If there's a highlight ID in URL, open it
      if (highlightId) {
        const client = data.find(c => c.id === highlightId);
        if (client) {
          setSelectedClient(client);
          setIsSidePanelOpen(true);
        }
      }
    }, (error) => {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [highlightId]);

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'outstanding') return matchesSearch && (c.outstandingBalance > 0);
    if (filterType === 'idle') return matchesSearch && (c.totalProjects === 0);
    return matchesSearch;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.totalProjects > 0).length,
    totalOutstanding: clients.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0)
  };

  const openClientPanel = (client) => {
    setSelectedClient(client);
    setIsSidePanelOpen(true);
  };

  const closeClientPanel = () => {
    setIsSidePanelOpen(false);
    // Remove ID from URL if it was there
    if (highlightId) navigate('/clients', { replace: true });
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-brand-text mb-2">Clients</h1>
          <p className="text-brand-text-muted font-medium">Manage partnerships and financial history</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          <UserPlus size={18} />
          Add Client
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <ClientStatCard label="Total Clients" value={stats.total} icon={Users} color="text-brand-text" />
        <ClientStatCard label="Active Partners" value={stats.active} icon={CheckCircle2} color="text-brand-primary" bg="bg-brand-primary/10" />
        <ClientStatCard 
          label="Total Outstanding" 
          value={`PKR ${stats.totalOutstanding.toLocaleString()}`} 
          icon={Wallet} 
          color="text-red-500" 
          bg="bg-red-500/10"
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-brand-card border border-brand-border rounded-3xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row gap-4 items-center justify-between bg-brand-card/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, company or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl pl-12 pr-4 text-brand-text font-medium outline-none transition-all"
            />
          </div>

          <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border shrink-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'outstanding', label: 'Outstanding Balance' },
              { id: 'idle', label: 'No Projects' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  filterType === f.id ? "bg-brand-card text-brand-text shadow-md" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50">
                <th className="px-8 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Client / Company</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] text-center">Projects</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] text-right">Outstanding (PKR)</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] text-right">Total Revenue (PKR)</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
              ) : filteredClients.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <Users size={40} className="text-brand-text-muted opacity-20" />
                         <p className="text-brand-text-muted font-bold italic">No clients matching your search.</p>
                      </div>
                   </td>
                </tr>
              ) : filteredClients.map(client => (
                <tr 
                  key={client.id} 
                  className={cn(
                    "hover:bg-brand-bg/30 transition-colors duration-200 cursor-pointer group",
                    selectedClient?.id === client.id && "bg-brand-bg/50"
                  )}
                  onClick={() => openClientPanel(client)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-sm group-hover:scale-110 transition-transform border border-brand-primary/10">
                          {client.name?.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-black text-brand-text">{client.name}</p>
                          <p className="text-[10px] text-brand-text-muted font-bold tracking-tighter uppercase">{client.company}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-brand-text-muted">
                          <Mail size={12} className="shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[160px]">{client.email || '—'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-brand-text-muted">
                          <Phone size={12} className="shrink-0" />
                          <span className="text-[11px] font-bold tracking-tight">{client.phone || '—'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 bg-brand-bg rounded-lg text-xs font-black text-brand-text border border-brand-border">
                       {client.totalProjects || 0}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-mono tabular-nums">
                    {client.outstandingBalance > 0 ? (
                      <span className="text-sm font-black text-red-500">
                        {client.outstandingBalance.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded">Cleared</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right font-mono tabular-nums">
                    <span className="text-sm font-black text-brand-primary">
                      {client.totalRevenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button className="p-2 hover:bg-brand-card rounded-lg text-brand-text-muted hover:text-brand-text transition-all">
                       <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      <ClientSidePanel 
        isOpen={isSidePanelOpen} 
        onClose={closeClientPanel} 
        client={selectedClient} 
      />

      {/* Modals */}
      <AddClientModal 
        isOpen={isAddModalOpen} 
        setIsOpen={setIsAddModalOpen} 
        uid={currentUser?.uid} 
      />
    </div>
  );
}

function ClientStatCard({ label, value, icon: Icon, color, bg = "bg-brand-bg" }) {
  return (
    <div className="bg-brand-card border border-brand-border p-6 rounded-3xl shadow-sm hover:border-brand-primary/30 transition-all flex items-center gap-5 group">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 shadow-lg", bg)}>
        <Icon className={color} size={28} />
      </div>
      <div>
        <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className={cn("text-2xl font-black", color)}>{value}</h3>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-brand-bg" />
           <div className="space-y-2">
              <div className="w-32 h-4 bg-brand-bg rounded" />
              <div className="w-20 h-3 bg-brand-bg rounded" />
           </div>
        </div>
      </td>
      <td colSpan={5} className="px-8 py-5">
         <div className="w-full h-8 bg-brand-bg/50 rounded-xl" />
      </td>
    </tr>
  );
}

function ClientSidePanel({ isOpen, onClose, client }) {
  const [activeClientProjects, setActiveClientProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setEditedData(client);
      // Fetch projects for this client
      const q = query(collection(db, 'projects'), where('clientId', '==', client.id), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setActiveClientProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [client]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clients', client.id), {
        ...editedData,
        updatedAt: serverTimestamp()
      });
      toast.success("Client information updated");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const clearBalance = async () => {
    if (client.outstandingBalance === 0) return;
    try {
      await updateDoc(doc(db, 'clients', client.id), {
        totalRevenue: increment(client.outstandingBalance),
        outstandingBalance: 0,
        updatedAt: serverTimestamp()
      });
      toast.success("Balance marked as cleared and moved to revenue");
    } catch (err) {
       toast.error("Failed to clear balance");
    }
  };

  return (
    <div 
      className={cn(
        "fixed right-0 top-0 h-full w-[480px] bg-brand-card shadow-[-20px_0_40px_rgba(0,0,0,0.5)] border-l border-brand-border z-[100] transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="h-full flex flex-col pt-20">
         {/* Close Button */}
         <button 
           onClick={onClose}
           className="absolute top-6 right-6 p-2 bg-brand-bg hover:bg-brand-border rounded-full text-brand-text-muted hover:text-brand-text transition-all"
         >
           <X size={20} />
         </button>

         {client ? (
           <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-10 custom-scrollbar">
              {/* Profile Section */}
              <div className="flex flex-col items-center text-center space-y-4 pt-10">
                 <div className="w-24 h-24 rounded-[32px] bg-brand-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl relative">
                    <div className="absolute inset-0 bg-brand-primary/30 blur-2xl rounded-full" />
                    <span className="relative z-10">{client.name?.substring(0, 2).toUpperCase()}</span>
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-brand-text">{client.name}</h2>
                    <p className="text-brand-primary font-black uppercase tracking-widest text-[10px] mt-1">{client.company}</p>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                 <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 h-12 border-2 border-brand-border hover:border-brand-text-muted/30 text-brand-text font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                 >
                   {isEditing ? <X size={16} /> : <Edit size={16} />}
                   {isEditing ? 'Cancel' : 'Edit Info'}
                 </button>
                 {isEditing && (
                    <button 
                      onClick={handleUpdate}
                      disabled={loading}
                      className="flex-1 h-12 bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                 )}
              </div>

              {/* Info Details */}
              <div className="space-y-6 bg-brand-bg/30 p-8 rounded-3xl border border-brand-border">
                 <EditableField 
                   label="Full Name" 
                   value={editedData.name} 
                   onChange={isEditing ? (v) => setEditedData({...editedData, name: v}) : null} 
                   icon={Users}
                 />
                 <EditableField 
                   label="Company" 
                   value={editedData.company} 
                   onChange={isEditing ? (v) => setEditedData({...editedData, company: v}) : null} 
                   icon={TrendingUp}
                 />
                 <EditableField 
                   label="Email" 
                   value={editedData.email} 
                   onChange={isEditing ? (v) => setEditedData({...editedData, email: v}) : null} 
                   icon={Mail}
                   placeholder="Empty"
                 />
                 <EditableField 
                   label="Phone" 
                   value={editedData.phone} 
                   onChange={isEditing ? (v) => setEditedData({...editedData, phone: v}) : null} 
                   icon={Phone}
                   placeholder="Empty"
                 />
                 <EditableField 
                   label="Office Address" 
                   value={editedData.address} 
                   onChange={isEditing ? (v) => setEditedData({...editedData, address: v}) : null} 
                   icon={MapPin}
                   placeholder="Not specified"
                   isArea
                 />
              </div>

              {/* Financial Section */}
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] border-b border-brand-border pb-4">Financial Overview</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 space-y-1">
                       <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Outstanding</p>
                       <p className="text-lg font-black text-brand-text tabular-nums text-red-500">PKR {client.outstandingBalance?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 space-y-1">
                       <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Total Revenue</p>
                       <p className="text-lg font-black text-brand-text tabular-nums text-brand-primary">PKR {client.totalRevenue?.toLocaleString()}</p>
                    </div>
                 </div>
                 {client.outstandingBalance > 0 && (
                    <button 
                      onClick={clearBalance}
                      className="w-full h-14 bg-brand-bg hover:bg-brand-border text-brand-text font-black text-[10px] uppercase tracking-widest rounded-2xl border border-brand-border transition-all flex items-center justify-center gap-2 group"
                    >
                      <CheckCircle2 size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
                      Mark Balance as Cleared
                    </button>
                 )}
              </div>

              {/* Projects History */}
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] border-b border-brand-border pb-4">Project History ({activeClientProjects.length})</h4>
                 <div className="space-y-3">
                    {activeClientProjects.length === 0 ? (
                      <p className="text-xs text-brand-text-muted italic font-medium">No projects recorded for this client.</p>
                    ) : activeClientProjects.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => navigate(`/projects?id=${p.id}`)}
                        className="p-4 bg-brand-bg/50 border border-brand-border rounded-2xl hover:border-brand-primary/40 hover:bg-brand-bg transition-all cursor-pointer group"
                      >
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{p.projectNumber}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                              p.status === 'active' ? "border-green-500/20 text-green-500" : "border-brand-border text-brand-text-muted"
                            )}>{p.status}</span>
                         </div>
                         <h5 className="text-xs font-black text-brand-text group-hover:text-brand-primary transition-colors">{p.projectName}</h5>
                         <div className="flex justify-between items-end mt-4 pt-2 border-t border-brand-border/30">
                            <span className="text-[10px] font-medium text-brand-text-muted">{p.createdAt?.toDate().toLocaleDateString()}</span>
                            <div className="flex items-baseline gap-1">
                               <span className="text-[8px] font-bold text-brand-text-muted">PKR</span>
                               <span className="text-xs font-black text-brand-text">{p.totalClientCost?.toLocaleString()}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Notes */}
              <div className="space-y-6 pt-4">
                 <h4 className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] border-b border-brand-border pb-4 flex items-center gap-2">
                    <FileText size={14} /> Internal Notes
                 </h4>
                 <textarea 
                    className="w-full min-h-[120px] bg-brand-bg/50 border border-brand-border rounded-2xl p-4 text-sm text-brand-text-muted focus:border-brand-primary outline-none transition-all resize-none"
                    placeholder="Add specific client preferences, delivery requirements or strategic notes..."
                    defaultValue={client.notes}
                    onBlur={async (e) => {
                       if (e.target.value !== client.notes) {
                          await updateDoc(doc(db, 'clients', client.id), { notes: e.target.value, updatedAt: serverTimestamp() });
                          toast.success("Notes autosaved");
                       }
                    }}
                 />
              </div>
           </div>
         ) : (
           <div className="h-full flex items-center justify-center text-brand-text-muted italic px-10 text-center">
              Select a client from the list to view their full profile and financial history.
           </div>
         )}
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, icon: Icon, isArea, placeholder }) {
  return (
    <div className="space-y-2 group/field">
       <div className="flex items-center gap-2 text-brand-text-muted transition-colors group-hover/field:text-brand-primary">
          <Icon size={12} />
          <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest group-hover/field:text-brand-primary/70">{label}</p>
       </div>
       {onChange ? (
         isArea ? (
           <textarea 
             value={value || ''}
             onChange={(e) => onChange(e.target.value)}
             className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl p-3 text-xs font-bold text-brand-text outline-none transition-all min-h-[80px] resize-none"
             placeholder={placeholder}
           />
         ) : (
           <input 
             value={value || ''}
             onChange={(e) => onChange(e.target.value)}
             className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 h-10 text-xs font-bold text-brand-text outline-none transition-all"
             placeholder={placeholder}
           />
         )
       ) : (
         <p className="text-sm font-black text-brand-text pl-1">{value || <span className="text-brand-text-muted opacity-30 italic">{placeholder}</span>}</p>
       )}
    </div>
  );
}

function AddClientModal({ isOpen, setIsOpen, uid }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return toast.error("Name and Company are required");
    
    setLoading(true);
    try {
      const clientsRef = collection(db, 'clients');
      const snapshot = await getDocs(clientsRef);
      const clientNumber = `CL-${(snapshot.size + 1).toString().padStart(3, '0')}`;
      
      const newClient = {
        ...formData,
        clientNumber,
        outstandingBalance: 0,
        totalRevenue: 0,
        totalProjects: 0,
        createdBy: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(clientsRef, newClient);
      toast.success(`Client '${formData.name}' added successfully`);
      setFormData({ name: '', company: '', email: '', phone: '', address: '', notes: '' });
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl bg-brand-card border-brand-border">
         <DialogHeader>
            <DialogTitle className="text-2xl font-black text-brand-text flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <UserPlus size={20} />
               </div>
               Add New Client
            </DialogTitle>
            <DialogDescription className="text-brand-text-muted font-medium">Register a new partner in your organization's CRM.</DialogDescription>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-sm font-bold text-brand-text outline-none transition-all" placeholder="e.g. Asad Jameel" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Company</label>
                  <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-sm font-bold text-brand-text outline-none transition-all" placeholder="e.g. KFC Pakistan" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-sm font-bold text-brand-text outline-none transition-all" placeholder="contact@company.pk" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Phone Number</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-sm font-bold text-brand-text outline-none transition-all" placeholder="+92 3XX XXXXXXX" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Office Address</label>
               <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full h-24 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl p-4 text-sm font-bold text-brand-text outline-none transition-all resize-none" placeholder="Full street address..." />
            </div>
            <DialogFooter>
               <button type="button" onClick={() => setIsOpen(false)} className="px-6 h-14 text-brand-text-muted font-bold hover:text-brand-text">Cancel</button>
               <button type="submit" disabled={loading} className="px-10 h-14 bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Register Client
               </button>
            </DialogFooter>
         </form>
      </DialogContent>
    </Dialog>
  );
}
