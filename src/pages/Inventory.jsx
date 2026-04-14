import { useState } from 'react';
import { 
  Warehouse, Search, AlertCircle, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, RefreshCcw, MoreVertical,
  History, Edit2, Download, Plus, Minus
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

export default function Inventory({ inventory, setInventory, materials }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMat, setSelectedMat] = useState(null);
  const [updateQty, setUpdateQty] = useState('');
  const [updateType, setUpdateType] = useState('add'); // 'add' or 'subtract'

  const filteredInventory = inventory.filter(inv => {
    const mat = materials.find(m => m.id === inv.materialId);
    return mat?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUpdateStockClick = (inv) => {
    const mat = materials.find(m => m.id === inv.materialId);
    setSelectedMat({ ...inv, name: mat?.name, unit: mat?.unit });
    setUpdateQty('');
    setUpdateType('add');
    setIsUpdateModalOpen(true);
  };

  const handleSaveStock = () => {
    const qtyValue = parseFloat(updateQty);
    if (!qtyValue || qtyValue <= 0) return toast.error("Enter a valid quantity");

    setInventory(prev => prev.map(inv => {
      if (inv.materialId === selectedMat.materialId) {
        let newStock = updateType === 'add' ? inv.stock + qtyValue : inv.stock - qtyValue;
        if (newStock < 0) newStock = 0;
        
        let newStatus = 'in_stock';
        if (newStock === 0) newStatus = 'out_of_stock';
        else if (newStock < 20) newStatus = 'low_stock';

        return { ...inv, stock: newStock, status: newStatus };
      }
      return inv;
    }));

    toast.success(`Stock ${updateType === 'add' ? 'added to' : 'removed from'} ${selectedMat.name}`);
    setIsUpdateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Stock Hub</h1>
          <p className="text-brand-text-muted">Monitor and adjust real-time material inventory levels.</p>
        </div>
        <div className="flex bg-brand-card border border-brand-border rounded-xl p-1">
          <div className="px-4 py-1.5 text-center border-r border-brand-border">
            <p className="text-[10px] text-brand-text-muted uppercase">Low Stock</p>
            <p className="text-lg font-bold text-yellow-500">{inventory.filter(i => i.status === 'low_stock').length}</p>
          </div>
          <div className="px-4 py-1.5 text-center border-r border-brand-border">
            <p className="text-[10px] text-brand-text-muted uppercase">Out of Stock</p>
            <p className="text-lg font-bold text-red-500">{inventory.filter(i => i.status === 'out_of_stock').length}</p>
          </div>
          <div className="px-4 py-1.5 text-center">
            <p className="text-[10px] text-brand-text-muted uppercase">Healthy</p>
            <p className="text-lg font-bold text-green-500">{inventory.filter(i => i.status === 'in_stock').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-brand-border flex flex-col md:flex-row gap-4 justify-between bg-brand-bg/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by material name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand-primary transition-colors text-sm"
            />
          </div>
          <button className="flex items-center text-sm text-brand-text-muted hover:text-brand-text transition-colors">
            <Download size={16} className="mr-2" /> Export Inventory
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50 text-brand-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Material</th>
                <th className="px-6 py-4 font-semibold">Unit</th>
                <th className="px-6 py-4 font-semibold">Current Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredInventory.map((inv) => {
                const mat = materials.find(m => m.id === inv.materialId);
                if (!mat) return null;

                return (
                  <tr key={inv.materialId} className="hover:bg-brand-bg/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded bg-brand-bg border border-brand-border flex items-center justify-center text-brand-text-muted group-hover:text-brand-primary transition-colors">
                          <Warehouse size={16} />
                        </div>
                        <span className="font-medium text-brand-text">{mat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-brand-text-muted uppercase">{mat.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-lg font-bold",
                        inv.stock === 0 ? "text-red-500" : (inv.stock < 20 ? "text-yellow-500" : "text-brand-text")
                      )}>
                        {inv.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        inv.status === 'in_stock' && "bg-green-500/10 text-green-500 border border-green-500/20",
                        inv.status === 'low_stock' && "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
                        inv.status === 'out_of_stock' && "bg-red-500/10 text-red-500 border border-red-500/20",
                      )}>
                        {inv.status === 'in_stock' && <CheckCircle2 size={10} className="mr-1" />}
                        {(inv.status === 'low_stock' || inv.status === 'out_of_stock') && <AlertCircle size={10} className="mr-1" />}
                        {inv.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleUpdateStockClick(inv)}
                        className="p-2 hover:bg-brand-bg rounded-lg text-brand-primary hover:bg-brand-primary hover:text-white transition-all border border-brand-primary/20"
                        title="Update Stock"
                      >
                        <RefreshCcw size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInventory.length === 0 && (
            <div className="py-20 text-center">
              <Warehouse size={48} className="mx-auto text-brand-border mb-4" />
              <p className="text-brand-text-muted">Inventory list is empty.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <RefreshCcw className="mr-2 text-brand-primary" size={20} />
              Stock Adjustment
            </DialogTitle>
            <DialogDescription>
              Adjusting stock for <span className="text-white font-bold">{selectedMat?.name}</span>.
              Current level: {selectedMat?.stock} {selectedMat?.unit}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border">
              <button 
                 onClick={() => setUpdateType('add')}
                 className={cn(
                   "flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all",
                   updateType === 'add' ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
                 )}
              >
                <Plus size={16} className="mr-2" /> RESTOCK
              </button>
              <button 
                 onClick={() => setUpdateType('subtract')}
                 className={cn(
                   "flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all",
                   updateType === 'subtract' ? "bg-red-500 text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
                 )}
              >
                <Minus size={16} className="mr-2" /> CONSUME
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-brand-text-muted uppercase">Quantity to {updateType === 'add' ? 'Increase' : 'Decrease'} ({selectedMat?.unit})</label>
              <input 
                type="number" 
                autoFocus
                value={updateQty}
                onChange={(e) => setUpdateQty(e.target.value)}
                placeholder="0.00"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-xl font-bold focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsUpdateModalOpen(false)} className="px-4 py-2 text-brand-text-muted hover:text-brand-text">Cancel</button>
            <button 
              onClick={handleSaveStock} 
              className={cn(
                "px-8 py-2 rounded-lg font-bold text-white shadow-lg transition-all",
                updateType === 'add' ? "bg-brand-primary shadow-brand-primary/20" : "bg-red-500 shadow-red-500/20"
              )}
            >
              Update Inventory
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
