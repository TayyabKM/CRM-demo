import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ImagePlus, Sparkles, Check, 
  Lock, Warehouse, Download, 
  RotateCcw, Share2, FileText,
  AlertCircle, AlertTriangle, CheckCircle2,
  Plus, Minus, X, Trash2, Save, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { calculateEstimate, getInventoryStatus } from '../data/estimatorData';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/layout/Sidebar';
import AddProductModal from '../components/shared/AddProductModal';
import EstimatorLoader from '../components/shared/EstimatorLoader';
import ProposalCard from '../components/shared/ProposalCard';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';

// --- Internal Components ---

const BrandlineLogo = ({ height = 36 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 258.53 52.47" style={{ height }}>
    <defs>
      <style>{`.cls-1{fill:#fbfcfb}.cls-5{fill:#038d46}.cls-7{fill:#0b914c}.cls-9{fill:#0b904c}.cls-10{fill:#fbfcfc}.cls-12{fill:#1c9859}`}</style>
    </defs>
    <g>
      <path className="cls-5" d="M69.9,52.47H8.3c-1.4-.1-2.79-.34-4.14-.73-2.46-.55-5-4.86-3.89-7.44,2-4.64,3.79-9.35,5.77-14,2.69-6.27,5.34-12.57,8.27-18.72C17.75,4.36,23.44.26,31.66.24c28.87-.06,57.75-.11,86.63-.15,11.83,0,23.66-.12,35.5-.09,1.51.04,3,.33,4.41.86,2.63.96,4.22,3.64,3.81,6.41-.14,1.35-.48,2.68-1,3.93-4.36,10.06-8.59,20.19-13.26,30.1-3.3,7-9,10.93-17,10.94h-60.84v.23Z"/>
      <rect className="cls-5" x="14.56" y="6.2" width="134.36" height="39.5" rx="8.98" ry="8.98"/>
    </g>
    <g>
      <path className="cls-7" d="M224.92,36.24c.63,2.96,3.28,5.06,6.31,5h8.65c1,0,2.1.1,2.13,1.36s-1,1.5-2.15,1.49h-8.19c-5.21.2-9.62-3.8-9.92-9-.14-1.71-.14-3.44,0-5.15.43-4.91,4.52-8.69,9.45-8.73h3.94c4.7.03,8.67,3.48,9.36,8.13.19,1.66.24,3.33.13,5,0,1.3-1,1.94-2.56,1.94h-15.48l-1.67-.04ZM241.84,33.33v-2.37c.1-3.77-2.88-6.9-6.66-7-.11,0-.23,0-.34,0h-2.58c-5.55,0-8.53,3.66-7.52,9.34l17.1.03Z"/>
      <path className="cls-7" d="M217.69,36.14v6.06c0,1.06-.36,1.88-1.5,1.85s-1.36-.85-1.36-1.83v-11.07c.21-3.74-2.65-6.94-6.39-7.15-.25-.01-.49-.01-.74,0h-2.58c-4.84,0-7.57,2.75-7.57,7.64v10.32c0,1.05-.11,2.07-1.39,2.09s-1.48-1-1.47-2v-11.23c0-5.31,4.31-9.62,9.62-9.62.02,0,.05,0,.07,0h3.64c5.31,0,9.62,4.3,9.63,9.61,0,.02,0,.03,0,.05.05,1.74.04,3.51.04,5.28Z"/>
      <path className="cls-7" d="M165.33,25.58v-9.11c0-1.11.13-2.19,1.47-2.16s1.39,1,1.38,2.11v17.6c0,4.56,2.7,7.23,7.28,7.24h7.13c1,0,1.92.3,1.92,1.43s-.89,1.43-1.92,1.42h-8c-5.05-.1-9.12-4.19-9.19-9.24-.12-3.12-.07-6.17-.07-9.29Z"/>
      <path className="cls-9" d="M189.59,32.93v9.09c0,1.06-.18,2.05-1.45,2s-1.41-1-1.41-2.07v-18.47c0-1.08.22-2.05,1.45-2s1.42,1,1.41,2.08c-.06,3.14,0,6.24,0,9.37Z"/>
    </g>
    <g>
      <path className="cls-10" d="M38.59,43.2c-3.08.07-6.15.17-9.22.19s-6.16,0-9.23-.07c0-.55-.06-1.11-.06-1.66,0-9.24.05-18.47,0-27.71,0-2.17.59-3.83,2.49-4.94,5.6.06,11.21-.18,16.78.24,5.94.44,8.93,5.09,7.54,10.87-.46,1.91-1.12,2.77-3.59,4.65,0,.08.07.21.14.24,4,1.69,5.18,4.95,4.88,9-.08,3.81-2.56,7.17-6.18,8.36-1.05.34-2.12.61-3.21.81l-.34.02Z"/>
      <path className="cls-1" d="M129.65,16.47c2.69-.41,5.43.32,7.57,2l1.47,1.66.39-.2v-10.71c1.11,0,2.22-.08,3.33,0,1.76.03,3.18,1.43,3.23,3.19,0,7.07.17,14.14-.1,21.21-.24,6.21-3.8,9.71-10,10.29-2.07.08-4.14.05-6.2-.11-.24-.16-.5-.29-.77-.4-3.7-.85-6.55-3.81-7.26-7.54-.59-2.49-.81-5.06-.64-7.61.3-2.54,1.02-5.01,2.12-7.32,1.29-2.8,4.04-3.8,6.86-4.46Z"/>
      <path className="cls-1" d="M78.06,27.01l1.51-.21,1-.15.52-.13c.99-.11,1.97-.35,2.91-.7.93-.41,1.35-1.49.94-2.41-.18-.42-.52-.75-.94-.94-.93-.31-1.89-.51-2.87-.59-1.69-.13-3.34-.16-4.48,1.47-.15.22-.62.29-.94.29-1.92,0-3.83,0-5.75-.05.31-3.08,2.46-5.67,5.43-6.54l1.52-.58c2.77-.04,5.54.07,8.29.35,4.55.71,6.48,3.28,6.47,7.88v7.58c0,6.94-3,10.5-9.88,11.48-2.21.18-4.42.2-6.63.06-.58-.29-1.14-.59-1.72-.87-5.06-2.49-6.09-9.8-1.68-13.27,1.58-1.24,3.81-1.65,5.75-2.44l.55-.23Z"/>
      <path className="cls-10" d="M105.92,22.25c-3,.24-4.17,1.51-4.19,4.43,0,5.49,0,11-.06,16.47,0,.05,0,.09-.15.32h-6.47c0-5.9-.16-11.8,0-17.68-.07-3.71,2.17-7.06,5.62-8.42.91-.38,1.89-.61,2.84-.9,2-.07,4.01,0,6,.19,4.78.79,7.61,3.38,7.92,8.18.4,6.16.09,12.36.09,18.64h-4.33c-1.7-.73-2.24-2-2.2-3.85.11-4.18.05-8.36,0-12.54.1-3.5-1.54-5.02-5.07-4.84Z"/>
      <path className="cls-1" d="M61.7,16.84l.88-.08h3.8v6.91h-2.59c-3.34.11-5.2,1.93-5.26,5.35-.08,4.54,0,9.08-.06,13.63,0,.19,0,.39-.06.59h-6.94c.19-5.8.18-11.35.61-16.87.16-3,1.8-5.73,4.39-7.27,1.69-.87,3.44-1.62,5.23-2.26Z"/>
    </g>
  </svg>
);

const NumberCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const end = parseInt(value);
    if (isNaN(end)) return;
    
    let startTimestamp = null;
    const duration = 800;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);
  
  return <span>{count.toLocaleString()}</span>;
};

// --- Main Page Component ---

export default function JobEstimator({ products, materials, inventory, setProducts }) {
  const [mode, setMode] = useState('single'); // 'single' | 'project'
  const [state, setState] = useState(1); // 1: Input, 2: Loading, 3: Results
  
  // Single Mode State
  const [image, setImage] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  
  // Project Mode State
  const [projectItems, setProjectItems] = useState([{ id: Date.now(), productId: '', quantity: 1 }]);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [isProjectNameModalOpen, setIsProjectNameModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef(null);
  
  const singleStatusMessages = [
    "Analysing product specifications...",
    "Calculating material requirements...",
    "Checking inventory levels...",
    "Estimating labour and production time...",
    "Calculating internal cost breakdown...",
    "Generating client proposal...",
    "Finalising your estimate..."
  ];

  const projectStatusMessages = [
    `Analysing ${projectItems.filter(i => i.productId).length} products in your project...`,
    "Calculating material requirements...",
    "Checking inventory for all items...",
    "Estimating production timelines...",
    "Calculating combined cost breakdown...",
    "Applying margin and generating proposal...",
    "Finalising your project estimate..."
  ];

  // --- Handlers ---

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    resetState();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        const defaultProd = products.find(p => p.name.includes("Exhibition")) || products[0];
        setSelectedProductId(defaultProd.id);
        toast.success(`Image uploaded. Product detected: ${defaultProd.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (mode === 'single' && !selectedProductId) {
      return toast.error("Please select a product or upload an image.");
    }
    if (mode === 'project' && projectItems.filter(i => i.productId).length === 0) {
      return toast.error("Please add at least one complete product row.");
    }
    setState(2);
  };

  const resetState = () => {
    setState(1);
    setImage(null);
    setSelectedProductId('');
    setQuantity(1);
    setProjectItems([{ id: Date.now(), productId: '', quantity: 1 }]);
    setProjectName('');
    setClientName('');
    setClientContact('');
    setProjectNotes('');
    setIsSaved(false);
  };

  const handleQuickAdd = (formData) => {
    const newProduct = { ...formData, id: `prod_${Math.random().toString(36).substr(2, 9)}` };
    setProducts(prev => [newProduct, ...prev]);
    setSelectedProductId(newProduct.id);
    setIsQuickAddOpen(false);
    toast.success("Added new product to catalog!");
  };

  // --- Project Item Handlers ---
  const addProjectItem = () => {
    if (projectItems.length >= 10) return toast.error("Maximum 10 products per project.");
    setProjectItems([...projectItems, { id: Date.now(), productId: '', quantity: 1 }]);
  };

  const updateProjectItem = (id, field, value) => {
    setProjectItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const deleteProjectItem = (id) => {
    if (projectItems.length === 1) return;
    setProjectItems(prev => prev.filter(item => item.id !== id));
  };

  // --- Calculations ---

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const estimate = calculateEstimate(selectedProduct, materials, quantity);
  const invChecks = getInventoryStatus(selectedProduct, inventory, materials);
  
  const inventorySummary = invChecks.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // Project Calculations
  const projectCalculations = useMemo(() => {
    const validItems = projectItems.filter(item => item.productId);
    if (validItems.length === 0) return null;

    let totalMaterialCost = 0;
    let totalLabourCost = 0;
    let totalOverhead = 0;
    let totalInternalCost = 0;
    let totalProposal = 0;
    let maxDays = 0;
    
    const aggregatedMaterials = {};
    const productBreakdown = [];

    validItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return;

      const est = calculateEstimate(prod, materials, item.quantity);
      totalMaterialCost += est.totalMaterialCost;
      totalLabourCost += est.totalLabourCost;
      totalOverhead += est.overhead;
      totalInternalCost += est.totalInternalCost;
      totalProposal += est.totalProposal;
      
      const prodDays = Math.max(...Object.values(prod.timeline));
      if (prodDays > maxDays) maxDays = prodDays;

      // Aggregate materials
      prod.materials.forEach(req => {
        if (!aggregatedMaterials[req.materialId]) {
          const m = materials.find(mat => mat.id === req.materialId);
          aggregatedMaterials[req.materialId] = { 
            id: req.materialId, 
            name: m?.name || 'Unknown', 
            unit: m?.unit || '', 
            unitCost: m?.unitCost || 0,
            qty: 0 
          };
        }
        aggregatedMaterials[req.materialId].qty += req.qty * item.quantity;
      });

      productBreakdown.push({
        id: item.id,
        name: prod.name,
        quantity: item.quantity,
        timeline: prodDays,
        costs: est
      });
    });

    // Aggregated Inventory Check
    const invStatus = Object.values(aggregatedMaterials).map(am => {
      const inv = inventory.find(i => i.materialId === am.id);
      return {
        id: am.id,
        name: am.name,
        status: inv ? inv.status : 'out_of_stock',
        stock: inv ? inv.stock : 0,
        required: am.qty
      };
    });

    const invSummary = invStatus.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalMaterialCost,
      totalLabourCost,
      totalOverhead,
      totalInternalCost,
      totalProposal,
      maxDays,
      aggregatedMaterials: Object.values(aggregatedMaterials),
      productBreakdown,
      invStatus,
      invSummary
    };
  }, [projectItems, products, materials, inventory]);

  const isProjectComplete = projectItems.every(i => i.productId && i.quantity > 0);

  // --- Render Functions ---

  const renderState1 = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-5xl mx-auto w-full py-8"
    >
      <div className="text-center mb-6">
        <div className="flex justify-center mb-6">
          <BrandlineLogo height={42} />
        </div>
        <h1 className="text-3xl font-bold text-brand-text mb-2 tracking-tight">AI Job Estimator</h1>
        <p className="text-brand-text-muted">High-precision estimates for manufacturing and signage projects.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#3E3E3E] p-1 rounded-full flex relative overflow-hidden transition-all duration-300">
          <button 
            onClick={() => handleModeSwitch('single')}
            className={cn(
              "px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 z-10",
              mode === 'single' ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
            )}
          >
            Single Product
          </button>
          <button 
            onClick={() => handleModeSwitch('project')}
            className={cn(
              "px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 z-10",
              mode === 'project' ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
            )}
          >
            Project Proposal
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div 
              onClick={() => fileInputRef.current.click()}
              className={cn(
                "relative group cursor-pointer aspect-[16/10] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center bg-brand-card/50 hover:bg-brand-card hover:border-brand-primary",
                image ? "border-brand-primary bg-brand-card" : "border-brand-border"
              )}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              {image ? (
                <div className="w-full h-full relative p-2 overflow-hidden">
                  <img src={image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="bg-brand-primary text-white text-xs px-3 py-1 rounded-full font-bold">CHANGE IMAGE</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-brand-bg flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform border border-brand-border">
                    <ImagePlus size={28} />
                  </div>
                  <h3 className="text-base font-semibold text-brand-text mb-1">AI Visual Analysis</h3>
                  <p className="text-xs text-brand-text-muted">Upload a photo to detect product specs</p>
                </>
              )}
            </div>

            <div className={cn(
              "rounded-2xl border-2 transition-all p-8 flex flex-col items-center justify-center text-center bg-brand-card shadow-lg",
              selectedProductId && !image ? "border-brand-primary" : "border-brand-border"
            )}>
              <div className="w-14 h-14 rounded-full bg-brand-bg flex items-center justify-center text-brand-primary mb-6 border border-brand-border">
                <FileText size={28} />
              </div>
              <label className="text-base font-semibold text-brand-text mb-4">Select from Catalog</label>
              <div className="flex w-full gap-2">
                <select 
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setImage(null);
                  }}
                  className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-primary appearance-none cursor-pointer text-sm font-medium"
                >
                  <option value="" disabled>Choose Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setIsQuickAddOpen(true)}
                  className="p-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all flex items-center justify-center shadow-lg shadow-brand-primary/20"
                  title="Add New Custom Product"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-xs mx-auto mb-10 text-center">
            <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-widest mb-3">Order Quantity</label>
            <div className="flex items-center bg-brand-card border border-brand-border rounded-2xl p-1 shadow-inner">
              <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-12 h-12 flex items-center justify-center hover:bg-brand-bg rounded-xl text-brand-text transition-colors">
                <Minus size={20} />
              </button>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-transparent text-center text-2xl font-black text-brand-text focus:outline-none"
              />
              <button onClick={() => setQuantity(q => q+1)} className="w-12 h-12 flex items-center justify-center hover:bg-brand-bg rounded-xl text-brand-text transition-colors">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 mb-10">
          {/* Project Builder Table */}
          <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-brand-bg/50 text-brand-text-muted text-[10px] uppercase font-bold tracking-widest border-b border-brand-border">
                   <th className="px-6 py-4">Product Line Item</th>
                   <th className="px-6 py-4 text-center w-32">Quantity</th>
                   <th className="px-6 py-4 text-center w-32">Est. Days</th>
                   <th className="px-6 py-4 text-right w-20"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-brand-border/50">
                 {projectItems.map((item, idx) => {
                   const selectedProd = products.find(p => p.id === item.productId);
                   const timelineDays = selectedProd ? Math.max(...Object.values(selectedProd.timeline)) : '-';
                   
                   return (
                     <tr key={item.id} className={cn(
                       "group transition-all hover:bg-white/5",
                       (!item.productId || item.quantity <= 0) && "border-l-4 border-l-amber-500/50"
                     )}>
                       <td className="px-6 py-4">
                         <select 
                           value={item.productId}
                           onChange={(e) => updateProjectItem(item.id, 'productId', e.target.value)}
                           className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:outline-none focus:border-brand-primary appearance-none cursor-pointer text-sm font-medium"
                         >
                           <option value="" disabled>Select a product...</option>
                           {products.map(p => (
                             <option key={p.id} value={p.id}>{p.name}</option>
                           ))}
                         </select>
                         {!item.productId && <p className="text-[10px] text-amber-500 mt-1 italic font-medium">Please select a product</p>}
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center bg-brand-bg border border-brand-border rounded-xl overflow-hidden h-10">
                           <button 
                             onClick={() => updateProjectItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                             className="px-2 hover:bg-brand-card text-brand-text-muted transition-colors"
                           >
                             <Minus size={14} />
                           </button>
                           <input 
                             type="number"
                             value={item.quantity}
                             onChange={(e) => updateProjectItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                             className="w-full bg-transparent text-center text-sm font-bold text-brand-text focus:outline-none"
                           />
                           <button 
                             onClick={() => updateProjectItem(item.id, 'quantity', item.quantity + 1)}
                             className="px-2 hover:bg-brand-card text-brand-text-muted transition-colors"
                           >
                             <Plus size={14} />
                           </button>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-center font-mono text-sm text-brand-text-muted">
                         {timelineDays} {selectedProd ? 'days' : ''}
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => deleteProjectItem(item.id)}
                           disabled={projectItems.length === 1}
                           className="p-2 text-brand-text-muted hover:text-red-500 transition-colors disabled:opacity-0"
                         >
                           <Trash2 size={18} />
                         </button>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
             <div className="p-6 bg-brand-bg/20 flex justify-between items-center border-t border-brand-border">
               <button 
                onClick={addProjectItem}
                className="flex items-center text-sm font-bold text-brand-primary hover:text-brand-primary/80 transition-all group"
               >
                 <div className="w-8 h-8 rounded-full border-2 border-brand-primary flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                   <Plus size={16} />
                 </div>
                 ADD ANOTHER PRODUCT
               </button>
               <p className="text-xs text-brand-text-muted font-medium">
                 {projectItems.length} of 10 items used
               </p>
             </div>
          </div>

          {/* Running Summary Bar */}
          <div className="bg-[#3E3E3E] border border-[#4A4A4A] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary group-hover:w-2 transition-all duration-300" />
            
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] text-brand-text-muted uppercase font-black tracking-widest mb-1">Products</p>
                <p className="text-xl font-black text-brand-text items-center flex">
                  {projectItems.filter(i => i.productId).length} 
                  <span className="text-sm text-brand-text-muted ml-2 font-bold italic">/ {projectItems.length} total</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-brand-text-muted uppercase font-black tracking-widest mb-1">Max Duration</p>
                <p className="text-xl font-black text-brand-text">
                  {projectCalculations?.maxDays || '--'} 
                  <span className="text-xs text-brand-text-muted ml-1 uppercase font-bold">Days</span>
                </p>
              </div>
            </div>

            <div className="flex gap-10 bg-black/20 px-8 py-3 rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] text-brand-text-muted uppercase font-black tracking-widest mb-1">Est. Internal Cost</p>
                <div className="flex items-baseline">
                  <span className="text-xs font-bold text-brand-primary mr-1.5">PKR</span>
                  <span className="text-2xl font-black text-brand-text">
                    {projectCalculations ? <NumberCounter value={projectCalculations.totalInternalCost} /> : '---,---'}
                  </span>
                </div>
              </div>
              <div className="w-px h-10 bg-[#4A4A4A]" />
              <div>
                <p className="text-[10px] text-brand-text-muted uppercase font-black tracking-widest mb-1">Client Proposal</p>
                <div className="flex items-baseline">
                  <span className="text-xs font-bold text-brand-primary mr-1.5">PKR</span>
                  <span className="text-2xl font-black text-brand-primary">
                    {projectCalculations ? <NumberCounter value={projectCalculations.totalProposal} /> : '---,---'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button 
          onClick={handleGenerate}
          disabled={mode === 'single' ? !selectedProductId : !isProjectComplete}
          className={cn(
            "w-full max-w-lg py-4 rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-xl group",
            (mode === 'single' ? selectedProductId : isProjectComplete)
              ? "bg-brand-primary text-white hover:scale-[1.02] shadow-brand-primary/25" 
              : "bg-brand-bg text-brand-text-muted border border-brand-border cursor-not-allowed opacity-50"
          )}
        >
          <Sparkles className="mr-3 group-hover:rotate-12 transition-transform" size={24} />
          {mode === 'single' ? 'GENERATE FULL ESTIMATE' : 'GENERATE PROJECT PROPOSAL'}
        </button>
      </div>
      
      {mode === 'project' && (
        <p className="text-center text-[11px] text-brand-text-muted mt-4 font-bold uppercase tracking-widest">
           Your estimate and client-ready proposal will be generated for all {projectItems.filter(i => i.productId).length} products
        </p>
      )}

      <AddProductModal 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={handleQuickAdd}
        materials={materials}
      />
    </motion.div>
  );

  const renderState2 = () => (
    <EstimatorLoader 
      messages={mode === 'single' ? singleStatusMessages : projectStatusMessages}
      onComplete={() => setState(3)}
    />
  );

  const renderState3 = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-20 pt-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-brand-card p-6 rounded-2xl border border-brand-border sticky top-4 z-10 shadow-2xl">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mr-4 border border-brand-primary/20">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-text flex items-center">
              {mode === 'single' ? selectedProduct.name : `Project Estimate — ${projectCalculations?.productBreakdown.length} Products`}
              <span className="ml-3 px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20 uppercase">Estimate Ready</span>
            </h1>
            <p className="text-xs text-brand-text-muted mt-1">
              {mode === 'single' ? `Estimating production of ${quantity} unit(s)` : `${projectCalculations?.productBreakdown.length} product lines compiled`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={resetState} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-brand-border text-brand-text font-bold hover:bg-brand-bg transition-all flex items-center justify-center group text-sm">
            <RotateCcw size={16} className="mr-2 group-hover:rotate-[-45deg] transition-transform" /> New Estimate
          </button>
          {mode === 'project' && (
            <button 
              onClick={() => setIsProjectNameModalOpen(true)} 
              disabled={isSaved}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg text-sm",
                isSaved ? "bg-green-600/20 text-green-500 cursor-default" : "bg-brand-primary text-white hover:bg-brand-primary/90"
              )}
            >
              {isSaved ? <Check size={16} className="mr-2" /> : <Save size={16} className="mr-2" />}
              {isSaved ? 'Saved' : 'Name & Save Project'}
            </button>
          )}
          <button onClick={() => toast.info("PDF export coming in full build")} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-brand-border text-brand-text font-bold hover:bg-brand-bg transition-all flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* CEO INTERNAL VIEW */}
        <div className="space-y-8">
          <div className="bg-brand-card rounded-2xl overflow-hidden border-l-4 border-l-amber-500 shadow-xl">
            <div className="p-6 border-b border-brand-border bg-brand-bg/30 flex justify-between items-center">
              <div>
                <div className="flex items-center mb-1">
                  <Lock size={14} className="text-amber-500 mr-2" />
                  <h2 className="font-black text-brand-text uppercase tracking-widest text-xs">Internal View — Confidential</h2>
                </div>
                <p className="text-[10px] text-brand-text-muted">Production analytics & combined cost vectors</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-brand-text-muted uppercase font-bold tracking-tight">Project Duration</p>
                <p className="text-xl font-black text-brand-primary uppercase">
                  {(mode === 'single' ? estimate.totalDays : projectCalculations?.maxDays)} Working Days
                </p>
              </div>
            </div>

            <div className="p-8 space-y-10">
              {/* Timeline Visualization */}
              <section>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xs font-black text-brand-text-muted uppercase tracking-[0.2em]">Project Timeline</h3>
                   <p className="text-[10px] text-brand-text-muted italic">(Longest item determines project duration)</p>
                </div>
                
                <div className="space-y-4">
                  {(mode === 'single' ? [selectedProduct] : projectCalculations?.productBreakdown).map((p, i) => {
                    const days = mode === 'single' ? estimate.totalDays : p.timeline;
                    const max = mode === 'single' ? estimate.totalDays : projectCalculations.maxDays;
                    const percent = (days / max) * 100;
                    
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-brand-text">{p.name}</span>
                          <span className="text-brand-text-muted">{days}d</span>
                        </div>
                        <div className="h-2 w-full bg-[#4A4A4A] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full bg-brand-primary"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Aggregated Materials */}
              <section>
                <h3 className="text-xs font-black text-brand-text-muted uppercase tracking-[0.2em] mb-4">
                  Consolidated Materials {mode === 'project' && '& Parts List'}
                </h3>
                <div className="bg-brand-bg rounded-xl overflow-hidden border border-brand-border">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-brand-card/50 text-brand-text-muted">
                        <th className="p-4 font-bold">MATERIAL</th>
                        <th className="p-4 font-bold text-center">TOTAL QTY</th>
                        <th className="p-4 font-bold text-right">LINE TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/50">
                      {(mode === 'single' ? selectedProduct.materials.map(mReq => {
                        const m = materials.find(mat => mat.id === mReq.materialId);
                        return { 
                          name: m?.name, 
                          unit: m?.unit, 
                          qty: mReq.qty * quantity, 
                          total: mReq.qty * (m?.unitCost || 0) * quantity 
                        };
                      }) : projectCalculations?.aggregatedMaterials.map(am => ({
                        name: am.name,
                        unit: am.unit,
                        qty: am.qty,
                        total: am.qty * am.unitCost
                      }))).map((item, i) => (
                        <tr key={i} className="group hover:bg-brand-card/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-brand-text">{item.name}</p>
                            <p className="text-[9px] text-brand-text-muted uppercase">{item.unit}</p>
                          </td>
                          <td className="p-4 text-center font-medium">{item.qty.toLocaleString()}</td>
                          <td className="p-4 text-right font-bold text-brand-text">PKR {item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-brand-bg font-bold border-t-2 border-brand-border">
                        <td colSpan="2" className="p-4 text-brand-text uppercase tracking-tighter">Combined Material Subtotal</td>
                        <td className="p-4 text-right text-brand-primary font-black">
                          PKR {(mode === 'single' ? estimate.totalMaterialCost : projectCalculations.totalMaterialCost).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Cost Breakdown Per Product */}
              {mode === 'project' && (
                <section>
                  <h3 className="text-xs font-black text-brand-text-muted uppercase tracking-[0.2em] mb-4">Cost Distribution</h3>
                  <div className="space-y-2">
                    {projectCalculations.productBreakdown.map((pb, idx) => (
                      <div key={idx} className="bg-brand-bg/50 border border-brand-border rounded-xl overflow-hidden">
                        <button 
                          className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                          onClick={(e) => {
                            const content = e.currentTarget.nextElementSibling;
                            content.classList.toggle('hidden');
                            e.currentTarget.querySelector('svg').classList.toggle('rotate-180');
                          }}
                        >
                           <div className="text-left">
                             <p className="text-sm font-bold text-brand-text">{pb.name} ({pb.quantity}x)</p>
                             <p className="text-[10px] text-brand-text-muted">ID: {pb.id.toString().slice(-6)}</p>
                           </div>
                           <div className="flex items-center gap-4">
                             <p className="font-black text-brand-text">PKR {pb.costs.totalInternalCost.toLocaleString()}</p>
                             <ChevronRight size={16} className="text-brand-text-muted transition-transform" />
                           </div>
                        </button>
                        <div className="hidden p-4 bg-black/20 grid grid-cols-3 gap-4 border-t border-brand-border">
                           <div className="text-center">
                             <p className="text-[9px] text-brand-text-muted uppercase font-bold">Materials</p>
                             <p className="text-xs font-black text-brand-text">{pb.costs.totalMaterialCost.toLocaleString()}</p>
                           </div>
                           <div className="text-center">
                             <p className="text-[9px] text-brand-text-muted uppercase font-bold">Labour</p>
                             <p className="text-xs font-black text-brand-text">{pb.costs.totalLabourCost.toLocaleString()}</p>
                           </div>
                           <div className="text-center">
                             <p className="text-[9px] text-brand-text-muted uppercase font-bold">Overhead</p>
                             <p className="text-xs font-black text-brand-text">{pb.costs.overhead.toLocaleString()}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Final Financial Box */}
              <section className="bg-brand-bg p-8 rounded-3xl border-2 border-brand-primary/30 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-sm font-bold border-b border-brand-border/50 pb-4">
                      <span className="text-brand-text-muted">Total Material Cost</span>
                      <span className="text-brand-text">PKR {(mode === 'single' ? estimate.totalMaterialCost : projectCalculations.totalMaterialCost).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-b border-brand-border/50 pb-4">
                      <span className="text-brand-text-muted">Total Labour Cost</span>
                      <span className="text-brand-text">PKR {(mode === 'single' ? estimate.totalLabourCost : projectCalculations.totalLabourCost).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-b border-brand-border/50 pb-4">
                      <span className="text-brand-text-muted">Combined Overhead (15%)</span>
                      <span className="text-brand-text">PKR {(mode === 'single' ? estimate.overhead : projectCalculations.totalOverhead).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-black text-brand-primary uppercase tracking-widest">Grand Internal Total</span>
                      <span className="text-3xl font-black text-brand-primary">PKR <NumberCounter value={mode === 'single' ? estimate.totalInternalCost : projectCalculations.totalInternalCost} /></span>
                    </div>
                 </div>
              </section>

              {/* Inventory Status */}
              <section className="bg-brand-bg/80 p-6 rounded-2xl border border-brand-border backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Warehouse size={18} className="text-brand-primary mr-3" />
                    <h3 className="font-bold text-brand-text text-sm">Combined Inventory Check</h3>
                  </div>
                  <div className="flex gap-2 font-mono text-[9px] font-bold">
                    <span className="text-green-500">{(mode === 'single' ? inventorySummary.in_stock : projectCalculations.invSummary.in_stock) || 0} OK</span>
                    <span className="text-amber-500">{(mode === 'single' ? inventorySummary.low_stock : projectCalculations.invSummary.low_stock) || 0} LW</span>
                    <span className="text-red-500">{(mode === 'single' ? inventorySummary.out_of_stock : projectCalculations.invSummary.out_of_stock) || 0} OS</span>
                  </div>
                </div>

                {((mode === 'single' ? inventorySummary.out_of_stock : projectCalculations.invSummary.out_of_stock)) ? (
                  <div className="flex items-start p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs mb-4">
                    <AlertCircle size={16} className="mr-3 shrink-0" />
                    <p className="leading-relaxed">
                      CRITICAL: {mode === 'single' ? inventorySummary.out_of_stock : projectCalculations.invSummary.out_of_stock} materials need procurement before this project can begin. Estimated procurement time may add 2-5 working days.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs mb-4">
                    <CheckCircle2 size={16} className="mr-3 shrink-0" />
                    <p className="leading-relaxed">All project materials verified. Stock levels are sufficient for consolidated production.</p>
                  </div>
                )}
                
                <button 
                  onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle('hidden')}
                  className="text-[10px] font-bold bg-brand-card hover:bg-brand-bg text-brand-text-muted px-4 py-2 rounded-lg border border-brand-border transition-colors w-full uppercase tracking-widest"
                >
                  View itemized stock list ↓
                </button>
                <div className="hidden mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                   {(mode === 'single' ? invChecks : projectCalculations.invStatus).map((check, i) => (
                     <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-brand-card/40 border border-brand-border/50">
                       <span className="text-xs text-brand-text-muted truncate mr-4">{check.name}</span>
                       <div className={cn(
                         "px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0",
                         check.status === 'in_stock' ? "bg-green-500/10 text-green-500" : check.status === 'low_stock' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                       )}>
                         {check.status.replace('_', ' ')}
                       </div>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* CLIENT PROPOSAL */}
        <div className="space-y-6">
          <ProposalCard 
            mode={mode}
            productName={selectedProduct.name}
            lineItems={mode === 'project' ? projectCalculations.productBreakdown.map(p => ({
              name: p.name,
              quantity: p.quantity,
              timeline: p.timeline,
              amount: p.costs.totalProposal
            })) : null}
            totals={mode === 'single' ? estimate : { totalProposal: projectCalculations.totalProposal }}
            projectName={projectName}
            clientName={clientName}
            timeline={mode === 'single' ? estimate.totalDays : projectCalculations.maxDays}
          />

          <div className="flex gap-4">
            <button 
              onClick={() => toast.success("Proposal shared link copied to clipboard")}
              className="flex-1 bg-brand-primary py-4 rounded-xl font-black text-white hover:scale-[1.02] transition-transform flex items-center justify-center shadow-lg shadow-brand-primary/20"
            >
              <Share2 size={20} className="mr-2" /> SHARE WITH CLIENT
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 bg-brand-card py-4 rounded-xl border border-brand-border font-black text-brand-text hover:bg-brand-bg transition-all flex items-center justify-center"
            >
              <FileText size={20} className="mr-2" /> PRINT / SAVE PDF
            </button>
          </div>
        </div>
      </div>

      {/* Name Project Modal */}
      <Dialog open={isProjectNameModalOpen} onOpenChange={setIsProjectNameModalOpen}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold">
              <Save className="mr-3 text-brand-primary" /> Name & Save Project
            </DialogTitle>
            <DialogDescription className="text-brand-text-muted">
              Enter the project and client details to personalize the professional proposal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Project Name</label>
              <input 
                type="text" 
                placeholder="e.g. Coca-Cola Branch Launch 2026"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Client Name</label>
              <input 
                type="text" 
                placeholder="e.g. Coca-Cola Pakistan"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Client Contact (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Ahmed Raza, Marketing Manager"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setIsProjectNameModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-brand-text-muted hover:text-brand-text font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (!projectName || !clientName) return toast.error("Project and Client names are required");
                setIsSaved(true);
                setIsProjectNameModalOpen(false);
                toast.success(`Project saved — ${projectName}`);
              }}
              className="bg-brand-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Save Project
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {state === 1 && renderState1()}
        {state === 2 && renderState2()}
        {state === 3 && renderState3()}
      </AnimatePresence>
      
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.5s ease-out forwards;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.5em;
        }
      `}</style>
    </div>
  );
}
