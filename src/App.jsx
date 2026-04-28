import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import JobEstimator from './pages/JobEstimator';
import Products from './pages/Products';
import Materials from './pages/Materials';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { initialProducts, masterMaterials, initialInventory } from './data/estimatorData';

import Enquiry from './pages/Enquiry';
import Kanban from './pages/Kanban';
import Approvals from './pages/Approvals';
import Expenses from './pages/Expenses';
import Receivables from './pages/Receivables';
import Dispatch from './pages/Dispatch';
import Profitability from './pages/Profitability';
import Notifications from './pages/Notifications';

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
            <Route path="notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="enquiry" element={
              <ProtectedRoute permission="viewProjects">
                <Enquiry />
              </ProtectedRoute>
            } />
            <Route path="kanban" element={
              <ProtectedRoute permission="viewProjects">
                <Kanban />
              </ProtectedRoute>
            } />
            <Route path="approvals" element={
              <ProtectedRoute permission="viewProjects">
                <Approvals />
              </ProtectedRoute>
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
            <Route path="projects" element={
              <ProtectedRoute permission="viewProjects">
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="clients" element={
              <ProtectedRoute permission="viewClients">
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="invoices" element={
              <ProtectedRoute permission="viewInvoices">
                <Invoices />
              </ProtectedRoute>
            } />
            <Route path="invoices/new" element={
              <ProtectedRoute permission="createInvoices">
                <Invoices createMode={true} />
              </ProtectedRoute>
            } />
            <Route path="expenses" element={
              <ProtectedRoute permission="viewInvoices">
                <Expenses />
              </ProtectedRoute>
            } />
            <Route path="receivables" element={
              <ProtectedRoute permission="viewInvoices">
                <Receivables />
              </ProtectedRoute>
            } />
            <Route path="dispatch" element={
              <ProtectedRoute permission="viewProjects">
                <Dispatch />
              </ProtectedRoute>
            } />
            <Route path="profitability" element={
              <ProtectedRoute permission="viewInvoices">
                <Profitability />
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
