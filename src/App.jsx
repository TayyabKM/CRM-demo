import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import JobEstimator from './pages/JobEstimator';
import Products from './pages/Products';
import Materials from './pages/Materials';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { initialProducts, masterMaterials, initialInventory } from './data/estimatorData';

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [materials, setMaterials] = useState(masterMaterials);
  const [inventory, setInventory] = useState(initialInventory);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
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
              <ProtectedRoute permission="viewProducts">
                <Products 
                  products={products} 
                  setProducts={setProducts} 
                  materials={materials} 
                />
              </ProtectedRoute>
            } />
            <Route path="materials" element={
              <ProtectedRoute permission="viewMaterials">
                <Materials 
                  materials={materials} 
                  setMaterials={setMaterials} 
                  inventory={inventory}
                  setInventory={setInventory}
                  products={products}
                />
              </ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute permission="viewInventory">
                <Inventory 
                  inventory={inventory} 
                  setInventory={setInventory} 
                  materials={materials} 
                />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute permission="viewSettings">
                <Settings />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" theme="dark" />
      </Router>
    </AuthProvider>
  );
}
