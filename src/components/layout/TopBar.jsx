import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeNames = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients & CRM',
  '/inquiries': 'Inquiries & Leads',
  '/quotations': 'Quotations',
  '/jobs': 'Job Orders',
  '/design': 'Design & Artwork',
  '/approvals': 'Client Approvals',
  '/billing': 'Billing & Invoicing',
  '/settings': 'Settings',
};

export default function TopBar({ collapsed }) {
  const location = useLocation();
  const title = routeNames[location.pathname] || 'Job Estimator';

  return (
    <header className="h-16 bg-brand-bg border-b border-brand-border flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-brand-text">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search jobs, clients..." 
            className="bg-brand-card border border-brand-border rounded-md pl-10 pr-4 py-1.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary w-64"
          />
        </div>
        
        <button className="relative p-2 text-brand-text-muted hover:text-brand-text transition-colors rounded-full hover:bg-brand-card">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full border border-brand-bg"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
          AU
        </div>
      </div>
    </header>
  );
}
