import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, updateDoc, doc, getDocs, where,
  writeBatch, deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  KanbanSquare, Plus, Clock, CheckCircle2, AlertCircle, 
  User, Calendar, MoreHorizontal, Loader2, ShieldCheck, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const COLUMNS = [
  { id: 'Pending', name: 'Pending', color: 'bg-gray-500', text: 'text-gray-500' },
  { id: 'In Progress', name: 'In Progress', color: 'bg-amber-500', text: 'text-amber-500' },
  { id: 'Completed', name: 'Completed', color: 'bg-green-500', text: 'text-green-500' },
  { id: 'Blocked', name: 'Blocked', color: 'bg-red-500', text: 'text-red-500' }
];

const DEPARTMENTS = ['All Departments', 'Design', 'Printing', 'Fabrication', 'Installation', 'Services', 'Finishing'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function Kanban() {
  const { currentUser, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('All Departments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  
  const [newTicket, setNewTicket] = useState({
    joNo: '',
    dept: 'Design',
    title: '',
    assignee: '',
    priority: 'Medium',
    dueDate: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTasks = tasks.filter(task => 
    filterDept === 'All Departments' || task.dept === filterDept
  );

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      await updateDoc(doc(db, 'tasks', taskId), { 
        status,
        updatedAt: serverTimestamp()
      });
      toast.success(`Task moved to ${status}`);
    } catch (error) {
      toast.error('Failed to update task status');
    }
    setDraggedTaskId(null);
  };

  const handleApprove = async (taskId, ticketNo) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { 
        approved: true,
        approvedBy: currentUser.uid,
        approvedByName: userProfile?.displayName || currentUser.email,
        approvedAt: serverTimestamp()
      });
      toast.success(`Task ${ticketNo} approved`);
    } catch (error) {
      toast.error('Failed to approve task');
    }
  };

  const handleBulkApprove = async () => {
    const pendingApprovals = filteredTasks.filter(t => t.status === 'Completed' && !t.approved);
    if (pendingApprovals.length === 0) return;

    if (!confirm(`Approve all ${pendingApprovals.length} completed tasks?`)) return;

    try {
      const batch = writeBatch(db);
      pendingApprovals.forEach(task => {
        batch.update(doc(db, 'tasks', task.id), {
          approved: true,
          approvedBy: currentUser.uid,
          approvedByName: userProfile?.displayName || currentUser.email,
          approvedAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast.success(`${pendingApprovals.length} tasks approved`);
    } catch (error) {
      toast.error('Bulk approval failed');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.joNo) {
      toast.error('Title and Job Order No. are required');
      return;
    }

    try {
      const tasksSnap = await getDocs(collection(db, 'tasks'));
      const ticketNo = `TK-${(tasksSnap.size + 1).toString().padStart(3, '0')}`;

      await addDoc(collection(db, 'tasks'), {
        ...newTicket,
        ticketNo,
        status: 'Pending',
        approved: false,
        createdBy: currentUser.uid,
        createdByName: userProfile?.displayName || currentUser.email,
        createdAt: serverTimestamp()
      });

      toast.success(`Ticket ${ticketNo} created`);
      setIsModalOpen(false);
      setNewTicket({
        joNo: '',
        dept: 'Design',
        title: '',
        assignee: '',
        priority: 'Medium',
        dueDate: ''
      });
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleTaskDelete = async (taskId, ticketNo) => {
    if (!confirm(`Delete ticket ${ticketNo}? This cannot be undone.`)) return;
    
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      toast.success(`Ticket ${ticketNo} deleted`);
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-brand-text-muted font-bold">Loading Production Board...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Task Board</h1>
          <p className="text-brand-text-muted mt-1">Track production tasks across departments</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-brand-card border border-brand-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none"
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {userProfile?.role === 'superadmin' && (
            <button 
              onClick={handleBulkApprove}
              className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-500 border border-green-600/30 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              <ShieldCheck size={18} />
              Bulk Approve
            </button>
          )}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-primary/20"
          >
            <Plus size={18} />
            New Ticket
          </button>
        </div>
      </header>

      {tasks.length === 0 ? (
        <div className="bg-brand-card border border-brand-border rounded-3xl p-12 text-center mt-10">
          <div className="w-20 h-20 bg-brand-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
            <KanbanSquare size={40} className="text-brand-text-muted" />
          </div>
          <h3 className="text-xl font-bold mb-2">No tasks yet</h3>
          <p className="text-brand-text-muted max-w-sm mx-auto mb-8">
            Create your first production ticket to start tracking progress across departments.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all"
          >
            + New Ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
          {COLUMNS.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="flex flex-col bg-brand-bg/50 rounded-2xl border border-brand-border/50 overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between border-b border-brand-border/50 bg-brand-card/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.color}`} />
                    <h3 className="font-bold text-sm">{col.name}</h3>
                  </div>
                  <span className="bg-brand-card px-2 py-0.5 rounded text-[10px] font-bold text-brand-text-muted">
                    {columnTasks.length}
                  </span>
                </div>
                
                <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar max-h-[70vh]">
                  {columnTasks.map(task => (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className="bg-brand-card border border-brand-border p-4 rounded-xl shadow-lg hover:border-brand-primary/50 transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskDelete(task.id, task.ticketNo);
                        }}
                        className="absolute top-2 right-2 p-1.5 text-brand-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                        title="Delete Ticket"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-brand-primary font-bold">{task.ticketNo}</span>
                        <span className="text-[10px] bg-brand-bg px-2 py-0.5 rounded-full font-bold text-brand-text-muted border border-brand-border uppercase">
                          {task.dept}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-sm mb-3 group-hover:text-brand-primary transition-colors">
                        {task.title}
                      </h4>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="text-[10px] font-bold text-brand-text-muted bg-brand-bg px-2 py-0.5 rounded border border-brand-border">
                          JO: {task.joNo}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-brand-border/50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] text-brand-text-muted">
                            <User size={12} />
                            <span className="truncate max-w-[60px]">{task.assignee || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-brand-text-muted">
                            <Calendar size={12} />
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            task.priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                            task.priority === 'Medium' ? 'bg-amber-500' : 'bg-gray-500'
                          }`} />
                          
                          {task.status === 'Completed' && !task.approved && userProfile?.role === 'superadmin' && (
                            <button 
                              onClick={() => handleApprove(task.id, task.ticketNo)}
                              className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white p-1 rounded-md transition-all border border-green-500/20"
                              title="Approve Task"
                            >
                              <ShieldCheck size={14} />
                            </button>
                          )}
                          {task.approved && (
                            <CheckCircle2 size={14} className="text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-brand-border/30 rounded-xl flex items-center justify-center text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-card border border-brand-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg/30">
              <h2 className="text-xl font-bold">New Production Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-text-muted hover:text-white transition-colors">
                <AlertCircle size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Job Order No.</label>
                <input 
                  type="text"
                  value={newTicket.joNo}
                  onChange={(e) => setNewTicket({...newTicket, joNo: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  placeholder="JO-000000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Department</label>
                <select 
                  value={newTicket.dept}
                  onChange={(e) => setNewTicket({...newTicket, dept: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                >
                  {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Task Title</label>
                <input 
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  placeholder="Brief description of work"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Assignee</label>
                  <input 
                    type="text"
                    value={newTicket.assignee}
                    onChange={(e) => setNewTicket({...newTicket, assignee: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                    placeholder="Worker Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Priority</label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Due Date</label>
                <input 
                  type="date"
                  value={newTicket.dueDate}
                  onChange={(e) => setNewTicket({...newTicket, dueDate: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-brand-border font-bold hover:bg-brand-bg transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-brand-primary/20"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
