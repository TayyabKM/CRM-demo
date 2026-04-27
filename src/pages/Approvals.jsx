import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { 
  collection, onSnapshot, query, where, orderBy, 
  updateDoc, doc, serverTimestamp, writeBatch, limit
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Check, X, Clock, User, 
  Search, Filter, ChevronDown, History, 
  AlertCircle, CheckCircle2, Ban, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const DEPARTMENTS = ['All', 'Design', 'Printing', 'Fabrication', 'Installation', 'Services', 'Finishing'];

export default function Approvals() {
  const { currentUser, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [rejectingTask, setRejectingTask] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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

    return () => {
      unsubscribePending();
      unsubscribeApproved();
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
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-brand-text">Internal Approvals</h1>
          {stats.pending > 0 && (
            <div className="bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              {stats.pending}
            </div>
          )}
        </div>
        
        {userProfile?.role === 'superadmin' && filteredTasks.length > 0 && (
          <button 
            onClick={handleBulkApprove}
            className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-500 border border-green-600/30 px-6 py-2.5 rounded-xl font-bold transition-all"
          >
            <ShieldCheck size={20} />
            Bulk Approve All
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

      {/* Filter Bar */}
      <div className="bg-brand-card border border-brand-border p-4 rounded-2xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex bg-brand-bg p-1 rounded-xl w-full lg:w-auto">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterDept === dept ? 'bg-brand-primary text-white' : 'text-brand-text-muted hover:text-brand-text'
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
            placeholder="Search by task title or assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Approval List */}
      <div className="space-y-4 mb-12">
        {filteredTasks.length === 0 ? (
          <div className="bg-brand-card border border-brand-border rounded-3xl p-16 text-center">
            <ShieldCheck size={60} className="text-brand-primary/20 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">All clear — no pending approvals</h3>
            <p className="text-brand-text-muted">Completed tasks will appear here for sign-off.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl hover:border-brand-primary/30 transition-all group">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-brand-bg px-2.5 py-1 rounded-lg text-[10px] font-bold text-brand-primary border border-brand-primary/20 uppercase">
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
                  
                  <h3 className="text-lg font-bold mb-4 group-hover:text-brand-primary transition-colors">{task.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2 text-brand-text-muted">
                      <div className="w-6 h-6 bg-brand-bg rounded-full flex items-center justify-center">
                        <Search size={12} />
                      </div>
                      <span className="font-bold">JO: {task.joNo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-text-muted">
                      <div className="w-6 h-6 bg-brand-bg rounded-full flex items-center justify-center text-brand-primary">
                        <User size={12} />
                      </div>
                      <span className="font-bold">{task.assignee || 'Unassigned'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-brand-text-muted">
                      <Clock size={12} />
                      <span>Completed {formatRelativeDate(task.updatedAt || task.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 border-t border-brand-border">
                  <button 
                    onClick={() => handleApprove(task.id, task.ticketNo)}
                    className="flex items-center justify-center gap-2 py-4 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white font-bold transition-all"
                  >
                    <Check size={18} />
                    Approve
                  </button>
                  <button 
                    onClick={() => setRejectingTask(task)}
                    className="flex items-center justify-center gap-2 py-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white font-bold transition-all border-l border-brand-border"
                  >
                    <X size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
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
