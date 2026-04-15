import { useState, useEffect } from 'react';
import { X, Search, Check, ChevronRight, ChevronLeft, Layers, Minus, Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { cn } from '../layout/Sidebar';
import { toast } from 'sonner';

export default function AddProductModal({ isOpen, onClose, onSave, materials: masterMaterials, initialData }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Signage & Display',
    timeline: { design: 1, procurement: 1, production: 1, qc: 1, dispatch: 1 },
    labourCost: 0,
    materials: []
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        category: 'Signage & Display',
        timeline: { design: 1, procurement: 1, production: 1, qc: 1, dispatch: 1 },
        labourCost: 0,
        materials: []
      });
    }
    setStep(1);
  }, [initialData, isOpen]);

  const handleTimelineChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      timeline: { ...prev.timeline, [key]: parseInt(val) || 0 }
    }));
  };

  const toggleMaterial = (matId) => {
    setFormData(prev => {
      const exists = prev.materials.find(m => m.materialId === matId);
      if (exists) {
        return {
          ...prev,
          materials: prev.materials.filter(m => m.materialId !== matId)
        };
      } else {
        return {
          ...prev,
          materials: [...prev.materials, { materialId: matId, qty: 1 }]
        };
      }
    });
  };

  const updateMaterialQty = (matId, qty) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(m => 
        m.materialId === matId ? { ...m, qty: parseFloat(qty) || 0 } : m
      )
    }));
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Please enter a product name");
      return;
    }
    onSave(formData);
    toast.success(initialData ? "Product updated" : "Product added successfully");
    onClose();
  };

  const filteredMaterials = masterMaterials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-brand-card border-brand-border text-brand-text">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Layers className="mr-2 text-brand-primary" />
            {initialData ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription className="text-brand-text-muted">
            {step === 1 ? 'Configure basic product details and timeline.' : 'Specify the materials required for this product.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-text-muted uppercase tracking-wider">Product Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Premium Lightbox"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-brand-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-text-muted uppercase tracking-wider">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-brand-text"
                >
                  <option>Signage & Display</option>
                  <option>Print & Branding</option>
                  <option>Specialty</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-text-muted uppercase tracking-wider">Labour Cost (PKR)</label>
                <input 
                  type="number" 
                  value={formData.labourCost}
                  onChange={(e) => setFormData({...formData, labourCost: parseInt(e.target.value) || 0})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors text-brand-text"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-brand-text-muted uppercase tracking-wider block">Production Timeline (Working Days)</label>
              <div className="grid grid-cols-5 gap-2">
                {['design', 'procurement', 'production', 'qc', 'dispatch'].map(key => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] uppercase text-brand-text-muted text-center block">{key}</label>
                    <input 
                      type="number" 
                      value={formData.timeline[key]}
                      onChange={(e) => handleTimelineChange(key, e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 text-center text-sm focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand-primary transition-colors text-brand-text"
              />
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredMaterials.map(mat => {
                const isSelected = formData.materials.find(m => m.materialId === mat.id);
                return (
                  <div 
                    key={mat.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                      isSelected ? "border-brand-primary bg-brand-primary/5" : "border-brand-border hover:border-brand-primary/50"
                    )}
                    onClick={() => toggleMaterial(mat.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        isSelected ? "bg-brand-primary border-brand-primary" : "border-brand-text-muted"
                      )}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-text">{mat.name}</p>
                        <p className="text-xs text-brand-text-muted">{mat.category} • PKR {mat.unitCost}/{mat.unit}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[10px] text-brand-text-muted uppercase">Qty ({mat.unit})</label>
                        <input 
                          type="number"
                          value={isSelected.qty}
                          onChange={(e) => updateMaterialQty(mat.id, e.target.value)}
                          className="w-16 bg-brand-bg border border-brand-border rounded p-1 text-center text-sm focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-brand-text-muted italic text-center">
              Can't find a material? Add it first in the Materials tab.
            </p>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between border-t border-brand-border pt-4 mt-2">
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="flex items-center text-brand-text-muted hover:text-brand-text transition-colors text-sm font-medium"
            >
              <ChevronLeft className="mr-1 w-4 h-4" /> Back
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-brand-text-muted hover:text-brand-text transition-colors font-medium border border-transparent hover:border-brand-border"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 rounded-lg shadow-lg shadow-brand-primary/20 transition-all font-medium flex items-center"
              >
                Next: Add Materials <ChevronRight className="ml-1 w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-2 rounded-lg shadow-lg shadow-brand-primary/20 transition-all font-medium"
              >
                Save Product
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
