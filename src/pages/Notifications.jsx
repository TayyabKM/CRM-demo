import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { 
  collection, query, where, onSnapshot, orderBy, 
  doc, updateDoc, serverTimestamp, addDoc, getDoc 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, CheckCircle2, AlertTriangle, Building2, 
  ClipboardCheck, FolderCheck, XCircle, Clock,
  ChevronRight, ArrowRight, Loader2, Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/layout/Sidebar';

export default function Notifications() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | action | completed
  const [isResponding, setIsResponding] = useState(false);
  const [blockerModal, setBlockerModal] = useState({ isOpen: false, notification: null, reason: '' });

  useEffect(() => {
    if (!currentUser || !userProfile) return;

    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Client-side filtering because Firestore doesn't support complex OR with different fields well without composite indices for every combo
      const filteredForUser = allNotifs.filter(n => 
        n.forUserId === currentUser.uid || 
        n.forRole === userProfile.role || 
        (n.forDept && n.forDept === userProfile.department)
      );

      setNotifications(filteredForUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  const stats = useMemo(() => {
    const unread = notifications.filter(n => n.status === 'unread').length;
    const action = notifications.filter(n => n.actionRequired && !n.response).length;
    const completed = notifications.filter(n => n.response).length;
    return { unread, action, completed };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'unread': return notifications.filter(n => n.status === 'unread');
      case 'action': return notifications.filter(n => n.actionRequired && !n.response);
      case 'completed': return notifications.filter(n => n.response);
      default: return notifications;
    }
  }, [notifications, filter]);

  const markAllRead = async () => {
    const unreadNotifs = notifications.filter(n => n.status === 'unread');
    if (unreadNotifs.length === 0) return;

    try {
      const batch = unreadNotifs.map(n => updateDoc(doc(db, 'notifications', n.id), { status: 'read' }));
      await Promise.all(batch);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleCardClick = async (notif) => {
    if (notif.status === 'unread') {
      await updateDoc(doc(db, 'notifications', notif.id), { status: 'read' });
    }
  };

  const handleAction = async (notif, response, reason = '') => {
    setIsResponding(true);
    try {
      // 1. Update notification
      const notifRef = doc(db, 'notifications', notif.id);
      await updateDoc(notifRef, {
        response,
        responseReason: reason,
        respondedBy: userProfile.displayName || currentUser.email,
        respondedAt: serverTimestamp(),
        status: 'actioned'
      });

      // 2. Update project deptReadiness
      if (notif.actionType === 'dept_readiness' && notif.projectId) {
        const projectRef = doc(db, 'projects', notif.projectId);
        const dept = notif.actionData?.dept || userProfile.department;
        
        if (dept) {
          const updateData = {};
          updateData[`deptReadiness.${dept}.status`] = response;
          if (reason) updateData[`deptReadiness.${dept}.reason`] = reason;
          updateData[`deptReadiness.${dept}.respondedBy`] = userProfile.displayName || currentUser.email;
          
          await updateDoc(projectRef, updateData);
        }
      }

      // 3. Notify SuperAdmin
      await addDoc(collection(db, 'notifications'), {
        type: (response === 'not_ready' && (notif.actionData?.dept === 'finance' || userProfile.department === 'finance')) ? 'finance_blocker' : 'department_readiness',
        title: `${response === 'ready' ? '✅' : '⚠️'} ${userProfile.department?.toUpperCase() || 'Dept'} ${response === 'ready' ? 'Ready' : 'Blocker'}: ${notif.projectName || 'Project'}`,
        message: `${userProfile.displayName || currentUser.email} from ${userProfile.department || 'their department'} confirmed ${response === 'ready' ? 'readiness' : 'a blocker'} for ${notif.projectName || 'the project'}.${reason ? `\nReason: ${reason}` : ''}`,
        forRole: 'superadmin',
        actionRequired: response === 'not_ready',
        projectId: notif.projectId || null,
        projectName: notif.projectName || null,
        fromUserId: currentUser.uid,
        fromUserName: userProfile.displayName || currentUser.email,
        status: 'unread',
        createdAt: serverTimestamp()
      });

      toast.success('Response submitted successfully');
      setBlockerModal({ isOpen: false, notification: null, reason: '' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit response');
    } finally {
      setIsResponding(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'enquiry_approval': return <ClipboardCheck className="text-amber-500" />;
      case 'project_approval': return <FolderCheck className="text-green-500" />;
      case 'department_readiness': return <Building2 className="text-blue-500" />;
      case 'finance_blocker': return <AlertTriangle className="text-red-500" />;
      case 'enquiry_rejected': return <XCircle className="text-red-500" />;
      default: return <Bell className="text-brand-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        <p className="text-brand-text-muted font-bold animate-pulse">Loading inbox...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-brand-text mb-2">My Notifications</h1>
          <p className="text-brand-text-muted font-medium">Tasks and updates for your department</p>
        </div>
        <button 
          onClick={markAllRead}
          className="px-6 py-2.5 rounded-xl border border-brand-border text-brand-text font-bold text-sm hover:bg-brand-bg transition-all"
        >
          Mark All Read
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
            <Bell size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Unread</p>
            <p className="text-2xl font-black text-brand-text">{stats.unread}</p>
          </div>
        </div>
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          {stats.action > 0 && <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Action Required</p>
            <p className="text-2xl font-black text-brand-text">{stats.action}</p>
          </div>
        </div>
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-black text-brand-text">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex bg-[#3E3E3E] p-1 rounded-2xl border border-brand-border w-fit">
        {['all', 'unread', 'action', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-xs capitalize transition-all",
              filter === f ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
            )}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-brand-card border border-brand-border border-dashed rounded-3xl p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mx-auto text-brand-text-muted">
              <Bell size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-text">You're all caught up</h3>
              <p className="text-brand-text-muted font-medium">No notifications at the moment.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div 
              key={notif.id}
              onClick={() => handleCardClick(notif)}
              className={cn(
                "bg-brand-card border-l-[3px] rounded-2xl p-5 transition-all relative group",
                notif.status === 'unread' ? "border-l-brand-primary bg-white/5" : "border-l-transparent",
                notif.actionRequired && !notif.response && "ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
                notif.type === 'finance_blocker' && "border-l-red-500"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-center shrink-0">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-brand-text">{notif.title}</h4>
                      {notif.status === 'unread' && <div className="w-2 h-2 bg-brand-primary rounded-full" />}
                    </div>
                    <p className="text-brand-text-muted text-sm font-medium leading-relaxed whitespace-pre-wrap">{notif.message}</p>
                    {notif.projectName && (
                      <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-2 flex items-center gap-1">
                        <FolderCheck size={12} />
                        Project: {notif.projectName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-tighter flex items-center gap-1 justify-end">
                    <Clock size={10} />
                    {notif.createdAt?.toDate() ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
              </div>

              {/* Action Area */}
              {notif.actionRequired && (
                <div className="mt-5 pt-5 border-t border-brand-border/50 flex gap-3">
                  {(notif.actionType === 'approve_enquiry' || notif.actionType === 'approve_project') ? (
                    <button 
                      onClick={() => navigate('/approvals')}
                      className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/20"
                    >
                      Go to Approvals
                      <ArrowRight size={14} />
                    </button>
                  ) : notif.actionType === 'dept_readiness' && !notif.response ? (
                    <>
                      <button 
                        disabled={isResponding}
                        onClick={() => handleAction(notif, 'ready')}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                      >
                        {isResponding ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        We're Ready
                      </button>
                      <button 
                        disabled={isResponding}
                        onClick={() => setBlockerModal({ isOpen: true, notification: notif, reason: '' })}
                        className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500/5 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        We Can't Proceed
                      </button>
                    </>
                  ) : notif.response ? (
                    <div className={cn(
                      "flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest",
                      notif.response === 'ready' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {notif.response === 'ready' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {notif.response === 'ready' ? 'Confirmed Ready' : 'Blocker Reported'}
                      <span className="ml-2 opacity-50 font-medium normal-case">by {notif.respondedBy}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Blocker Modal */}
      {blockerModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-brand-text mb-2 flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Reason for Delay
            </h3>
            <p className="text-brand-text-muted text-sm font-medium mb-6">Please explain what's needed before you can proceed with this project.</p>
            
            <textarea 
              autoFocus
              className="w-full bg-brand-bg border border-brand-border rounded-2xl p-4 text-brand-text text-sm focus:border-red-500 outline-none transition-all resize-none mb-6 h-32"
              placeholder="e.g. Budget not approved yet / Missing critical raw material..."
              value={blockerModal.reason}
              onChange={(e) => setBlockerModal({...blockerModal, reason: e.target.value})}
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setBlockerModal({ isOpen: false, notification: null, reason: '' })}
                className="flex-1 py-3 bg-brand-bg text-brand-text-muted font-bold rounded-xl hover:text-brand-text transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={!blockerModal.reason || isResponding}
                onClick={() => handleAction(blockerModal.notification, 'not_ready', blockerModal.reason)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {isResponding ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Submit Blocker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
