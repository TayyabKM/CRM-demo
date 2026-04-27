import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, getDocs, limit, where 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Trash2, CheckCircle2, XCircle, 
  Search, ClipboardList, Loader2, Rocket 
} from 'lucide-react';
import { toast } from 'sonner';

const DEPARTMENTS = ['Design', 'Printing', 'Fabrication', 'Installation', 'Services', 'Finishing'];
const SOURCES = ['WhatsApp', 'Email', 'Call', 'Walk-in', 'Referral'];
const FLOW_TYPES = ['Sequential', 'Parallel'];
const UOMS = ['Inches', 'Cm', 'Feet'];

export default function Enquiry() {
  const { currentUser, userProfile } = useAuth();
  
  // Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
    source: 'WhatsApp',
    clientName: '',
    contactNumber: '',
    projectTitle: '',
    brief: '',
    surveyNeeded: false,
    flowType: 'Sequential',
    deadline: '',
    csOwner: 'CS Team',
    estimatedValue: ''
  });

  // BOQ State
  const [boqLines, setBoqLines] = useState([
    { id: Date.now(), dept: 'Design', description: '', material: '', w: 0, h: 0, uom: 'Inches', qty: 1, rate: 0 }
  ]);
  const [selectedDept, setSelectedDept] = useState('Design');

  // Firestore Data
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch recent enquiries
    const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentEnquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Fetch inventory for checks
    const invQ = collection(db, 'inventory');
    const unsubscribeInv = onSnapshot(invQ, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      unsubscribeInv();
    };
  }, []);

  // BOQ Calculations
  const calculateSqft = (line) => {
    if (line.dept === 'Services') return 0;
    const w = parseFloat(line.w) || 0;
    const h = parseFloat(line.h) || 0;
    const qty = parseFloat(line.qty) || 1;
    
    if (line.uom === 'Inches') return (w * h / 144) * qty;
    if (line.uom === 'Cm') return (w * h / 929.03) * qty;
    if (line.uom === 'Feet') return (w * h) * qty;
    return 0;
  };

  const calculateAmount = (line) => {
    const rate = parseFloat(line.rate) || 0;
    if (line.dept === 'Services') {
      const qty = parseFloat(line.qty) || 0;
      return qty * rate;
    }
    return calculateSqft(line) * rate;
  };

  const boqSummary = useMemo(() => {
    const totalSqft = boqLines.reduce((sum, line) => sum + calculateSqft(line), 0);
    const totalAmount = boqLines.reduce((sum, line) => sum + calculateAmount(line), 0);
    return {
      lines: boqLines.length,
      totalSqft: totalSqft.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    };
  }, [boqLines]);

  // Inventory Check
  const materialStatus = useMemo(() => {
    const materials = {};
    boqLines.forEach(line => {
      if (line.material && line.dept !== 'Services') {
        const sqft = calculateSqft(line);
        materials[line.material] = (materials[line.material] || 0) + sqft;
      }
    });

    return Object.entries(materials).map(([name, req]) => {
      const invItem = inventory.find(i => 
        i.name.toLowerCase().includes(name.toLowerCase())
      );
      const stock = invItem ? parseFloat(invItem.quantity) || 0 : 0;
      return {
        name,
        required: req.toFixed(2),
        stock: invItem ? stock.toFixed(2) : '—',
        toPurchase: Math.max(0, req - stock).toFixed(2),
        status: invItem ? (stock >= req ? 'sufficient' : 'shortage') : 'unknown'
      };
    });
  }, [boqLines, inventory]);

  const handleAddLine = () => {
    setBoqLines([...boqLines, { 
      id: Date.now(), 
      dept: selectedDept, 
      description: '', 
      material: '', 
      w: 0, 
      h: 0, 
      uom: 'Inches', 
      qty: 1, 
      rate: 0 
    }]);
  };

  const handleUpdateLine = (id, field, value) => {
    setBoqLines(boqLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const handleRemoveLine = (id) => {
    if (boqLines.length > 1) {
      setBoqLines(boqLines.filter(line => line.id !== id));
    }
  };

  const handleSubmit = async () => {
    if (!enquiryForm.clientName || !enquiryForm.projectTitle) {
      toast.error('Please fill in required project details');
      return;
    }
    if (boqLines.length === 0 || boqLines.every(l => !l.description)) {
      toast.error('Please add at least one BOQ line');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get counts for IDs
      const enquiriesSnap = await getDocs(collection(db, 'enquiries'));
      const projectsSnap = await getDocs(collection(db, 'projects'));
      
      const enqCount = enquiriesSnap.size + 1;
      const prjCount = projectsSnap.size + 1;
      
      const enqNo = `ENQ-${enqCount.toString().padStart(3, '0')}`;
      const prjNo = `PRJ-${prjCount.toString().padStart(3, '0')}`;
      const joNo = `JO-${prjCount.toString().padStart(3, '0')}`;

      const totalRevenue = parseFloat(boqSummary.totalAmount);

      const enquiryData = {
        enqNo, prjNo, joNo,
        ...enquiryForm,
        boqLines: boqLines.map(l => ({
          ...l,
          sqft: calculateSqft(l),
          amount: calculateAmount(l)
        })),
        totalRevenue,
        status: "New",
        createdBy: currentUser.uid,
        createdByName: userProfile?.displayName || currentUser.email,
        createdAt: serverTimestamp()
      };

      const projectData = {
        projectNumber: prjNo,
        projectName: enquiryForm.projectTitle,
        clientName: enquiryForm.clientName,
        clientId: null,
        enqNo, joNo,
        status: "active",
        products: [],
        totalInternalCost: Math.round(totalRevenue * 0.65),
        totalClientCost: totalRevenue,
        timelineDays: 14,
        source: "enquiry",
        invoiceId: null,
        invoiceStatus: null,
        createdBy: currentUser.uid,
        createdByName: userProfile?.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: enquiryForm.brief
      };

      await addDoc(collection(db, 'enquiries'), enquiryData);
      await addDoc(collection(db, 'projects'), projectData);

      toast.success(`✅ Pipeline created! ${enqNo} → ${prjNo} → ${joNo}`);
      
      // Reset form
      setEnquiryForm({
        source: 'WhatsApp',
        clientName: '',
        contactNumber: '',
        projectTitle: '',
        brief: '',
        surveyNeeded: false,
        flowType: 'Sequential',
        deadline: '',
        csOwner: 'CS Team',
        estimatedValue: ''
      });
      setBoqLines([{ id: Date.now(), dept: 'Design', description: '', material: '', w: 0, h: 0, uom: 'Inches', qty: 1, rate: 0 }]);
      
    } catch (error) {
      console.error('Error creating pipeline:', error);
      toast.error('Failed to create project pipeline');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-text">Enquiry & BOQ</h1>
        <p className="text-brand-text-muted mt-1">Create a new project pipeline with bill of quantities</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left Column: Form & Recent */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ClipboardList className="text-brand-primary" />
              Project Details
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Source</label>
                  <select 
                    value={enquiryForm.source}
                    onChange={(e) => setEnquiryForm({...enquiryForm, source: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Flow Type</label>
                  <select 
                    value={enquiryForm.flowType}
                    onChange={(e) => setEnquiryForm({...enquiryForm, flowType: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {FLOW_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Client Name *</label>
                <input 
                  type="text"
                  value={enquiryForm.clientName}
                  onChange={(e) => setEnquiryForm({...enquiryForm, clientName: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  placeholder="Acme Corp / John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Project Title *</label>
                <input 
                  type="text"
                  value={enquiryForm.projectTitle}
                  onChange={(e) => setEnquiryForm({...enquiryForm, projectTitle: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  placeholder="Annual Signage Campaign"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Contact Number</label>
                  <input 
                    type="text"
                    value={enquiryForm.contactNumber}
                    onChange={(e) => setEnquiryForm({...enquiryForm, contactNumber: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                    placeholder="+92..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Deadline</label>
                  <input 
                    type="date"
                    value={enquiryForm.deadline}
                    onChange={(e) => setEnquiryForm({...enquiryForm, deadline: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Brief / Notes</label>
                <textarea 
                  value={enquiryForm.brief}
                  onChange={(e) => setEnquiryForm({...enquiryForm, brief: e.target.value})}
                  rows="2"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none"
                  placeholder="Any specific requirements..."
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-brand-bg/50 rounded-xl border border-brand-border">
                <div>
                  <p className="text-sm font-bold">Site Survey Needed?</p>
                  <p className="text-[10px] text-brand-text-muted">Requires technical team visit</p>
                </div>
                <button 
                  onClick={() => setEnquiryForm({...enquiryForm, surveyNeeded: !enquiryForm.surveyNeeded})}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${enquiryForm.surveyNeeded ? 'bg-brand-primary' : 'bg-brand-border'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${enquiryForm.surveyNeeded ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">CS Owner</label>
                  <input 
                    type="text"
                    value={enquiryForm.csOwner}
                    onChange={(e) => setEnquiryForm({...enquiryForm, csOwner: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Est. Value (PKR)</label>
                  <input 
                    type="number"
                    value={enquiryForm.estimatedValue}
                    onChange={(e) => setEnquiryForm({...enquiryForm, estimatedValue: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-brand-border bg-brand-bg/30">
              <h3 className="font-bold text-sm">Recent Enquiries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand-bg/50 text-brand-text-muted border-b border-brand-border">
                    <th className="px-4 py-3 font-bold text-[10px] uppercase">ENQ#</th>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase">Client</th>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase">Status</th>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {recentEnquiries.map(enq => (
                    <tr key={enq.id} className="hover:bg-brand-bg/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-brand-primary font-bold">{enq.enqNo}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-xs">{enq.client}</div>
                        <div className="text-[10px] text-brand-text-muted truncate max-w-[150px]">{enq.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          enq.status === 'New' ? 'bg-blue-500/10 text-blue-500' :
                          enq.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500' :
                          enq.status === 'Converted' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-brand-text-muted">
                        {enq.createdAt?.toDate().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {recentEnquiries.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-brand-text-muted">No recent enquiries</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: BOQ Builder */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl flex flex-col min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Search className="text-brand-primary" />
                Bill of Quantities
              </h2>
              <div className="flex items-center gap-3">
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button 
                  onClick={handleAddLine}
                  className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  <Plus size={16} />
                  Add BOQ Line
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-brand-text-muted border-b border-brand-border">
                    <th className="pb-3 pr-4 font-bold text-[10px] uppercase w-10">#</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase w-32">Dept</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase">Description</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase w-32">Material</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase w-16">W</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase w-16">H</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase w-24">UOM</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase w-20">Sqft/Qty</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase w-24">Rate</th>
                    <th className="pb-3 px-2 font-bold text-[10px] uppercase w-28 text-right">Amount</th>
                    <th className="pb-3 pl-4 font-bold text-[10px] uppercase w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30">
                  {boqLines.map((line, index) => (
                    <tr key={line.id} className="group">
                      <td className="py-3 pr-4 text-brand-text-muted font-mono">{index + 1}</td>
                      <td className="py-3 px-2">
                        <select 
                          value={line.dept}
                          onChange={(e) => handleUpdateLine(line.id, 'dept', e.target.value)}
                          className="w-full bg-brand-bg/50 border border-brand-border/50 rounded px-2 py-1 text-xs"
                        >
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <input 
                          type="text"
                          value={line.description}
                          onChange={(e) => handleUpdateLine(line.id, 'description', e.target.value)}
                          className="w-full bg-brand-bg/50 border border-brand-border/50 rounded px-2 py-1 text-xs"
                          placeholder="Item name..."
                        />
                      </td>
                      <td className="py-3 px-2">
                        {line.dept !== 'Services' && (
                          <input 
                            type="text"
                            value={line.material}
                            onChange={(e) => handleUpdateLine(line.id, 'material', e.target.value)}
                            className="w-full bg-brand-bg/50 border border-brand-border/50 rounded px-2 py-1 text-xs"
                            placeholder="Material..."
                          />
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {line.dept !== 'Services' && (
                          <input 
                            type="number"
                            value={line.w === 0 ? '' : line.w}
                            onChange={(e) => handleUpdateLine(line.id, 'w', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-brand-bg/50 border border-brand-border/50 rounded px-2 py-1 text-xs"
                          />
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {line.dept !== 'Services' && (
                          <input 
                            type="number"
                            value={line.h === 0 ? '' : line.h}
                            onChange={(e) => handleUpdateLine(line.id, 'h', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-brand-bg/50 border border-brand-border/50 rounded px-2 py-1 text-xs"
                          />
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {line.dept !== 'Services' && (
                          <select 
                            value={line.uom}
                            onChange={(e) => handleUpdateLine(line.id, 'uom', e.target.value)}
                            className="w-full bg-brand-bg/50 border border-brand-border/50 rounded px-2 py-1 text-xs"
                          >
                            {UOMS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {line.dept === 'Services' ? (
                          <input 
                            type="number"
                            value={line.qty === 0 ? '' : line.qty}
                            onChange={(e) => handleUpdateLine(line.id, 'qty', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-brand-bg/50 border border-brand-border/50 rounded px-2 py-1 text-xs font-bold"
                          />
                        ) : (
                          <div className="text-xs font-bold text-brand-text/50 bg-brand-bg/20 px-2 py-1 rounded">
                            {calculateSqft(line).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <input 
                          type="number"
                          value={line.rate === 0 ? '' : line.rate}
                          onChange={(e) => handleUpdateLine(line.id, 'rate', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-brand-bg/50 border border-brand-border/50 rounded px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-brand-primary">
                        {calculateAmount(line).toLocaleString()}
                      </td>
                      <td className="py-3 pl-4">
                        <button 
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-brand-text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-border">
              <div className="bg-brand-bg/50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-brand-text-muted uppercase">Total Lines</p>
                    <p className="text-lg font-bold">{boqSummary.lines}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-text-muted uppercase">Total Sqft</p>
                    <p className="text-lg font-bold">{boqSummary.totalSqft}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-brand-text-muted uppercase">BOQ Total Revenue</p>
                  <p className="text-2xl font-black text-brand-primary">PKR {parseFloat(boqSummary.totalAmount).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-bold text-brand-text-muted uppercase mb-3 px-1">Inventory Check</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {materialStatus.map(mat => (
                  <div key={mat.name} className="bg-brand-bg/30 border border-brand-border rounded-xl p-3 flex flex-col gap-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold truncate pr-2">{mat.name}</span>
                      {mat.status === 'sufficient' ? (
                        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                      ) : mat.status === 'shortage' ? (
                        <XCircle size={14} className="text-red-500 shrink-0" />
                      ) : null}
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-brand-text-muted">Req: {mat.required} sqft</span>
                      <span className={`font-bold ${mat.status === 'shortage' ? 'text-red-500' : 'text-brand-text-muted'}`}>
                        Stock: {mat.stock}
                      </span>
                    </div>
                    {mat.toPurchase > 0 && (
                      <div className="text-[10px] text-red-400 font-medium">To Purchase: {mat.toPurchase} sqft</div>
                    )}
                  </div>
                ))}
                {materialStatus.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-brand-text-muted border border-dashed border-brand-border rounded-xl">
                    Add materials in BOQ to check inventory
                  </div>
                )}
              </div>
            </div>

            <button 
              disabled={isSubmitting || !enquiryForm.clientName || !enquiryForm.projectTitle || boqLines.length === 0}
              onClick={handleSubmit}
              className="mt-8 w-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-border disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating Pipeline...
                </>
              ) : (
                <>
                  <Rocket />
                  Create Project + Job Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
