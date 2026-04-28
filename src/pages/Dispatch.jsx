import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, updateDoc, doc, getDocs, deleteDoc,
  where, writeBatch
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, Plus, Search, Filter, Calendar, 
  Clock, CheckCircle, AlertCircle, ExternalLink, 
  MoreHorizontal, Loader2, Printer, Trash2, MapPin, 
  User, Package, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['All', 'Pending', 'In Transit', 'Delivered', 'Returned'];

export default function Dispatch() {
  const { currentUser, userProfile, hasPermission } = useAuth();
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');
  
  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    joNo: '',
    projectName: '',
    dispatchTo: '',
    driverName: '',
    vehicleNo: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ description: '', quantity: 1, unit: 'pcs' }]
  });

  useEffect(() => {
    const q = query(collection(db, 'dispatches'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Seed logic
        const seedData = [
          {
            dcNo: "DC-001", joNo: "JO-001", projectName: "Metro Branch Branding",
            clientName: "Metro Cash & Carry", clientPhone: "0322-5544332",
            items: [
              {description:"Shop Signage 4x2ft", quantity:3, unit:"pcs"},
              {description:"Flex Banner 10x4ft", quantity:5, unit:"pcs"}
            ],
            dispatchTo: "Metro Store, DHA Phase 5, Lahore", driverName: "Asif Khan",
            vehicleNo: "LHR-2341", status: "Delivered", notes: "Handle with care",
            deliveredDate: new Date()
          },
          {
            dcNo: "DC-002", joNo: "JO-002", projectName: "HBL Branch Campaign",
            clientName: "HBL Bank", clientPhone: "0300-1234567",
            items: [
              {description:"Standing Standee 6ft", quantity:10, unit:"pcs"},
              {description:"Counter Display", quantity:4, unit:"pcs"},
              {description:"Window Vinyl", quantity:8, unit:"sqft"}
            ],
            dispatchTo: "HBL Main Branch, Gulberg III, Lahore", driverName: "Tariq Mahmood",
            vehicleNo: "LHR-5567", status: "In Transit", notes: ""
          },
          {
            dcNo: "DC-003", joNo: "JO-003", projectName: "Engro Annual Event",
            clientName: "Engro Corporation", clientPhone: "0321-9876543",
            items: [
              {description:"Exhibition Stall Panels", quantity:6, unit:"pcs"},
              {description:"Fabric Backdrop 12x8ft", quantity:2, unit:"pcs"}
            ],
            dispatchTo: "Expo Centre, Hall 3, Lahore", driverName: "Kamran Ali",
            vehicleNo: "LHR-8821", status: "Pending", notes: "Installation team going separately"
          }
        ];
        
        const batch = writeBatch(db);
        seedData.forEach((dc, i) => {
          const ref = doc(collection(db, 'dispatches'));
          batch.set(ref, {
            ...dc,
            createdBy: currentUser?.uid || 'system',
            createdByName: userProfile?.displayName || 'System',
            createdAt: serverTimestamp(),
            dispatchDate: serverTimestamp()
          });
        });
        await batch.commit();
      } else {
        setDispatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const stats = useMemo(() => {
    const total = dispatches.length;
    const pending = dispatches.filter(d => d.status === 'Pending').length;
    const inTransit = dispatches.filter(d => d.status === 'In Transit').length;
    
    const today = new Date().toLocaleDateString();
    const deliveredToday = dispatches.filter(d => {
      if (d.status !== 'Delivered' || !d.deliveredDate) return false;
      const dDate = d.deliveredDate.toDate ? d.deliveredDate.toDate() : new Date(d.deliveredDate);
      return dDate.toLocaleDateString() === today;
    }).length;

    return { total, pending, inTransit, deliveredToday };
  }, [dispatches]);

  const filteredDispatches = dispatches.filter(d => {
    const matchesTab = activeTab === 'All' || d.status === activeTab;
    const matchesSearch = 
      d.dcNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.joNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Simple date filter placeholder logic
    const matchesDate = true; 
    
    return matchesTab && matchesSearch && matchesDate;
  });

  const handleCreateDC = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0 || !formData.items[0].description) {
      toast.error("At least one item is required");
      return;
    }

    try {
      const dcNo = `DC-${(dispatches.length + 1).toString().padStart(3, '0')}`;
      await addDoc(collection(db, 'dispatches'), {
        ...formData,
        dcNo,
        status: 'Pending',
        createdBy: currentUser.uid,
        createdByName: userProfile?.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        dispatchDate: new Date(formData.dispatchDate)
      });
      
      toast.success(`Delivery Challan ${dcNo} created`);
      setIsNewModalOpen(false);
      setFormData({
        clientName: '', clientPhone: '', joNo: '', projectName: '',
        dispatchTo: '', driverName: '', vehicleNo: '',
        dispatchDate: new Date().toISOString().split('T')[0],
        notes: '', items: [{ description: '', quantity: 1, unit: 'pcs' }]
      });
    } catch (error) {
      toast.error("Failed to create DC");
    }
  };

  const updateStatus = async (id, status, dcNo) => {
    try {
      const updates = { 
        status, 
        updatedAt: serverTimestamp() 
      };
      if (status === 'Delivered') {
        updates.deliveredDate = serverTimestamp();
      }
      await updateDoc(doc(db, 'dispatches', id), updates);
      toast.success(`${dcNo} marked as ${status.toLowerCase()} ✓`);
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id, dcNo) => {
    if (!confirm(`Delete DC ${dcNo}?`)) return;
    try {
      await deleteDoc(doc(db, 'dispatches', id));
      toast.success("DC deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit: 'pcs' }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-brand-text-muted font-bold">Loading Dispatch Logs...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Dispatch / Delivery</h1>
          <p className="text-brand-text-muted mt-1">Manage delivery challans and tracking</p>
        </div>
        
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20"
        >
          <Truck size={18} />
          + New DC
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total DCs', value: stats.total, icon: Package, color: 'text-white', bg: 'bg-brand-card' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'In Transit', value: stats.inTransit, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10', pulse: stats.inTransit > 0 },
          { label: 'Delivered Today', value: stats.deliveredToday, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-xl relative group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  {stat.pulse && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
                </div>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-xl transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-brand-card border border-brand-border p-4 rounded-2xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex bg-brand-bg p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
          {STATUSES.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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
            placeholder="Search DC#, Client, or JO#..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-2 bg-brand-bg px-3 py-2.5 rounded-xl border border-brand-border w-full lg:w-auto">
          <Calendar size={16} className="text-brand-text-muted" />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-xs font-bold focus:outline-none"
          >
            <option>All Time</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* Dispatch Table */}
      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-brand-bg/50 text-brand-text-muted border-b border-brand-border">
                <th className="px-6 py-4 font-bold text-[10px] uppercase">DC#</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">JO#</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Client</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Items</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Dispatch To</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Logistics</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase text-center">Status</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase text-center">Date</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredDispatches.map(dc => (
                <tr key={dc.id} className="hover:bg-brand-bg/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-brand-primary">{dc.dcNo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] text-brand-text-muted">{dc.joNo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-xs">{dc.clientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group/items">
                      <span className="text-[10px] bg-brand-bg px-2 py-0.5 rounded border border-brand-border font-bold">
                        {dc.items?.length || 0} items
                      </span>
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1A1A1A] border border-brand-border p-2 rounded-lg shadow-2xl opacity-0 group-hover/items:opacity-100 pointer-events-none transition-opacity z-50">
                        {dc.items?.map((item, i) => (
                          <div key={i} className="text-[9px] py-0.5 border-b border-white/5 last:border-0 truncate">
                            • {item.quantity}{item.unit} {item.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-brand-text-muted truncate max-w-[150px] flex items-center gap-1" title={dc.dispatchTo}>
                      <MapPin size={10} />
                      {dc.dispatchTo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold flex items-center gap-1">
                        <User size={10} className="text-brand-text-muted" />
                        {dc.driverName}
                      </div>
                      <div className="text-[9px] text-brand-text-muted flex items-center gap-1">
                        <Truck size={10} />
                        {dc.vehicleNo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      dc.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                      dc.status === 'In Transit' ? 'bg-blue-500/10 text-blue-500' :
                      dc.status === 'Returned' ? 'bg-red-500/10 text-red-500' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {dc.status === 'In Transit' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                      {dc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-[10px] text-brand-text-muted">
                    {dc.dispatchDate?.toDate ? dc.dispatchDate.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedDispatch(dc)}
                        className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-white transition-all"
                        title="View Details"
                      >
                        <ExternalLink size={14} />
                      </button>
                      
                      <div className="relative group/actions">
                        <button className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-text-muted">
                          <MoreHorizontal size={14} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-40 bg-brand-card border border-brand-border rounded-xl shadow-2xl opacity-0 group-hover/actions:opacity-100 pointer-events-none group-hover/actions:pointer-events-auto transition-all z-50 overflow-hidden">
                          {dc.status === 'Pending' && (
                            <button 
                              onClick={() => updateStatus(dc.id, 'In Transit', dc.dcNo)}
                              className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-brand-primary hover:text-white transition-colors flex items-center gap-2"
                            >
                              <Truck size={12} /> Mark In Transit
                            </button>
                          )}
                          {(dc.status === 'Pending' || dc.status === 'In Transit') && (
                            <button 
                              onClick={() => updateStatus(dc.id, 'Delivered', dc.dcNo)}
                              className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-green-600 hover:text-white transition-colors flex items-center gap-2"
                            >
                              <CheckCircle size={12} /> Mark Delivered
                            </button>
                          )}
                          <button 
                            onClick={() => updateStatus(dc.id, 'Returned', dc.dcNo)}
                            className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2"
                          >
                            <AlertCircle size={12} /> Mark Returned
                          </button>
                          <button 
                            onClick={() => toast.info("Printing coming in full build")}
                            className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-brand-bg flex items-center gap-2"
                          >
                            <Printer size={12} /> Print DC
                          </button>
                          {userProfile?.role === 'superadmin' && (
                            <button 
                              onClick={() => handleDelete(dc.id, dc.dcNo)}
                              className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2 border-t border-brand-border"
                            >
                              <Trash2 size={12} /> Delete DC
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New DC Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-card border border-brand-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="p-6 border-b border-brand-border bg-brand-bg/30 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="text-brand-primary" />
                Create Delivery Challan
              </h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-brand-text-muted hover:text-white">
                <AlertCircle size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDC} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase mb-1">Client Name *</label>
                    <input 
                      type="text" required
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase mb-1">Client Phone</label>
                    <input 
                      type="text"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase mb-1">Job Order No.</label>
                    <input 
                      type="text"
                      value={formData.joNo}
                      onChange={(e) => setFormData({...formData, joNo: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:border-brand-primary"
                      placeholder="JO-000000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase mb-1">Delivery Address *</label>
                    <textarea 
                      required rows="2"
                      value={formData.dispatchTo}
                      onChange={(e) => setFormData({...formData, dispatchTo: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:border-brand-primary resize-none"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase mb-1">Project Name</label>
                    <input 
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase mb-1">Driver Name</label>
                    <input 
                      type="text"
                      value={formData.driverName}
                      onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase mb-1">Vehicle No.</label>
                    <input 
                      type="text"
                      value={formData.vehicleNo}
                      onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-text-muted uppercase mb-1">Dispatch Date</label>
                    <input 
                      type="date"
                      value={formData.dispatchDate}
                      onChange={(e) => setFormData({...formData, dispatchDate: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="pt-4 border-t border-brand-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm">Items to Dispatch</h3>
                  <button type="button" onClick={addItem} className="text-brand-primary text-xs font-bold hover:underline">+ Add Item</button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="bg-brand-bg px-2 py-2 rounded-lg border border-brand-border text-[10px] font-bold">{index + 1}</div>
                      <input 
                        type="text" placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].description = e.target.value;
                          setFormData({...formData, items: newItems});
                        }}
                        className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm"
                      />
                      <input 
                        type="number" 
                        min="1"
                        placeholder="0"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newItems = [...formData.items];
                          newItems[index].quantity = val === '' ? 0 : parseInt(val) || 0;
                          setFormData({...formData, items: newItems});
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-20 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm"
                      />
                      <select 
                        value={item.unit}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].unit = e.target.value;
                          setFormData({...formData, items: newItems});
                        }}
                        className="w-20 bg-brand-bg border border-brand-border rounded-lg px-2 py-2 text-xs"
                      >
                        <option>pcs</option>
                        <option>sqft</option>
                        <option>rft</option>
                        <option>sets</option>
                      </select>
                      <button type="button" onClick={() => removeItem(index)} className="p-2 text-brand-text-muted hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="flex-1 py-3 rounded-xl border border-brand-border font-bold hover:bg-brand-bg transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20">Create DC</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDispatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-card border border-brand-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="p-6 border-b border-brand-border bg-brand-bg/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-mono font-bold text-brand-primary">{selectedDispatch.dcNo}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedDispatch.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                  selectedDispatch.status === 'In Transit' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {selectedDispatch.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toast.info("Printing coming in full build")} className="flex items-center gap-2 border border-brand-border px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-bg transition-all">
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setSelectedDispatch(null)} className="text-brand-text-muted hover:text-white">
                  <AlertCircle size={24} className="rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-12 mb-8">
                {/* Left */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-2">Client Information</h4>
                    <p className="text-sm font-bold">{selectedDispatch.clientName}</p>
                    <p className="text-xs text-brand-text-muted">{selectedDispatch.clientPhone || 'No phone'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-2">Delivery Address</h4>
                    <p className="text-xs leading-relaxed italic">{selectedDispatch.dispatchTo}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-2">Project / JO Reference</h4>
                    <p className="text-xs font-bold">{selectedDispatch.projectName || 'General Dispatch'}</p>
                    <p className="text-[10px] font-mono text-brand-primary">{selectedDispatch.joNo}</p>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">Driver</h4>
                      <p className="text-xs font-bold">{selectedDispatch.driverName}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">Vehicle</h4>
                      <p className="text-xs font-bold uppercase">{selectedDispatch.vehicleNo}</p>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">Dispatch Date</h4>
                      <p className="text-xs font-bold">
                        {selectedDispatch.dispatchDate?.toDate ? selectedDispatch.dispatchDate.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">Delivered Date</h4>
                      <p className="text-xs font-bold text-green-500">
                        {selectedDispatch.deliveredDate?.toDate ? selectedDispatch.deliveredDate.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">Created By</h4>
                    <p className="text-xs font-bold">{selectedDispatch.createdByName}</p>
                    <p className="text-[9px] text-brand-text-muted">
                      On {selectedDispatch.createdAt?.toDate ? selectedDispatch.createdAt.toDate().toLocaleString() : '—'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">Dispatch Notes</h4>
                    <div className="bg-brand-bg/50 border border-brand-border p-3 rounded-lg text-xs italic min-h-[80px]">
                      {selectedDispatch.notes || 'No notes provided.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-3">Items to Dispatch</h4>
                <div className="border border-brand-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-bg/50 text-brand-text-muted border-b border-brand-border font-bold">
                      <tr>
                        <th className="px-4 py-2 w-12 text-center">#</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2 text-right">Quantity</th>
                        <th className="px-4 py-2">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {selectedDispatch.items?.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-center font-bold text-brand-text-muted">{i+1}</td>
                          <td className="px-4 py-2 font-bold">{item.description}</td>
                          <td className="px-4 py-2 text-right font-black text-brand-primary">{item.quantity}</td>
                          <td className="px-4 py-2 text-brand-text-muted">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="pt-6 border-t border-brand-border">
                <h4 className="text-[10px] font-bold text-brand-text-muted uppercase mb-6 text-center">Status Timeline</h4>
                <div className="flex justify-between relative max-w-lg mx-auto">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-border -translate-y-1/2" />
                  {['Created', 'Pending', 'In Transit', 'Delivered'].map((step, i) => {
                    const steps = ['Created', 'Pending', 'In Transit', 'Delivered'];
                    const currentIdx = steps.indexOf(selectedDispatch.status === 'Returned' ? 'Pending' : selectedDispatch.status);
                    const isActive = i <= (currentIdx === -1 ? 0 : currentIdx + 1); // +1 because Created is 0
                    
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-4 border-brand-card transition-all duration-500 ${
                          isActive ? 'bg-brand-primary scale-125' : 'bg-brand-border'
                        }`} />
                        <span className={`text-[9px] font-bold ${isActive ? 'text-brand-primary' : 'text-brand-text-muted'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
