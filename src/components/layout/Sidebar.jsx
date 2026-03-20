import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, MessageSquare, FileText, 
  Briefcase, Palette, CheckSquare, Receipt, 
  Settings, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients & CRM', path: '/clients', icon: Users },
  { name: 'Inquiries & Leads', path: '/inquiries', icon: MessageSquare },
  { name: 'Quotations', path: '/quotations', icon: FileText },
  { name: 'Job Orders', path: '/jobs', icon: Briefcase },
  { name: 'Design & Artwork', path: '/design', icon: Palette },
  { name: 'Client Approvals', path: '/approvals', icon: CheckSquare },
  { name: 'Billing & Invoicing', path: '/billing', icon: Receipt },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-brand-card border-r border-brand-border flex flex-col transition-all duration-300 z-20",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-brand-border">
        {!collapsed && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 258.53 52.47" className="h-9">
            <defs>
              <style>{`.cls-1{fill:#fbfcfb}.cls-5{fill:#038d46}.cls-7{fill:#0b914c}.cls-9{fill:#0b904c}.cls-10{fill:#fbfcfc}.cls-12{fill:#1c9859}`}</style>
            </defs>
            <g>
              <path className="cls-5" d="M69.9,52.47H8.3c-1.4-.1-2.79-.34-4.14-.73-2.46-.55-5-4.86-3.89-7.44,2-4.64,3.79-9.35,5.77-14,2.69-6.27,5.34-12.57,8.27-18.72C17.75,4.36,23.44.26,31.66.24c28.87-.06,57.75-.11,86.63-.15,11.83,0,23.66-.12,35.5-.09,1.51.04,3,.33,4.41.86,2.63.96,4.22,3.64,3.81,6.41-.14,1.35-.48,2.68-1,3.93-4.36,10.06-8.59,20.19-13.26,30.1-3.3,7-9,10.93-17,10.94h-60.84v.23Z"/>
              <rect className="cls-5" x="14.56" y="6.2" width="134.36" height="39.5" rx="8.98" ry="8.98"/>
            </g>
            <g>
              <path className="cls-7" d="M224.92,36.24c.63,2.96,3.28,5.06,6.31,5h8.65c1,0,2.1.1,2.13,1.36s-1,1.5-2.15,1.49h-8.19c-5.21.2-9.62-3.8-9.92-9-.14-1.71-.14-3.44,0-5.15.43-4.91,4.52-8.69,9.45-8.73h3.94c4.7.03,8.67,3.48,9.36,8.13.19,1.66.24,3.33.13,5,0,1.3-1,1.94-2.56,1.94h-15.48l-1.67-.04ZM241.84,33.33v-2.37c.1-3.77-2.88-6.9-6.66-7-.11,0-.23,0-.34,0h-2.58c-5.55,0-8.53,3.66-7.52,9.34l17.1.03Z"/>
              <path className="cls-7" d="M217.69,36.14v6.06c0,1.06-.36,1.88-1.5,1.85s-1.36-.85-1.36-1.83v-11.07c.21-3.74-2.65-6.94-6.39-7.15-.25-.01-.49-.01-.74,0h-2.58c-4.84,0-7.57,2.75-7.57,7.64v10.32c0,1.05-.11,2.07-1.39,2.09s-1.48-1-1.47-2v-11.23c0-5.31,4.31-9.62,9.62-9.62.02,0,.05,0,.07,0h3.64c5.31,0,9.62,4.3,9.63,9.61,0,.02,0,.03,0,.05.05,1.74.04,3.51.04,5.28Z"/>
              <path className="cls-7" d="M165.33,25.58v-9.11c0-1.11.13-2.19,1.47-2.16s1.39,1,1.38,2.11v17.6c0,4.56,2.7,7.23,7.28,7.24h7.13c1,0,1.92.3,1.92,1.43s-.89,1.43-1.92,1.42h-8c-5.05-.1-9.12-4.19-9.19-9.24-.12-3.12-.07-6.17-.07-9.29Z"/>
              <path className="cls-9" d="M189.59,32.93v9.09c0,1.06-.18,2.05-1.45,2s-1.41-1-1.41-2.07v-18.47c0-1.08.22-2.05,1.45-2s1.42,1,1.41,2.08c-.06,3.14,0,6.24,0,9.37Z"/>
            </g>
            <g>
              <path className="cls-10" d="M38.59,43.2c-3.08.07-6.15.17-9.22.19s-6.16,0-9.23-.07c0-.55-.06-1.11-.06-1.66,0-9.24.05-18.47,0-27.71,0-2.17.59-3.83,2.49-4.94,5.6.06,11.21-.18,16.78.24,5.94.44,8.93,5.09,7.54,10.87-.46,1.91-1.12,2.77-3.59,4.65,0,.08.07.21.14.24,4,1.69,5.18,4.95,4.88,9-.08,3.81-2.56,7.17-6.18,8.36-1.05.34-2.12.61-3.21.81l-.34.02Z"/>
              <path className="cls-1" d="M129.65,16.47c2.69-.41,5.43.32,7.57,2l1.47,1.66.39-.2v-10.71c1.11,0,2.22-.08,3.33,0,1.76.03,3.18,1.43,3.23,3.19,0,7.07.17,14.14-.1,21.21-.24,6.21-3.8,9.71-10,10.29-2.07.08-4.14.05-6.2-.11-.24-.16-.5-.29-.77-.4-3.7-.85-6.55-3.81-7.26-7.54-.59-2.49-.81-5.06-.64-7.61.3-2.54,1.02-5.01,2.12-7.32,1.29-2.8,4.04-3.8,6.86-4.46Z"/>
              <path className="cls-1" d="M78.06,27.01l1.51-.21,1-.15.52-.13c.99-.11,1.97-.35,2.91-.7.93-.41,1.35-1.49.94-2.41-.18-.42-.52-.75-.94-.94-.93-.31-1.89-.51-2.87-.59-1.69-.13-3.34-.16-4.48,1.47-.15.22-.62.29-.94.29-1.92,0-3.83,0-5.75-.05.31-3.08,2.46-5.67,5.43-6.54l1.52-.58c2.77-.04,5.54.07,8.29.35,4.55.71,6.48,3.28,6.47,7.88v7.58c0,6.94-3,10.5-9.88,11.48-2.21.18-4.42.2-6.63.06-.58-.29-1.14-.59-1.72-.87-5.06-2.49-6.09-9.8-1.68-13.27,1.58-1.24,3.81-1.65,5.75-2.44l.55-.23Z"/>
              <path className="cls-10" d="M105.92,22.25c-3,.24-4.17,1.51-4.19,4.43,0,5.49,0,11-.06,16.47,0,.05,0,.09-.15.32h-6.47c0-5.9-.16-11.8,0-17.68-.07-3.71,2.17-7.06,5.62-8.42.91-.38,1.89-.61,2.84-.9,2-.07,4.01,0,6,.19,4.78.79,7.61,3.38,7.92,8.18.4,6.16.09,12.36.09,18.64h-4.33c-1.7-.73-2.24-2-2.2-3.85.11-4.18.05-8.36,0-12.54.1-3.5-1.54-5.02-5.07-4.84Z"/>
              <path className="cls-1" d="M61.7,16.84l.88-.08h3.8v6.91h-2.59c-3.34.11-5.2,1.93-5.26,5.35-.08,4.54,0,9.08-.06,13.63,0,.19,0,.39-.06.59h-6.94c.19-5.8.18-11.35.61-16.87.16-3,1.8-5.73,4.39-7.27,1.69-.87,3.44-1.62,5.23-2.26Z"/>
            </g>
          </svg>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-brand-bg text-brand-text-muted hover:text-brand-text transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 rounded-md transition-colors group relative",
                isActive 
                  ? "bg-brand-primary/15 text-brand-primary border-l-2 border-brand-primary" 
                  : "text-brand-text-muted hover:bg-brand-bg hover:text-brand-text border-l-2 border-transparent"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn("shrink-0", collapsed ? "mx-auto" : "mr-3")} size={20} />
              {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-brand-border space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center px-3 py-2.5 rounded-md transition-colors",
            isActive 
              ? "bg-brand-primary/15 text-brand-primary border-l-2 border-brand-primary" 
              : "text-brand-text-muted hover:bg-brand-bg hover:text-brand-text border-l-2 border-transparent"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className={cn("shrink-0", collapsed ? "mx-auto" : "mr-3")} size={20} />
          {!collapsed && <span className="font-medium text-sm">Settings</span>}
        </NavLink>
        
        <div className={cn("flex items-center mt-4", collapsed ? "justify-center" : "px-3")}>
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
            AU
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-brand-text truncate">Admin User</p>
              <p className="text-xs text-brand-text-muted truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
