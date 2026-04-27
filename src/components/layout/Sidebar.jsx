import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sparkles, FolderOpen, Users, Package, Layers, Warehouse, Settings2, ChevronRight,
  Receipt, ClipboardList, KanbanSquare, ShieldCheck, Banknote, TrendingDown,
  Truck, BarChart3
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Job Estimator',  path: '/',             icon: Sparkles,      permission: null },
  { name: 'Enquiry / BOQ',  path: '/enquiry',       icon: ClipboardList, permission: 'viewProjects' },
  { name: 'Projects',       path: '/projects',      icon: FolderOpen,    permission: 'viewProjects' },
  { name: 'Task Board',     path: '/kanban',         icon: KanbanSquare,  permission: 'viewProjects' },
  { name: 'Approvals',      path: '/approvals',      icon: ShieldCheck,   permission: 'viewProjects' },
  { name: 'Clients',        path: '/clients',        icon: Users,         permission: 'viewClients' },
  { name: 'Invoices',       path: '/invoices',       icon: Receipt,       permission: 'viewInvoices' },
  { name: 'Receivables',    path: '/receivables',    icon: Banknote,      permission: 'viewInvoices' },
  { name: 'Expenses',       path: '/expenses',       icon: TrendingDown,  permission: 'viewInvoices' },
  { name: 'Dispatch',       path: '/dispatch',       icon: Truck,         permission: 'viewProjects' },
  { name: 'Profitability',  path: '/profitability',  icon: BarChart3,     permission: 'viewInvoices' },
  { name: 'Products',       path: '/products',       icon: Package,       permission: 'viewProducts' },
  { name: 'Materials',      path: '/materials',      icon: Layers,        permission: 'viewMaterials' },
  { name: 'Inventory',      path: '/inventory',      icon: Warehouse,     permission: 'viewInventory' },
  { name: 'Settings',       path: '/settings',       icon: Settings2,     permission: 'viewSettings' },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentUser, userProfile, hasPermission } = useAuth();
  const navigate = useNavigate();

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName.substring(0, 2).toUpperCase();
    }
    return currentUser?.email?.substring(0, 2).toUpperCase() || 'AU';
  };

  return (
    <div 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-brand-card border-r border-brand-border flex flex-col transition-all duration-300 z-50 shadow-2xl overflow-hidden",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <div className={cn(
        "h-20 flex items-center border-b border-brand-border px-4 shrink-0 transition-all duration-300",
        isExpanded ? "justify-start" : "justify-center"
      )}>
        {isExpanded ? (
          <img 
            src="/Logo.svg" 
            alt="Brandline AI" 
            className="h-10 w-auto animate-in fade-in zoom-in-95 duration-500"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 animate-in fade-in zoom-in-95 duration-300">
            <span className="text-brand-primary font-black text-lg tracking-tighter">BL</span>
          </div>
        )}
      </div>

      <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <nav className="space-y-2 px-2">
          {visibleNavItems.map((item) => (
            <div key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center p-2.5 rounded-xl transition-all duration-200 group relative whitespace-nowrap",
                  isActive 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                    : "text-brand-text-muted hover:bg-brand-bg hover:text-brand-text"
                )}
              >
                <item.icon size={22} className="shrink-0" />
                <span className={cn(
                  "ml-4 font-bold text-sm transition-all duration-300",
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                )}>
                  {item.name}
                </span>
                {!isExpanded && (
                  <div className="absolute left-14 bg-[#3E3E3E] text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-brand-border whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </NavLink>
              
              {/* Visual Dividers */}
              {['/', '/approvals', '/expenses', '/profitability'].includes(item.path) && (
                <div className="border-t border-brand-border/30 my-1 mx-2" />
              )}
            </div>
          ))}
        </nav>
      </div>

      <div 
        onClick={() => navigate('/settings')}
        className={cn(
          "p-4 border-t border-brand-border flex items-center transition-all duration-300 cursor-pointer hover:bg-brand-bg/50 group",
          isExpanded ? "justify-start" : "justify-center"
        )}
      >
        <div className="relative">
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={userProfile?.displayName} 
              className="w-8 h-8 rounded-full border border-brand-border object-cover shrink-0 shadow-lg shadow-brand-primary/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-110">
              {getInitials()}
            </div>
          )}
          {!isExpanded && (
             <div className="absolute left-10 top-0 bg-[#3E3E3E] text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-brand-border whitespace-nowrap">
                {userProfile?.displayName || 'My Account'}
             </div>
          )}
        </div>
        
        {isExpanded && (
          <div className="ml-3 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
            <p className="text-xs font-bold text-brand-text truncate">{userProfile?.displayName || 'User'}</p>
            <p className="text-[10px] text-brand-text-muted truncate lowercase">{userProfile?.role || 'member'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
