import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AIFloatingChat from '../shared/AIFloatingChat';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { userProfile } = useAuth();
  const userName = userProfile?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text font-sans overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <TopBar collapsed={collapsed} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      
      <AIFloatingChat />
    </div>
  );
}
