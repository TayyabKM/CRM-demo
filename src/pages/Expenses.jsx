import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, updateDoc, doc, getDocs, deleteDoc,
  where, limit, writeBatch
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingDown, Plus, Pencil, Trash2, Filter, 
  Calendar, PieChart, Banknote, Users, Wrench, 
  Truck, Megaphone, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Salaries', 'Raw Material', 'Rent', 'Utilities', 'Transport', 'Marketing', 'Maintenance', 'Other'];
const DEPARTMENTS = ['Design', 'Printing', 'Fabrication', 'Installation', 'Services', 'Finishing', 'Admin', 'Accounts'];
const MONTHS = ['April 2026', 'March 2026', 'February 2026', 'January 2026'];

export default function Expenses() {
  const { currentUser, userProfile } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState('April 2026');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Salaries',
    department: 'Admin',
    month: 'April 2026',
    amount: '',
    note: ''
  });
  const [hasCleaned, setHasCleaned] = useState(false);

  useEffect(() => {
    const checkAndSeed = async () => {
      const snapshot = await getDocs(collection(db, 'expenses'));
      if (snapshot.size === 0) {
        const seedData = [
          {category:"Salaries", department:"Design", month:"April 2026", amount:185000, note:"Design team April salaries"},
          {category:"Salaries", department:"Fabrication", month:"April 2026", amount:220000, note:"Production team April salaries"},
          {category:"Raw Material", department:"Printing", month:"April 2026", amount:145000, note:"Flex and vinyl restock"},
          {category:"Rent", department:"Admin", month:"April 2026", amount:85000, note:"Office + factory rent"},
          {category:"Utilities", department:"Admin", month:"April 2026", amount:32000, note:"Electricity + internet"},
          {category:"Transport", department:"Installation", month:"April 2026", amount:28000, note:"Delivery vehicles fuel"},
          {category:"Marketing", department:"Admin", month:"April 2026", amount:45000, note:"Social media + printing"},
          {category:"Maintenance", department:"Fabrication", month:"April 2026", amount:18000, note:"Machine maintenance"}
        ];
        
        const batch = writeBatch(db);
        seedData.forEach(item => {
          const ref = doc(collection(db, 'expenses'));
          batch.set(ref, {
            ...item,
            addedBy: currentUser?.uid || 'system',
            addedByName: currentUser?.displayName || 'System',
            createdAt: serverTimestamp()
          });
        });
        await batch.commit();
      }
    };
    
    if (currentUser) {
      checkAndSeed();
    }
  }, [currentUser]);

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const invQ = collection(db, 'invoices');
    const unsubscribeInv = onSnapshot(invQ, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      unsubscribeInv();
    };
  }, []);

  const filteredExpenses = expenses.filter(exp => {
    const matchesMonth = filterMonth === 'All' || exp.month === filterMonth;
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    return matchesMonth && matchesCategory;
  });

  const stats = useMemo(() => {
    const currentMonthExps = expenses.filter(e => e.month === 'April 2026');
    const total = currentMonthExps.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const salaries = currentMonthExps.filter(e => e.category === 'Salaries').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const overhead = currentMonthExps.filter(e => !['Salaries', 'Raw Material'].includes(e.category)).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    // Calculate ratio vs invoiced amount
    const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0) || 1000000; // Fallback for demo
    const ratio = (total / totalInvoiced) * 100;

    return { total, salaries, overhead, ratio };
  }, [expenses, invoices]);

  const categoryBreakdown = useMemo(() => {
    const totals = {};
    filteredExpenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + parseFloat(exp.amount || 0);
    });
    
    const totalFiltered = Object.values(totals).reduce((sum, v) => sum + v, 0) || 1;
    
    return Object.entries(totals).map(([name, amount]) => ({
      name,
      amount,
      percent: (amount / totalFiltered) * 100
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount) return;

    try {
      const data = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        updatedAt: serverTimestamp()
      };

      if (editingExpense) {
        await updateDoc(doc(db, 'expenses', editingExpense.id), data);
        toast.success('Expense updated');
      } else {
        await addDoc(collection(db, 'expenses'), {
          ...data,
          addedBy: currentUser.uid,
          addedByName: userProfile?.displayName || currentUser.email,
          createdAt: serverTimestamp()
        });
        toast.success('Expense added');
      }
      setIsModalOpen(false);
      setEditingExpense(null);
      setExpenseForm({ category: 'Salaries', department: 'Admin', month: 'April 2026', amount: '', note: '' });
    } catch (error) {
      toast.error('Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleFixDuplicates = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'expenses'));
      const allExps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const groups = {};
      allExps.forEach(exp => {
        const key = `${exp.category}-${exp.department}-${exp.month}-${exp.amount}-${exp.note}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(exp);
      });

      let removedCount = 0;
      for (const key in groups) {
        if (groups[key].length > 1) {
          // Keep the first, delete the rest
          const toDelete = groups[key].slice(1);
          for (const item of toDelete) {
            await deleteDoc(doc(db, 'expenses', item.id));
            removedCount++;
          }
        }
      }

      toast.success(`${removedCount} duplicate entries removed`);
      setHasCleaned(true);
    } catch (error) {
      toast.error('Failed to clear duplicates');
    }
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setExpenseForm({
      category: exp.category,
      department: exp.department,
      month: exp.month,
      amount: exp.amount,
      note: exp.note || ''
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-brand-text-muted font-bold">Loading Expense Ledger...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Expenses</h1>
          <p className="text-brand-text-muted mt-1">Track operational costs by department</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {!hasCleaned && (
            <button 
              onClick={handleFixDuplicates}
              className="flex items-center gap-2 border border-brand-border hover:bg-brand-bg px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              Fix Duplicates
            </button>
          )}

          <button 
            onClick={() => {
              setEditingExpense(null);
              setExpenseForm({ category: 'Salaries', department: 'Admin', month: 'April 2026', amount: '', note: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Expenses (Apr)', value: stats.total, icon: TrendingDown, color: 'text-white', bg: 'bg-brand-primary' },
          { label: 'Salaries', value: stats.salaries, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Overhead', value: stats.overhead, icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { 
            label: 'Expense Ratio', 
            value: `${stats.ratio.toFixed(1)}%`, 
            icon: PieChart, 
            color: stats.ratio < 30 ? 'text-green-500' : stats.ratio < 50 ? 'text-amber-500' : 'text-red-500', 
            bg: stats.ratio < 30 ? 'bg-green-500/10' : stats.ratio < 50 ? 'bg-amber-500/10' : 'bg-red-500/10' 
          }
        ].map(stat => (
          <div key={stat.label} className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-xl overflow-hidden relative group">
             <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {typeof stat.value === 'number' ? `PKR ${stat.value.toLocaleString()}` : stat.value}
                </p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-xl transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
            </div>
            {stat.label === 'Total Expenses (Apr)' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Expenses Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-brand-border bg-brand-bg/30 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-brand-bg px-3 py-1.5 rounded-lg border border-brand-border">
                <Calendar size={14} className="text-brand-text-muted" />
                <select 
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="All">All Months</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-brand-bg px-3 py-1.5 rounded-lg border border-brand-border">
                <Filter size={14} className="text-brand-text-muted" />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand-bg/50 text-brand-text-muted border-b border-brand-border">
                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Category</th>
                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Department</th>
                    <th className="px-6 py-4 font-bold text-[10px] uppercase text-right">Amount (PKR)</th>
                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Note</th>
                    <th className="px-6 py-4 font-bold text-[10px] uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-brand-bg/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.category === 'Salaries' ? 'bg-amber-500/10 text-amber-500' :
                          exp.category === 'Raw Material' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">{exp.department}</td>
                      <td className={`px-6 py-4 text-right font-black ${
                        exp.category === 'Salaries' ? 'text-amber-500' :
                        exp.category === 'Raw Material' ? 'text-blue-500' :
                        'text-red-500'
                      }`}>
                        {parseFloat(exp.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-[10px] text-brand-text-muted max-w-[200px] truncate">{exp.note || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(exp)}
                            className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-white transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          {userProfile?.role === 'superadmin' && (
                            <button 
                              onClick={() => handleDelete(exp.id)}
                              className="p-1.5 hover:bg-red-500/10 rounded-lg text-brand-text-muted hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-brand-bg/30 font-bold">
                    <td colSpan="2" className="px-6 py-4 text-right uppercase text-[10px]">Total for filtered</td>
                    <td className="px-6 py-4 text-right text-brand-primary">
                      PKR {filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toLocaleString()}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: By Category */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <PieChart size={18} className="text-brand-primary" />
              Category Breakdown
            </h3>
            
            <div className="space-y-6">
              {categoryBreakdown.map(cat => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold">{cat.name}</p>
                      <p className="text-[10px] text-brand-text-muted">PKR {cat.amount.toLocaleString()}</p>
                    </div>
                    <p className="text-xs font-black text-brand-primary">{cat.percent.toFixed(1)}%</p>
                  </div>
                  <div className="h-1.5 bg-brand-bg rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        cat.name === 'Salaries' ? 'bg-amber-500' :
                        cat.name === 'Raw Material' ? 'bg-blue-500' :
                        cat.name === 'Rent' ? 'bg-purple-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
              {categoryBreakdown.length === 0 && (
                <div className="py-12 text-center text-brand-text-muted text-sm border-2 border-dashed border-brand-border rounded-2xl">
                  No data for this filter
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-card border border-brand-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="p-6 border-b border-brand-border bg-brand-bg/30 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-text-muted hover:text-white transition-colors">
                <AlertCircle size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Category</label>
                  <select 
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Department</label>
                  <select 
                    value={expenseForm.department}
                    onChange={(e) => setExpenseForm({...expenseForm, department: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Month</label>
                  <select 
                    value={expenseForm.month}
                    onChange={(e) => setExpenseForm({...expenseForm, month: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Amount (PKR)</label>
                  <input 
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Note</label>
                <textarea 
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({...expenseForm, note: e.target.value})}
                  rows="3"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none"
                  placeholder="What was this for?"
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
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
