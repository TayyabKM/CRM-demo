import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { 
  collection, onSnapshot, query, where, orderBy, 
  updateDoc, doc, serverTimestamp, writeBatch, limit, getDocs, addDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Check, X, Clock, User, 
  Search, Filter, ChevronDown, History, 
  AlertCircle, CheckCircle2, Ban, Loader2,
  FileText, FolderCheck, Building2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/layout/Sidebar';

const DEPARTMENTS = ['All', 'Design', 'Printing', 'Fabrication', 'Installation', 'Services', 'Finishing'];

export default function Approvals() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [pendingEnquiries, setPendingEnquiries] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]); // For readiness tab
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enquiry'); // enquiry | project | readiness
  const [filterDept, setFilterDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [rejectingTask, setRejectingTask] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Pending approvals
    const qPending = query(
      collection(db, 'tasks'), 
      where('status', '==', 'Completed'), 
      where('approved', '==', false)
    );
    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Recently approved
    const qApproved = query(
      collection(db, 'tasks'), 
      where('approved', '==', true),
      orderBy('approvedAt', 'desc'),
      limit(10)
    );
    const unsubscribeApproved = onSnapshot(qApproved, (snapshot) => {
      setApprovedTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Pending Enquiries
    const qEnquiries = query(
      collection(db, 'enquiries'),
      where('approvalStatus', '==', 'pending_approval'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeEnq = onSnapshot(qEnquiries, (snapshot) => {
      setPendingEnquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Pending Projects (Admin Approval)
    const qProjects = query(
      collection(db, 'projects'),
      where('approvalStatus', '==', 'pending_admin_approval'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribePrj = onSnapshot(qProjects, (snapshot) => {
      setPendingProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Active Projects for Readiness tracking
    const qActivePrj = query(
      collection(db, 'projects'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribeActivePrj = onSnapshot(qActivePrj, (snapshot) => {
      setActiveProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribePending();
      unsubscribeApproved();
      unsubscribeEnq();
      unsubscribePrj();
      unsubscribeActivePrj();
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      pending: tasks.length,
      approvedToday: approvedTasks.filter(t => 
        t.approvedAt?.toDate() >= today
      ).length,
      blocked: tasks.filter(t => t.status === 'Blocked').length
    };
  }, [tasks, approvedTasks]);

  const handleApproveEnquiry = async (enquiry) => {
    setIsProcessing(true);
    try {
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const prjCount = projectsSnap.size + 1;
      const prjNo = `PRJ-${prjCount.toString().padStart(3, '0')}`;
      const joNo = `JO-${prjCount.toString().padStart(3, '0')}`;

      // 1. Update Enquiry
      await updateDoc(doc(db, 'enquiries', enquiry.id), {
        approvalStatus: 'approved',
        prjNo,
        joNo,
        approvedBy: currentUser.uid,
        approvedAt: serverTimestamp()
      });

      // 2. Create Project (Pending Admin Approval)
      const projectData = {
        projectNumber: prjNo,
        projectName: enquiry.projectTitle,
        clientName: enquiry.clientName,
        enqNo: enquiry.enqNo,
        joNo,
        status: "active",
        approvalStatus: "pending_admin_approval",
        deptReadiness: {
          finance: { status: 'pending', label: 'Finance' },
          inventory: { status: 'pending', label: 'Inventory' },
          design: { status: 'pending', label: 'Design' },
          production: { status: 'pending', label: 'Production' }
        },
        products: enquiry.estimatedProducts || [],
        totalInternalCost: enquiry.estimatedTotalCost || 0,
        totalClientCost: enquiry.totalRevenue || enquiry.estimatedClientTotal || 0,
        timelineDays: 14,
        source: "enquiry",
        createdBy: enquiry.createdBy,
        createdByName: enquiry.createdByName,
        createdAt: serverTimestamp(),
        notes: enquiry.brief
      };
      await addDoc(collection(db, 'projects'), projectData);

      // 3. Notify Admin for final sign-off
      await addDoc(collection(db, 'notifications'), {
        type: "project_approval",
        title: "Project Pending Admin Sign-off",
        message: `${enquiry.enqNo} approved. ${prjNo} created for ${enquiry.clientName}. Needs final department routing approval.`,
        forRole: "superadmin",
        actionRequired: true,
        actionType: "approve_project",
        createdAt: serverTimestamp()
      });

      toast.success(`Enquiry ${enquiry.enqNo} approved. Project ${prjNo} created.`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve enquiry');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveProject = async (project) => {
    setIsProcessing(true);
    try {
      // 1. Update Project Status
      await updateDoc(doc(db, 'projects', project.id), {
        approvalStatus: 'approved',
        approvedBy: currentUser.uid,
        approvedAt: serverTimestamp()
      });

      // 2. Notify Departments
      const depts = ['finance', 'inventory', 'design', 'production'];
      const batch = depts.map(dept => addDoc(collection(db, 'notifications'), {
        type: "department_readiness",
        title: `Action Required: ${project.projectNumber}`,
        message: `New project ${project.projectName} for ${project.clientName} is approved. Please confirm your department's readiness.`,
        forDept: dept,
        projectId: project.id,
        projectName: project.projectName,
        actionRequired: true,
        actionType: "dept_readiness",
        actionData: { dept },
        createdAt: serverTimestamp()
      }));
      await Promise.all(batch);

      toast.success(`Project ${project.projectNumber} approved and departments notified`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve project');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesDept = filterDept === 'All' || task.dept === filterDept;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.assignee?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleApprove = async (taskId, ticketNo) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        approved: true,
        approvedBy: currentUser.uid,
        approvedByName: userProfile?.displayName || currentUser.email,
        approvedAt: serverTimestamp(),
        status: 'Completed' // Ensure status stays completed
      });
      toast.success(`Task ${ticketNo} approved ✓`);
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async () => {
    if (!rejectingTask || !rejectReason) return;
    
    try {
      await updateDoc(doc(db, 'tasks', rejectingTask.id), {
        status: 'Blocked',
        rejectedBy: currentUser.uid,
        rejectedByName: userProfile?.displayName || currentUser.email,
        rejectedReason: rejectReason,
        rejectedAt: serverTimestamp()
      });
      toast.success('Task sent back for revision');
      setRejectingTask(null);
      setRejectReason('');
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const handleBulkApprove = async () => {
    if (filteredTasks.length === 0) return;
    if (!confirm(`Approve all ${filteredTasks.length} pending tasks?`)) return;

    try {
      const batch = writeBatch(db);
      filteredTasks.forEach(task => {
        batch.update(doc(db, 'tasks', task.id), {
          approved: true,
          approvedBy: currentUser.uid,
          approvedByName: userProfile?.displayName || currentUser.email,
          approvedAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast.success(`${filteredTasks.length} tasks approved`);
    } catch (error) {
      toast.error('Bulk approval failed');
    }
  };

  const formatRelativeDate = (date) => {
    if (!date) return 'Just now';
    const d = date.toDate();
    const diff = (new Date() - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-brand-text-muted font-bold">Checking Approval Queue...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-brand-text mb-2 flex items-center gap-3">
            Approvals & Sign-offs
            <div className="flex bg-[#3E3E3E] p-1 rounded-2xl border border-brand-border h-fit ml-4">
              <button
                onClick={() => setActiveTab('enquiry')}
                className={cn(
                  "px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
                  activeTab === 'enquiry' ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                Enquiry {pendingEnquiries.length > 0 && <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">{pendingEnquiries.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('project')}
                className={cn(
                  "px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
                  activeTab === 'project' ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                Project {pendingProjects.length > 0 && <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">{pendingProjects.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('readiness')}
                className={cn(
                  "px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
                  activeTab === 'readiness' ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                Readiness {tasks.length > 0 && <span className="bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">{tasks.length}</span>}
              </button>
            </div>
          </h1>
          <p className="text-brand-text-muted font-medium">Multi-stage pipeline approval workflow</p>
        </div>
        
        {userProfile?.role === 'superadmin' && activeTab === 'readiness' && filteredTasks.length > 0 && (
          <button 
            onClick={handleBulkApprove}
            className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-500 border border-green-600/30 px-6 py-2.5 rounded-xl font-bold transition-all"
          >
            <ShieldCheck size={20} />
            Bulk Approve Tasks
          </button>
        )}
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Approved Today', value: stats.approvedToday, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Blocked Tasks', value: stats.blocked, icon: Ban, color: 'text-red-500', bg: 'bg-red-500/10' }
        ].map(stat => (
          <div key={stat.label} className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-brand-text-muted uppercase mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'enquiry' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {pendingEnquiries.length === 0 ? (
              <div className="bg-brand-card border border-brand-border rounded-3xl p-16 text-center">
                <FileText size={60} className="text-brand-primary/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2">No pending enquiries</h3>
                <p className="text-brand-text-muted">New enquiries requiring approval will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingEnquiries.map(enq => (
                  <div key={enq.id} className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl hover:border-brand-primary/30 transition-all">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                          {enq.enqNo}
                        </span>
                        <span className="text-[10px] font-bold text-brand-text-muted uppercase">
                          Submitted {formatRelativeDate(enq.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-brand-text mb-1">{enq.clientName}</h3>
                      <p className="text-brand-text-muted text-sm font-medium mb-4">{enq.projectTitle}</p>
                      
                      <div className="grid grid-cols-2 gap-4 bg-brand-bg/50 p-4 rounded-xl border border-brand-border mb-6">
                        <div>
                          <p className="text-[10px] font-bold text-brand-text-muted uppercase">Est. Value</p>
                          <p className="text-lg font-black text-brand-primary">PKR {enq.totalRevenue?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-brand-text-muted uppercase">Process Owner</p>
                          <p className="text-sm font-bold text-brand-text">{enq.csOwner || 'System'}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          disabled={isProcessing}
                          onClick={() => handleApproveEnquiry(enq)}
                          className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          Approve & Create Project
                        </button>
                        <button 
                          disabled={isProcessing}
                          className="px-4 py-3 bg-brand-bg border border-brand-border text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Reject Enquiry"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'project' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {pendingProjects.length === 0 ? (
              <div className="bg-brand-card border border-brand-border rounded-3xl p-16 text-center">
                <FolderCheck size={60} className="text-brand-primary/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2">No projects pending sign-off</h3>
                <p className="text-brand-text-muted">Projects awaiting final department routing will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingProjects.map(prj => (
                  <div key={prj.id} className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl hover:border-brand-primary/30 transition-all">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
                          {prj.projectNumber}
                        </span>
                        <span className="text-[10px] font-bold text-brand-text-muted uppercase">
                          Created {formatRelativeDate(prj.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-brand-text mb-1">{prj.clientName}</h3>
                      <p className="text-brand-text-muted text-sm font-medium mb-4">{prj.projectName}</p>
                      
                      <div className="grid grid-cols-2 gap-4 bg-brand-bg/50 p-4 rounded-xl border border-brand-border mb-6">
                        <div>
                          <p className="text-[10px] font-bold text-brand-text-muted uppercase">Contract Value</p>
                          <p className="text-lg font-black text-brand-primary">PKR {prj.totalClientCost?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-brand-text-muted uppercase">Internal Est.</p>
                          <p className="text-sm font-bold text-brand-text">PKR {prj.totalInternalCost?.toLocaleString() || '0'}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          disabled={isProcessing}
                          onClick={() => handleApproveProject(prj)}
                          className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                          Approve & Notify Departments
                        </button>
                        <button 
                          disabled={isProcessing}
                          className="px-4 py-3 bg-brand-bg border border-brand-border text-brand-text font-bold text-xs rounded-xl hover:bg-brand-bg/80 transition-all"
                        >
                          Revision
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'readiness' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Department Readiness Tracker */}
            <section>
              <h2 className="text-xl font-black text-brand-text mb-6 flex items-center gap-2">
                <Building2 className="text-brand-primary" />
                Department Readiness Tracker
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map(prj => {
                  const readiness = prj.deptReadiness || {};
                  const readyCount = Object.values(readiness).filter(d => d.status === 'ready').length;
                  const blockedCount = Object.values(readiness).filter(d => d.status === 'not_ready').length;
                  
                  return (
                    <div key={prj.id} className="bg-brand-card border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-black text-sm text-brand-text truncate max-w-[180px]">{prj.projectName}</h4>
                          <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest">{prj.clientName}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-brand-primary">{prj.projectNumber}</span>
                      </div>
                      
                      <div className="flex gap-2 mb-4">
                        {['finance', 'inventory', 'design', 'production'].map(dept => (
                          <div 
                            key={dept} 
                            className={cn(
                              "w-3 h-3 rounded-full",
                              readiness[dept]?.status === 'ready' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                              readiness[dept]?.status === 'not_ready' ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                              "bg-brand-bg border border-brand-border"
                            )}
                            title={`${dept.toUpperCase()}: ${readiness[dept]?.status || 'Pending'}${readiness[dept]?.reason ? ` - ${readiness[dept].reason}` : ''}`}
                          />
                        ))}
                      </div>

                      {blockedCount > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                          <p className="text-[10px] font-black text-red-500 flex items-center gap-1 uppercase mb-1">
                            <AlertTriangle size={12} />
                            Blocker Detected
                          </p>
                          <p className="text-[10px] text-red-400 font-medium italic">
                            {Object.entries(readiness).find(([_, d]) => d.status === 'not_ready')?.[1].reason}
                          </p>
                          {readiness.finance?.status === 'not_ready' && (
                            <button 
                              onClick={() => navigate('/receivables')}
                              className="mt-2 text-[10px] font-bold text-brand-primary flex items-center gap-1 hover:underline"
                            >
                              Check Payments <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-brand-border">
                        <p className="text-[10px] font-bold text-brand-text-muted uppercase">Ready: {readyCount}/4</p>
                        <div className="flex-1 max-w-[80px] h-1.5 bg-brand-bg rounded-full ml-3 overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", blockedCount > 0 ? "bg-red-500" : "bg-brand-primary")}
                            style={{ width: `${(readyCount / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Task Approvals (Original Content) */}
            <section className="pt-8 border-t border-brand-border">
              <h2 className="text-xl font-black text-brand-text mb-6 flex items-center gap-2">
                <ShieldCheck className="text-brand-primary" />
                Job Task Final Sign-offs
              </h2>
              
              {/* Filter Bar */}
              <div className="bg-brand-card border border-brand-border p-4 rounded-2xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex bg-brand-bg p-1 rounded-xl w-full lg:w-auto overflow-x-auto custom-scrollbar">
                  {DEPARTMENTS.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setFilterDept(dept)}
                      className={`flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                        filterDept === dept ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-muted hover:text-brand-text'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                
                <div className="relative w-full lg:flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
                  <input 
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 bg-brand-bg border border-brand-border rounded-xl pl-12 pr-4 text-xs font-medium focus:border-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTasks.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-brand-bg/30 rounded-3xl border border-dashed border-brand-border">
                    <p className="text-brand-text-muted font-bold">No tasks pending sign-off</p>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <div key={task.id} className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl hover:border-brand-primary/30 transition-all group">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-brand-bg px-2.5 py-1 rounded-lg text-[10px] font-black text-brand-primary border border-brand-primary/20 uppercase tracking-widest">
                            {task.dept}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-bold text-brand-text-muted">{task.ticketNo}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              task.priority === 'High' ? 'bg-red-500' : 
                              task.priority === 'Medium' ? 'bg-amber-500' : 'bg-gray-500'
                            }`} />
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-black mb-4 group-hover:text-brand-primary transition-colors">{task.title}</h3>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="flex items-center gap-2 text-brand-text-muted">
                            <FileText size={14} className="text-brand-primary" />
                            <span className="font-bold uppercase tracking-widest">JO: {task.joNo}</span>
                          </div>
                          <div className="flex items-center gap-2 text-brand-text-muted">
                            <User size={14} className="text-brand-primary" />
                            <span className="font-bold">{task.assignee || 'Unassigned'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 border-t border-brand-border">
                        <button 
                          onClick={() => handleApprove(task.id, task.ticketNo)}
                          className="flex items-center justify-center gap-2 py-4 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
                        >
                          <Check size={18} />
                          Approve
                        </button>
                        <button 
                          onClick={() => setRejectingTask(task)}
                          className="flex items-center justify-center gap-2 py-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all border-l border-brand-border"
                        >
                          <X size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="mt-16">
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="flex items-center justify-between w-full mb-6 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-card border border-brand-border rounded-lg group-hover:text-brand-primary transition-all">
              <History size={20} />
            </div>
            <h2 className="text-xl font-bold">Recently Approved</h2>
          </div>
          <ChevronDown className={`text-brand-text-muted transition-transform duration-300 ${isHistoryOpen ? '' : '-rotate-90'}`} />
        </button>
        
        {isHistoryOpen && (
          <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-top-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand-bg/50 text-brand-text-muted border-b border-brand-border">
                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Task</th>
                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Department</th>
                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Approved By</th>
                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {approvedTasks.map(task => (
                    <tr key={task.id} className="hover:bg-brand-bg/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <div>
                            <p className="font-bold text-xs">{task.title}</p>
                            <p className="text-[10px] font-mono text-brand-text-muted">{task.ticketNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-brand-bg px-2 py-0.5 rounded border border-brand-border font-bold uppercase">{task.dept}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-[10px] font-bold">
                            {task.approvedByName?.substring(0, 1) || 'A'}
                          </div>
                          <span>{task.approvedByName || 'Admin'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-brand-text-muted">
                        {task.approvedAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {approvedTasks.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-brand-text-muted">No recently approved tasks</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingTask && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-card border border-brand-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="p-6 border-b border-brand-border bg-red-500/10 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
                <AlertCircle size={22} />
                Reject Task
              </h2>
              <button onClick={() => setRejectingTask(null)} className="text-brand-text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-brand-text-muted">
                You are rejecting <span className="text-brand-text font-bold">{rejectingTask.ticketNo} - {rejectingTask.title}</span>. 
                Please provide a reason for the production team.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Reason for rejection</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-all h-32 resize-none"
                  placeholder="Explain what needs to be fixed..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setRejectingTask(null)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border font-bold hover:bg-brand-bg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject}
                  disabled={!rejectReason}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
