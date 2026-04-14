import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import JobEstimator from './pages/JobEstimator';
// import Dashboard from './pages/Dashboard';
// import Clients from './pages/Clients';
// import Inquiries from './pages/Inquiries';
// import Quotations from './pages/Quotations';
// import JobOrders from './pages/JobOrders';
// import DesignArtwork from './pages/DesignArtwork';
// import ClientApprovals from './pages/ClientApprovals';
// import Billing from './pages/Billing';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<JobEstimator />} />
          {/* <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="jobs" element={<JobOrders />} />
          <Route path="design" element={<DesignArtwork />} />
          <Route path="approvals" element={<ClientApprovals />} />
          <Route path="billing" element={<Billing />} /> */}
        </Route>
      </Routes>
      <Toaster position="top-right" theme="dark" />
    </Router>
  );
}
