import { NavLink } from 'react-router-dom';
import { 
  Sparkles, Package, Layers, Warehouse
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Job Estimator', path: '/', icon: Sparkles },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Materials', path: '/materials', icon: Layers },
  { name: 'Inventory', path: '/inventory', icon: Warehouse },
];

export default function Sidebar() {
  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-brand-card border-r border-brand-border flex flex-col transition-all duration-300 z-20 shadow-2xl w-16"
    )}>
      <div className="h-16 flex items-center justify-center border-b border-brand-border px-4 overflow-hidden shrink-0">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 80 52.47" 
          className="h-8 w-8 shrink-0"
        >
          <defs>
            <style>{`.cls-5{fill:#038d46}`}</style>
          </defs>
          <g>
            <path className="cls-5" d="M69.9,52.47H8.3c-1.4-.1-2.79-.34-4.14-.73-2.46-.55-5-4.86-3.89-7.44,2-4.64,3.79-9.35,5.77-14,2.69-6.27,5.34-12.57,8.27-18.72C17.75,4.36,23.44.26,31.66.24c28.87-.06,57.75-.11,86.63-.15,11.83,0,23.66-.12,35.5-.09,1.51.04,3,.33,4.41.86,2.63.96,4.22,3.64,3.81,6.41-.14,1.35-.48,2.68-1,3.93-4.36,10.06-8.59,20.19-13.26,30.1-3.3,7-9,10.93-17,10.94h-60.84v.23Z"/>
            <rect className="cls-5" x="14.56" y="6.2" width="134.36" height="39.5" rx="8.98" ry="8.98"/>
          </g>
        </svg>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-4 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.name}
              className={({ isActive }) => cn(
                "flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                  : "text-brand-text-muted hover:bg-brand-bg hover:text-brand-text"
              )}
            >
              <item.icon size={22} className="shrink-0" />
              {/* Tooltip visible on hover (using title attribute for no-dependency simplicity) */}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-brand-border flex flex-col items-center">
        <div 
          className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-lg shadow-brand-primary/20"
          title="Admin User"
        >
          AU
        </div>
      </div>
    </div>
  );
}
