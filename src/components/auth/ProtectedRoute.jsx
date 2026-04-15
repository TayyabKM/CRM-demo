import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldX, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children, permission }) {
  const { currentUser, userProfile, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <AccessDenied />;
  }

  return children;
}

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-[#313131] flex flex-col items-center justify-center z-[9999]">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: [0.4, 1, 0.4],
        scale: [0.95, 1, 0.95]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="mb-8"
    >
      <img src="/Logo.svg" alt="Brandline AI" className="h-16 w-auto" />
    </motion.div>
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-6 w-6 text-brand-primary animate-spin" />
      <p className="text-brand-text-muted font-bold tracking-widest uppercase text-[10px] animate-pulse">
        Loading Brandline AI...
      </p>
    </div>
  </div>
);

const AccessDenied = () => (
  <div className="h-[80vh] flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-brand-card border border-brand-border rounded-3xl p-10 text-center shadow-2xl"
    >
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldX className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-brand-text mb-2">Access Denied</h2>
      <p className="text-brand-text-muted mb-8 font-medium">
        You don't have permission to view this page. Contact your administrator to request access.
      </p>
      <button
        onClick={() => window.history.back()}
        className="w-full py-4 bg-brand-bg hover:bg-brand-border text-brand-text font-bold rounded-2xl transition-all duration-200"
      >
        Go Back
      </button>
    </motion.div>
  </div>
);
