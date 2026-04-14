import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import JobEstimator from './pages/JobEstimator';
import Products from './pages/Products';
import Materials from './pages/Materials';
import Inventory from './pages/Inventory';
import { initialProducts, masterMaterials, initialInventory } from './data/estimatorData';

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [materials, setMaterials] = useState(masterMaterials);
  const [inventory, setInventory] = useState(initialInventory);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <JobEstimator 
              products={products} 
              setProducts={setProducts} 
              materials={materials}
              setMaterials={setMaterials}
              inventory={inventory}
            />
          } />
          <Route path="products" element={
            <Products 
              products={products} 
              setProducts={setProducts} 
              materials={materials} 
            />
          } />
          <Route path="materials" element={
            <Materials 
              materials={materials} 
              setMaterials={setMaterials} 
              inventory={inventory}
              setInventory={setInventory}
              products={products}
            />
          } />
          <Route path="inventory" element={
            <Inventory 
              inventory={inventory} 
              setInventory={setInventory} 
              materials={materials} 
            />
          } />
        </Route>
      </Routes>
      <Toaster position="top-right" theme="dark" />
    </Router>
  );
}
