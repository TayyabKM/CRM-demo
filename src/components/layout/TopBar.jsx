import { Bell, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect } from 'react';

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

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser || !userProfile) return;

    // We can't do complex OR in Firestore query easily, so we fetch all notifications and filter
    // Actually, we can fetch all unread and filter client-side if the volume is low
    // For now, let's just listen to all notifications for the user
    const q = query(collection(db, 'notifications'), where('status', '==', 'unread'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter(doc => {
        const n = doc.data();
        return n.forUserId === currentUser.uid || 
               n.forRole === userProfile.role || 
               (n.forDept && n.forDept === userProfile.department);
      }).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  const title = routeNames[location.pathname] || 'Job Estimator';

  const getInitials = () => {
    if (userProfile?.displayName) return userProfile.displayName.substring(0, 2).toUpperCase();
    return currentUser?.email?.substring(0, 2).toUpperCase() || 'AU';
  };

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
        
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-brand-text-muted hover:text-brand-text transition-colors rounded-full hover:bg-brand-card"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full border border-brand-bg flex items-center justify-center animate-in zoom-in duration-300">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
        <div 
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-black text-xs cursor-pointer shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
        >
          {getInitials()}
        </div>
      </div>
    </header>
  );
}
