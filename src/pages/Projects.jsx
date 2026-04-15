import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, query, orderBy, onSnapshot,
  updateDoc, doc, serverTimestamp, where,
  deleteField
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  FolderOpen, Search, Filter, ArrowUpRight, 
  TrendingUp, Clock, AlertCircle, Calendar,
  User, Users, Package, FileText, CheckCircle2, Receipt,
  MoreVertical, MoreHorizontal, ChevronRight,
  ExternalLink, LayoutGrid, List, Plus, 
  Download, Share2, Printer, Trash2, Edit, Save,
  X, Check, AlertTriangle, ShieldCheck,
  ShieldAlert, Sparkles, Loader2
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
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.projectNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'newest') return b.createdAt?.seconds - a.createdAt?.seconds;
    if (sortBy === 'oldest') return a.createdAt?.seconds - b.createdAt?.seconds;
    if (sortBy === 'highest_value') return b.totalClientCost - a.totalClientCost;
    if (sortBy === 'client_name') return a.clientName.localeCompare(b.clientName);
    return 0;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalValue: projects.reduce((sum, p) => sum + (p.totalClientCost || 0), 0)
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success("Project status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const openDetails = (project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
    setActiveTab('overview');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-text mb-2">Projects</h1>
          <p className="text-brand-text-muted font-medium">Track and manage all manufacturing job proposals</p>
        </div>
        
        <div className="flex bg-[#3E3E3E] p-1 rounded-2xl border border-brand-border h-fit">
          {['all', 'active', 'completed', 'on_hold', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === tab ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
              )}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={stats.total} icon={FolderOpen} color="text-brand-text" />
        <StatCard label="Active Jobs" value={stats.active} icon={Sparkles} color="text-green-500" bg="bg-green-500/10" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard 
          label="Total Value" 
          value={`PKR ${stats.totalValue.toLocaleString()}`} 
          icon={TrendingUp} 
          color="text-brand-primary" 
          isCurrency 
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-brand-card p-4 rounded-2xl border border-brand-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search projects, clients, or PQ IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl pl-12 pr-4 text-brand-text font-medium outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-brand-bg border border-brand-border px-4 h-12 rounded-xl text-brand-text font-bold text-sm">
            <Filter size={16} className="text-brand-text-muted" />
            <span className="text-brand-text-muted mr-2">Sort:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_value">Highest Value</option>
              <option value="client_name">Client A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center bg-brand-card border border-brand-border border-dashed rounded-3xl p-12 text-center space-y-6">
           <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center">
             <FolderOpen size={40} className="text-brand-text-muted opacity-20" />
           </div>
           <div>
             <h2 className="text-2xl font-black text-brand-text">No projects yet</h2>
             <p className="text-brand-text-muted font-medium mt-2">Projects will appear here once you save an estimate from the Job Estimator.</p>
           </div>
           <button 
             onClick={() => navigate('/')}
             className="px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-primary/20"
           >
             Go to Estimator
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onView={() => openDetails(project)} 
              onStatusUpdate={(s) => handleUpdateStatus(project.id, s)}
              canEdit={hasPermission('editProjects')}
            />
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectDetailModal 
          isOpen={isDetailModalOpen}
          setIsOpen={setIsDetailModalOpen}
          project={selectedProject}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg = "bg-brand-bg", isCurrency }) {
  return (
    <div className="bg-brand-card border border-brand-border p-6 rounded-3xl shadow-sm hover:border-brand-primary/30 transition-all group overflow-hidden relative">
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150", color)} />
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12", bg)}>
          <Icon className={color} size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
             <h3 className={cn("text-xl font-black", color)}>{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-6 h-[320px] animate-pulse">
      <div className="flex justify-between items-start">
        <div className="w-24 h-4 bg-brand-bg rounded" />
        <div className="w-16 h-6 bg-brand-bg rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-6 bg-brand-bg rounded" />
        <div className="w-1/2 h-4 bg-brand-bg rounded" />
      </div>
      <div className="pt-4 space-y-3">
        <div className="w-full h-3 bg-brand-bg rounded" />
        <div className="w-full h-3 bg-brand-bg rounded" />
        <div className="w-full h-3 bg-brand-bg rounded" />
      </div>
      <div className="pt-4 flex gap-2">
        <div className="flex-1 h-10 bg-brand-bg rounded-xl" />
        <div className="flex-1 h-10 bg-brand-bg rounded-xl" />
      </div>
    </div>
  );
}

function ProjectCard({ project, onView, onStatusUpdate, canEdit }) {
  const statusColors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    on_hold: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  const formatDate = (ts) => {
    if (!ts) return 'Unknown';
    const date = ts.toDate();
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-5 hover:shadow-2xl hover:border-brand-primary/20 transition-all group flex flex-col relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-brand-primary/40 transition-all" />
      
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">{project.projectNumber}</span>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
          statusColors[project.status] || "bg-brand-bg text-brand-text-muted"
        )}>
          {project.status.replace('_', ' ')}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-black text-brand-text leading-tight group-hover:text-brand-primary transition-colors cursor-pointer line-clamp-2" onClick={onView}>
          {project.projectName}
        </h3>
        <p className="text-xs text-brand-text-muted mt-1 font-bold italic truncate flex items-center gap-1.5">
           <Users size={12} /> {project.clientName}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-brand-border/50">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-brand-text-muted">
             <Package size={14} />
             <span className="text-[10px] font-bold uppercase tracking-tight">{project.products?.length || 0} Products</span>
           </div>
           <div className="flex items-center gap-2 text-brand-text-muted">
             <Calendar size={14} />
             <span className="text-[10px] font-bold uppercase tracking-tight">{project.timelineDays} Working Days</span>
           </div>
        </div>
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-brand-text-muted">
             <User size={14} />
             <span className="text-[10px] font-bold uppercase tracking-tight truncate">By {project.createdByName}</span>
           </div>
           <div className="flex items-center gap-2 text-brand-text-muted">
             <Clock size={14} />
             <span className="text-[10px] font-bold uppercase tracking-tight">{formatDate(project.createdAt)}</span>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-1">
         <div>
            <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-[0.2em] mb-1">Total Client Value</p>
            <div className="flex items-baseline gap-1.5">
               <span className="text-[10px] font-bold text-brand-primary">PKR</span>
               <span className="text-lg font-black text-brand-text">{project.totalClientCost.toLocaleString()}</span>
            </div>
         </div>
         {project.invoiceId && (
            <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg flex items-center gap-1.5">
               <FileText size={12} />
               <span className="text-[9px] font-black uppercase tracking-widest">{project.invoiceId}</span>
            </div>
         )}
      </div>

      <div className="flex gap-2 pt-2">
        <button 
          onClick={onView}
          className="flex-1 h-12 bg-brand-bg hover:bg-brand-card border border-brand-border text-brand-text font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
        >
          View Details
          <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
        {canEdit && (
          <Dialog>
             <DialogTrigger asChild>
                <button className="px-4 h-12 bg-brand-bg hover:bg-brand-card border border-brand-border text-brand-text-muted hover:text-brand-text rounded-xl transition-all">
                  <MoreHorizontal size={18} />
                </button>
             </DialogTrigger>
             <DialogContent className="max-w-xs bg-brand-card border-brand-border">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black">Quick Actions</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4">
                   <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-4">Set Status</p>
                   {['active', 'completed', 'on_hold', 'cancelled'].map(s => (
                     <button
                       key={s}
                       onClick={() => onStatusUpdate(s)}
                       className={cn(
                        "w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all",
                        project.status === s ? "bg-brand-primary text-white" : "bg-brand-bg text-brand-text-muted hover:text-brand-text hover:bg-brand-border"
                       )}
                     >
                        {s.replace('_', ' ')}
                        {project.status === s && <Check size={14} />}
                     </button>
                   ))}
                </div>
             </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function ProjectDetailModal({ isOpen, setIsOpen, project, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'products', label: 'Products & Costs', icon: Package },
    { id: 'timeline', label: 'Manufacturing Timeline', icon: Clock },
    { id: 'invoice', label: 'Invoice status', icon: FileText }
  ];

  const statusColors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    on_hold: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl bg-brand-card border-brand-border p-0 overflow-hidden shadow-3xl">
        <div className="h-[80vh] flex flex-col">
          {/* Modal Header */}
          <div className="p-8 border-b border-brand-border bg-brand-card/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <span className="text-xs font-black text-brand-primary tracking-[0.2em]">{project.projectNumber}</span>
                   <div className={cn(
                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                    statusColors[project.status]
                   )}>
                    {project.status.replace('_', ' ')}
                   </div>
                </div>
                <h2 className="text-3xl font-black text-brand-text leading-tight">{project.projectName}</h2>
                <div className="flex items-center gap-4 text-brand-text-muted">
                   <button 
                    onClick={() => navigate(`/clients?id=${project.clientId}`)}
                    className="text-xs font-bold hover:text-brand-primary transition-colors flex items-center gap-1.5 group"
                   >
                     CLIENT: {project.clientName} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                   <div className="w-1 h-1 rounded-full bg-brand-border" />
                   <span className="text-xs font-medium">Created on {project.createdAt?.toDate().toLocaleDateString()} by {project.createdByName}</span>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="p-3 bg-brand-bg hover:bg-brand-border rounded-xl text-brand-text-muted transition-all">
                  <Printer size={20} />
                </button>
                <button className="p-3 bg-brand-bg hover:bg-brand-border rounded-xl text-brand-text-muted transition-all">
                  <Download size={20} />
                </button>
                <button className="p-3 bg-brand-bg hover:bg-brand-border rounded-xl text-brand-text-muted transition-all">
                  <Share2 size={20} />
                </button>
             </div>
          </div>

          {/* Modal Tabs Nav */}
          <div className="px-8 border-b border-brand-border bg-brand-bg/30 shrink-0">
             <div className="flex -mb-px">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 py-4 px-6 border-b-2 font-bold text-xs uppercase tracking-widest transition-all relative",
                      activeTab === tab.id 
                        ? "border-brand-primary text-brand-text" 
                        : "border-transparent text-brand-text-muted hover:text-brand-text hover:border-brand-text-muted/30"
                    )}
                  >
                    <tab.icon size={16} className={activeTab === tab.id ? "text-brand-primary" : ""} />
                    {tab.label}
                    {activeTab === tab.id && (
                       <motion.div 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary blur-[2px]"
                       />
                    )}
                  </button>
                ))}
             </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8 h-full"
                  >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-6 bg-brand-bg/30 p-6 rounded-2xl border border-brand-border">
                           <h4 className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest flex items-center gap-2">
                              <Sparkles size={14} className="text-brand-primary" /> Core Details
                           </h4>
                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest">Project Name</label>
                                 <input 
                                   defaultValue={project.projectName}
                                   className="w-full bg-transparent border-b border-brand-border pb-1 font-black text-lg text-brand-text focus:border-brand-primary outline-none transition-colors"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest">Client</label>
                                 <p className="font-bold text-brand-text">{project.clientName}</p>
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest">Production Status</label>
                                 <select 
                                   defaultValue={project.status}
                                   className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-bold text-brand-text outline-none focus:border-brand-primary cursor-pointer appearance-none"
                                 >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="cancelled">Cancelled</option>
                                 </select>
                              </div>
                           </div>
                        </section>
                        <section className="space-y-6 flex flex-col h-full">
                           <div className="flex-1 bg-brand-bg/30 p-6 rounded-2xl border border-brand-border flex flex-col">
                              <h4 className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-4">Internal Project Notes</h4>
                              <textarea 
                                className="flex-1 w-full bg-transparent outline-none resize-none text-sm text-brand-text-muted leading-relaxed"
                                placeholder="Add specific requirements, production notes or shipping details..."
                                defaultValue={project.notes}
                              />
                           </div>
                        </section>
                     </div>
                     <div className="flex justify-end pt-4">
                        <button className="px-10 py-4 bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                           <Save size={18} /> Save Changes
                        </button>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'products' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                     <div className="rounded-2xl border border-brand-border overflow-hidden">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-brand-bg/50">
                                 <th className="px-6 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Product Item</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest text-center">Qty</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest text-center">Timeline</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest text-right">Internal Cost</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest text-right">Client Proposal</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-brand-border">
                              {project.products?.map((item, i) => (
                                <tr key={i} className="hover:bg-brand-bg/30 transition-colors duration-200">
                                   <td className="px-6 py-4">
                                      <p className="text-sm font-black text-brand-text">{item.productName}</p>
                                      <p className="text-[10px] text-brand-text-muted font-bold tracking-tighter uppercase">{item.productId}</p>
                                   </td>
                                   <td className="px-6 py-4 text-center font-black text-brand-text">{item.quantity}</td>
                                   <td className="px-6 py-4 text-center text-xs font-bold text-brand-text-muted">{item.timelineDays} Days</td>
                                   <td className="px-6 py-4 text-right font-mono text-xs text-brand-text-muted tabular-nums">PKR {item.internalCost?.toLocaleString()}</td>
                                   <td className="px-6 py-4 text-right font-mono text-sm font-black text-brand-primary tabular-nums">PKR {item.clientCost?.toLocaleString()}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummaryStat label="Total Internal Cost" value={project.totalInternalCost} currency="PKR" color="text-brand-text" />
                        <SummaryStat label="Gross Margin" value={project.totalClientCost - project.totalInternalCost} currency="PKR" color="text-brand-primary" badge={`${Math.round(((project.totalClientCost - project.totalInternalCost) / project.totalClientCost) * 100)}%`} />
                        <SummaryStat label="Total Proposal Value" value={project.totalClientCost} currency="PKR" color="text-brand-primary" isMain />
                     </div>
                  </motion.div>
                )}

                {activeTab === 'timeline' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="space-y-10"
                  >
                     <div className="flex items-center justify-between mb-2">
                        <div className="space-y-1">
                           <h4 className="text-lg font-black text-brand-text flex items-center gap-2">
                              <Clock size={20} className="text-brand-primary" /> Visual Production Path
                           </h4>
                           <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest italic">Expected completion in approx. {project.timelineDays} working days</p>
                        </div>
                        <div className="flex gap-4">
                           <TimelineLegend color="bg-brand-primary" label="Design" />
                           <TimelineLegend color="bg-blue-500" label="Sourcing" />
                           <TimelineLegend color="bg-amber-500" label="Assembly" />
                           <TimelineLegend color="bg-purple-500" label="QC" />
                        </div>
                     </div>

                     <div className="space-y-6">
                        {project.products?.map((item, i) => (
                           <div key={i} className="space-y-3">
                              <div className="flex justify-between items-end">
                                 <span className="text-xs font-black text-brand-text uppercase tracking-tight">{item.productName}</span>
                                 <span className="text-[10px] font-black text-brand-text-muted uppercase">{item.timelineDays} Days</span>
                              </div>
                              <div className="h-4 bg-brand-bg rounded-full overflow-hidden flex shadow-inner">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-brand-primary" />
                                 <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 1, delay: i * 0.1 + 0.2 }} className="h-full bg-blue-500" />
                                 <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1, delay: i * 0.1 + 0.4 }} className="h-full bg-amber-500" />
                                 <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 1, delay: i * 0.1 + 0.6 }} className="h-full bg-purple-500" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
                )}

                {activeTab === 'invoice' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="h-full flex flex-col items-center justify-center space-y-8 py-10"
                  >
                     {project.invoiceId ? (
                        <div className="max-w-md w-full p-8 bg-purple-500/5 rounded-3xl border border-purple-500/20 text-center space-y-6 animate-in zoom-in-95 duration-500">
                           <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                              <Receipt size={40} className="text-purple-400" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest">Active Invoice</h4>
                              <p className="text-2xl font-black text-brand-text">{project.invoiceId}</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-left">
                              <div className="bg-brand-card p-4 rounded-xl border border-brand-border">
                                 <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest mb-1">Status</p>
                                 <p className="text-xs font-black text-brand-text uppercase">{project.invoiceStatus || 'Draft'}</p>
                              </div>
                              <div className="bg-brand-card p-4 rounded-xl border border-brand-border">
                                 <p className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest mb-1">Investment</p>
                                 <p className="text-xs font-black text-brand-text uppercase italic">PKR {project.totalClientCost.toLocaleString()}</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => navigate('/invoices', { state: { highlightId: project.invoiceId } })}
                             className="w-full h-14 bg-purple-500 hover:bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                           >
                              <ArrowUpRight size={20} /> View Invoice Details
                           </button>

                           <button 
                             onClick={async () => {
                               if (window.confirm("This will detach the current invoice reference. Use this if the invoice was deleted. Continue?")) {
                                 try {
                                   await updateDoc(doc(db, 'projects', project.id), {
                                     invoiceId: deleteField(),
                                     invoiceStatus: deleteField()
                                   });
                                   toast.success("Project-Invoice link reset");
                                 } catch (err) {
                                   toast.error("Failed to reset link");
                                 }
                               }
                             }}
                             className="w-full py-2 text-[9px] font-black text-brand-text-muted hover:text-red-400 uppercase tracking-[0.2em] transition-all"
                           >
                              Reset or Detach Link
                           </button>
                        </div>
                     ) : (
                        <div className="text-center space-y-6 max-w-sm">
                           <div className="w-24 h-24 bg-brand-bg rounded-full flex items-center justify-center mx-auto border border-brand-border border-dashed">
                              <FileText size={48} className="text-brand-text-muted opacity-20" />
                           </div>
                           <div>
                              <h3 className="text-xl font-black text-brand-text">No Invoice Generated</h3>
                              <p className="text-brand-text-muted text-sm font-medium mt-2">This project is not yet linked to an active invoice. Generate one to track billing.</p>
                           </div>
                           <button 
                             onClick={() => navigate('/invoices', { state: { createFromProject: project } })}
                             className="w-full h-14 bg-brand-primary hover:bg-brand-primary-hover text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                           >
                              <Plus size={20} /> Create Invoice for This Project
                           </button>
                        </div>
                     )}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryStat({ label, value, currency, color, isMain, badge }) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border flex flex-col justify-center",
      isMain ? "bg-brand-primary/5 border-brand-primary/20" : "bg-brand-bg/50 border-brand-border"
    )}>
       <div className="flex items-center justify-between mb-2">
         <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">{label}</p>
         {badge && <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[8px] font-black rounded uppercase tracking-widest">{badge}</span>}
       </div>
       <div className="flex items-baseline gap-1.5">
          <span className={cn("text-[10px] font-bold", isMain ? "text-brand-primary" : "text-brand-text-muted")}>{currency}</span>
          <span className={cn("text-xl font-black tabular-nums", color)}>{value.toLocaleString()}</span>
       </div>
    </div>
  );
}

function TimelineLegend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-[10px] font-black text-brand-text-muted uppercase tracking-tight">{label}</span>
    </div>
  );
}

// Global scope styles within this file
const dropdownStyles = `
  select option {
    background-color: #1A1A1A;
    color: #FFFFFF;
    padding: 12px;
  }
`;

// Add style tag to document head on component mount
if (typeof document !== 'undefined') {
  const styleId = 'projects-dropdown-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = dropdownStyles;
    document.head.appendChild(style);
  }
}
