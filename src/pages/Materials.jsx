import { useState } from 'react';
import { 
  Layers, Search, Plus, Trash2, Edit2, 
  Info, AlertCircle, CheckCircle2, Package, X
} from 'lucide-react';
import { cn } from '../components/layout/Sidebar';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';

export default function Materials({ materials, setMaterials, inventory, setInventory, products }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: 'sqft',
    unitCost: 0,
    category: 'Printing & Vinyl'
  });

  const categories = ['Metals & Structures', 'Printing & Vinyl', 'Boards & Panels', 'Lighting & Electrical', 'Inks & Coatings', 'Finishing & Misc'];

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setFormData({ name: '', unit: 'sqft', unitCost: 0, category: 'Printing & Vinyl' });
    setIsModalOpen(true);
  };

  const handleEditMaterial = (mat) => {
    setEditingMaterial(mat);
    setFormData(mat);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return toast.error("Name is required");
    
    if (editingMaterial) {
      setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? { ...formData, id: m.id } : m));
      toast.success("Material updated");
    } else {
      const newId = `mat_${Math.random().toString(36).substr(2, 9)}`;
      setMaterials(prev => [...prev, { ...formData, id: newId }]);
      // Initialize inventory for new material
      setInventory(prev => [...prev, { materialId: newId, stock: 0, status: 'out_of_stock' }]);
      toast.success("Material added");
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (mat) => {
    const isUsed = products.some(p => p.materials.some(m => m.materialId === mat.id));
    if (isUsed) {
      toast.error("Cannot delete material. It is currently used in one or more products.");
      return;
    }
    setMaterialToDelete(mat);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setMaterials(prev => prev.filter(m => m.id !== materialToDelete.id));
    setInventory(prev => prev.filter(i => i.materialId !== materialToDelete.id));
    setIsDeleteModalOpen(false);
    toast.success("Material deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Material Inventory</h1>
          <p className="text-brand-text-muted">Manage raw materials, costs, and availability.</p>
        </div>
        <button 
          onClick={handleAddMaterial}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-primary/20 font-medium"
        >
          <Plus className="mr-2 w-5 h-5" /> Add New Material
        </button>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-bg/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand-primary transition-colors text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50 text-brand-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Material</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Stock Status</th>
                <th className="px-6 py-4 font-semibold">Unit Cost</th>
                <th className="px-6 py-4 font-semibold font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredMaterials.map((mat) => {
                const inv = inventory.find(i => i.materialId === mat.id);
                const isPartof = products.filter(p => p.materials.some(m => m.materialId === mat.id)).length;
                
                return (
                  <tr key={mat.id} className="hover:bg-brand-bg/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-brand-text">{mat.name}</p>
                        <p className="text-xs text-brand-text-muted">Used in {isPartof} Products</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-brand-text-muted">{mat.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {inv?.status === 'in_stock' && <CheckCircle2 size={14} className="text-green-500" />}
                        {inv?.status === 'low_stock' && <AlertCircle size={14} className="text-yellow-500" />}
                        {inv?.status === 'out_of_stock' && <X size={14} className="text-red-500" />}
                        <span className={cn(
                          "text-xs font-medium capitalize",
                          inv?.status === 'in_stock' && "text-green-500",
                          inv?.status === 'low_stock' && "text-yellow-500",
                          inv?.status === 'out_of_stock' && "text-red-500",
                        )}>
                          {inv?.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-brand-text">
                        PKR {mat.unitCost.toLocaleString()} / {mat.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditMaterial(mat)}
                          className="p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-brand-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(mat)}
                          className="p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs text-brand-text-muted uppercase">Material Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2 focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-brand-text-muted uppercase">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2 focus:outline-none focus:border-brand-primary"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-brand-text-muted uppercase">Unit (e.g. sqft, kg)</label>
                <input 
                  type="text" 
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2 focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-brand-text-muted uppercase">Unit Cost (PKR)</label>
              <input 
                type="number" 
                value={formData.unitCost}
                onChange={(e) => setFormData({...formData, unitCost: parseInt(e.target.value) || 0})}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-brand-text-muted hover:text-brand-text">Cancel</button>
            <button onClick={handleSave} className="bg-brand-primary text-white px-6 py-2 rounded-lg">Save Material</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="text-white font-bold">{materialToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-brand-text-muted hover:text-brand-text">Cancel</button>
            <button onClick={handleDelete} className="bg-red-500 text-white px-6 py-2 rounded-lg">Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
