import { useState } from 'react';
import { 
  Package, Search, Plus, MoreVertical, 
  Trash2, Edit2, Filter, Download, 
  ChevronRight, ArrowRight, Layers
} from 'lucide-react';
import { cn } from '../components/layout/Sidebar';
import AddProductModal from '../components/shared/AddProductModal';
import { toast } from 'sonner';

export default function Products({ products, setProducts, materials }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = ['All', 'Signage & Display', 'Print & Branding', 'Specialty'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (formData) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
    } else {
      const newProduct = {
        ...formData,
        id: `prod_${Math.random().toString(36).substr(2, 9)}`
      };
      setProducts(prev => [newProduct, ...prev]);
    }
  };

  const handleDeleteProduct = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Product Management</h1>
          <p className="text-brand-text-muted">Manage your standard product catalog and material specs.</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-primary/20 font-medium"
        >
          <Plus className="mr-2 w-5 h-5" /> Add New Product
        </button>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-brand-border flex flex-col md:flex-row gap-4 justify-between bg-brand-bg/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand-primary transition-colors text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat 
                    ? "bg-brand-primary text-white shadow-md"
                    : "bg-brand-bg text-brand-text-muted hover:text-brand-text border border-brand-border"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50 text-brand-text-muted text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Materials</th>
                <th className="px-6 py-4 font-semibold">Base Cost</th>
                <th className="px-6 py-4 font-semibold">Lead Time</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredProducts.map((product) => {
                const totalMatCost = product.materials.reduce((sum, req) => {
                  const m = materials.find(mat => mat.id === req.materialId);
                  return sum + (m ? m.unitCost * req.qty : 0);
                }, 0);
                const totalTimeline = Object.values(product.timeline).reduce((a, b) => a + b, 0);

                return (
                  <tr key={product.id} className="hover:bg-brand-bg/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                          <Package size={20} />
                        </div>
                        <span className="font-medium text-brand-text">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-brand-bg border border-brand-border text-xs text-brand-text-muted">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-brand-text">
                        <Layers size={14} className="mr-1.5 text-brand-primary" />
                        {product.materials.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-brand-text font-medium">PKR {(totalMatCost + product.labourCost).toLocaleString()}</p>
                        <p className="text-[10px] text-brand-text-muted">M: {totalMatCost.toLocaleString()} | L: {product.labourCost.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-text">
                      {totalTimeline} Days
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-brand-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
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
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <Package size={48} className="mx-auto text-brand-border mb-4" />
              <p className="text-brand-text-muted">No products found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      <AddProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        materials={materials}
        initialData={editingProduct}
      />
    </div>
  );
}
