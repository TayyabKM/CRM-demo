import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Shield, 
  Settings2, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Save,
  Loader2,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/layout/Sidebar';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const DEPARTMENTS = [
  { id: 'finance', name: 'Finance' },
  { id: 'inventory', name: 'Inventory' },
  { id: 'design', name: 'Design' },
  { id: 'production', name: 'Production' },
  { id: 'sales', name: 'Sales' },
  { id: 'admin', name: 'Admin' }
];

// Secondary Firebase app for creating users without signing out admin
const firebaseConfig = {
  apiKey: "AIzaSyCnl5Fj2ODIbhXsk81lXXtqOCvoZFr71tw",
  authDomain: "brandline-ai.firebaseapp.com",
  projectId: "brandline-ai",
  storageBucket: "brandline-ai.firebasestorage.app",
  messagingSenderId: "229552711009",
  appId: "1:229552711009:web:d614a3f45e21dc83a45120"
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const { currentUser, userProfile, logout, hasPermission } = useAuth();
  const isSuperAdmin = userProfile?.role === 'superadmin';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-text mb-2">Platform Settings</h1>
          <p className="text-brand-text-muted font-medium">Manage your profile and organizational rules</p>
        </div>
        
        <div className="flex bg-[#3E3E3E] p-1 rounded-2xl border border-brand-border h-fit">
          <button
            onClick={() => setActiveTab('account')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2",
              activeTab === 'account' ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
            )}
          >
            <User size={18} />
            My Account
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2",
              activeTab === 'roles' ? "bg-brand-primary text-white shadow-lg" : "text-brand-text-muted hover:text-brand-text"
            )}
          >
            <Shield size={18} />
            Roles & Permissions
          </button>
        </div>
      </header>

      <div className="min-h-[60vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'account' ? (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-brand-card border border-brand-border rounded-3xl p-8 text-center space-y-6">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-2xl animate-pulse" />
                      {currentUser?.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt={userProfile?.displayName} 
                          className="w-full h-full rounded-full border-4 border-[#313131] object-cover relative z-10 shadow-2xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full border-4 border-[#313131] bg-brand-primary flex items-center justify-center text-white text-4xl font-black relative z-10 shadow-2xl">
                          {userProfile?.displayName?.substring(0, 2).toUpperCase() || 'AU'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-black text-brand-text mb-1">{userProfile?.displayName}</h3>
                      <p className="text-brand-text-muted text-sm font-medium mb-4">{userProfile?.email}</p>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        isSuperAdmin ? "bg-brand-primary/10 text-brand-primary" : "bg-blue-500/10 text-blue-400"
                      )}>
                        {isSuperAdmin ? <ShieldCheck size={12} /> : <User size={12} />}
                        {userProfile?.role}
                      </div>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full py-4 bg-transparent border-2 border-red-500/20 hover:border-red-500/40 text-red-500 font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                      <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Settings Details */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-8">
                    <section>
                      <h4 className="text-sm font-black text-brand-text uppercase tracking-widest mb-6 border-b border-brand-border pb-4">Account Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-brand-text-muted uppercase tracking-widest">Display Name</label>
                          <input 
                            type="text" 
                            defaultValue={userProfile?.displayName}
                            className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-brand-text-muted uppercase tracking-widest">Email Address</label>
                          <input 
                            type="email" 
                            readOnly
                            value={userProfile?.email}
                            className="w-full h-12 bg-brand-bg/50 border border-brand-border rounded-xl px-4 text-brand-text-muted font-medium outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="mt-8">
                        <button className="px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary/20">
                          Save Changes
                        </button>
                      </div>
                    </section>

                    {/* Change Password - Only for email/password users */}
                    {currentUser?.providerData[0]?.providerId === 'password' && (
                      <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h4 className="text-sm font-black text-brand-text uppercase tracking-widest mb-6 border-b border-brand-border pb-4">Security</h4>
                        <div className="space-y-6 max-w-md">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-text-muted uppercase tracking-widest">Current Password</label>
                            <input 
                              type="password" 
                              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-text-muted uppercase tracking-widest">New Password</label>
                            <input 
                              type="password" 
                              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-text-muted uppercase tracking-widest">Confirm New Password</label>
                            <input 
                              type="password" 
                              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all"
                            />
                          </div>
                          <button className="w-full py-4 bg-transparent border-2 border-brand-primary/20 hover:border-brand-primary/40 text-brand-primary font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group">
                            <Key size={18} />
                            Update Password
                          </button>
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!isSuperAdmin ? (
                <div className="bg-brand-card border border-brand-border rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6">
                  <div className="w-20 h-20 bg-brand-border rounded-full flex items-center justify-center mx-auto">
                    <Lock size={32} className="text-brand-text-muted" />
                  </div>
                  <h2 className="text-2xl font-black text-brand-text">SuperAdmin Access Required</h2>
                  <p className="text-brand-text-muted font-medium">You don't have permission to manage organizational roles and permissions. Please contact your system administrator.</p>
                </div>
              ) : (
                <RolesManager />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RolesManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditPermissions = (user) => {
    setSelectedUser(user);
    setIsPermsModalOpen(true);
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden">
      <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-card/50">
        <div>
          <h3 className="text-xl font-black text-brand-text">Team Members</h3>
          <p className="text-brand-text-muted text-sm font-medium">Control access levels for operations staff</p>
        </div>
        <AddUserModal onUserAdded={fetchUsers} isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-bg/50">
              <th className="px-8 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">User</th>
              <th className="px-8 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Role</th>
              <th className="px-8 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Permissions</th>
              <th className="px-8 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest">Last Login</th>
              <th className="px-8 py-4 text-[10px] font-black text-brand-text-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6">
                    <div className="h-10 bg-brand-border rounded-xl w-full" />
                  </td>
                </tr>
              ))
            ) : users.map(user => {
              const activeCount = Object.values(user.permissions || {}).filter(Boolean).length;
              const totalCount = Object.keys(user.permissions || {}).length;

              return (
                <tr key={user.uid} className="hover:bg-brand-bg/30 transition-colors duration-200">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-xs uppercase">
                          {user.displayName?.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-black text-brand-text">{user.displayName}</p>
                        <p className="text-[10px] text-brand-text-muted font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      user.role === 'superadmin' ? "bg-brand-primary/10 text-brand-primary" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] h-1.5 bg-brand-bg rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary rounded-full transition-all duration-500"
                          style={{ width: `${(activeCount / (totalCount || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-brand-text-muted shrink-0 uppercase tracking-tighter">
                        {user.role === 'superadmin' ? 'unlimited' : `${activeCount} / ${totalCount}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[10px] font-bold text-brand-text uppercase tracking-widest">
                      {user.lastLogin?.toDate() ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' }).format(user.lastLogin.toDate()) : 'Never'}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleEditPermissions(user)}
                        className="p-2 bg-brand-bg hover:bg-brand-border text-brand-primary rounded-lg transition-all duration-200"
                        title="Edit Permissions"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        disabled={user.role === 'superadmin'}
                        className="p-2 bg-brand-bg hover:bg-red-500/10 text-brand-text-muted hover:text-red-500 rounded-lg transition-all duration-200 disabled:opacity-20"
                        title="Remove User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PermissionsModal 
        isOpen={isPermsModalOpen} 
        setIsOpen={setIsPermsModalOpen} 
        user={selectedUser} 
        onUpdate={fetchUsers}
      />
    </div>
  );
}

function AddUserModal({ onUserAdded, isOpen, setIsOpen }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('custom');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      // Use secondary app to create user without signing out current admin
      const secondaryApp = initializeApp(firebaseConfig, 'secondary-' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;

      // Create doc in users collection
      const newUserProfile = {
        uid: user.uid,
        email: email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
        role: role,
        department: department || null,
        permissions: {
          viewEstimator: true, viewProjects: true, viewClients: true, viewInvoices: true, 
          viewProducts: true, viewMaterials: true, viewInventory: true, viewSettings: true,
          editProducts: false, editMaterials: false, editInventory: false, createProjects: false,
          editProjects: false, deleteProjects: false, createInvoices: false, editInvoices: false,
          deleteInvoices: false, manageUsers: false, manageRoles: false
        },
        createdAt: serverTimestamp(),
        lastLogin: null
      };

      await updateDoc(doc(db, 'users', user.uid), newUserProfile); // doc creation should use setDoc but users check might fail if not exist, wait
      // Use setDoc for new document
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid), newUserProfile);

      await signOut(secondaryAuth);
      
      toast.success(`User ${email} added successfully`);
      setIsOpen(false);
      onUserAdded();
      
      // Reset form
      setEmail('');
      setDisplayName('');
      setPassword('');
      setRole('custom');
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20">
          <Plus size={18} />
          Add Member
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-brand-card border-brand-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-brand-text">Add Team Member</DialogTitle>
          <DialogDescription className="text-brand-text-muted font-medium">Create a new operational account for the platform.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Full Name</label>
            <input 
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all"
              placeholder="e.g. Zahid Ali"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all"
              placeholder="zahid@brandline.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Temporary Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all"
              placeholder="Minimum 8 chars"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">System Role</label>
            <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border">
              <button
                type="button"
                onClick={() => setRole('custom')}
                className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", role === 'custom' ? "bg-brand-primary text-white" : "text-brand-text-muted hover:text-brand-text")}
              >
                Custom
              </button>
              <button
                type="button"
                onClick={() => setRole('superadmin')}
                className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", role === 'superadmin' ? "bg-brand-primary text-white" : "text-brand-text-muted hover:text-brand-text")}
              >
                SuperAdmin
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-12 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all"
            >
              <option value="">None</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-brand-bg rounded-xl p-4 border border-brand-primary/10">
            <p className="text-[10px] text-brand-primary font-bold italic">
              * The user will be able to change their password and profile details after their first login.
            </p>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 bg-transparent hover:bg-brand-border text-brand-text font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Create Member
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const permissionGroups = [
  {
    title: "Estimator & Products",
    perms: [
      { id: 'viewEstimator', label: 'View Estimator' },
      { id: 'viewProducts', label: 'View Products' },
      { id: 'editProducts', label: 'Edit Products' },
      { id: 'viewMaterials', label: 'View Materials' },
      { id: 'editMaterials', label: 'Edit Materials' },
      { id: 'viewInventory', label: 'View Inventory' },
      { id: 'editInventory', label: 'Edit Inventory' }
    ]
  },
  {
    title: "Projects & Clients",
    perms: [
      { id: 'viewProjects', label: 'View Projects' },
      { id: 'createProjects', label: 'Create Projects' },
      { id: 'editProjects', label: 'Edit Projects' },
      { id: 'deleteProjects', label: 'Delete Projects' },
      { id: 'viewClients', label: 'View Clients' }
    ]
  },
  {
    title: "Invoices & Billing",
    perms: [
      { id: 'viewInvoices', label: 'View Invoices' },
      { id: 'createInvoices', label: 'Create Invoices' },
      { id: 'editInvoices', label: 'Edit Invoices' },
      { id: 'deleteInvoices', label: 'Delete Invoices' }
    ]
  },
  {
    title: "Administration",
    perms: [
      { id: 'viewSettings', label: 'View Settings' },
      { id: 'manageUsers', label: 'Manage Users' },
      { id: 'manageRoles', label: 'Manage Roles' }
    ]
  }
];

function PermissionsModal({ isOpen, setIsOpen, user, onUpdate }) {
  const [perms, setPerms] = useState({});
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPerms(user.permissions || {});
      setDepartment(user.department || '');
    }
  }, [user]);

  const togglePerm = (id) => {
    setPerms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        permissions: perms,
        department: department || null,
        role: user.role // Keep role same
      });
      toast.success("Permissions updated successfully");
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-brand-card border-brand-border h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
             <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-black text-lg">
                {user.displayName?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-brand-text">{user.displayName}</DialogTitle>
                <p className="text-xs text-brand-text-muted font-bold tracking-widest uppercase">{user.role} Account</p>
              </div>
          </div>
          <DialogDescription className="text-brand-text-muted font-medium">Configure granular access controls for this operations profile.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4 px-1">
          <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Assignment: Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full h-11 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl px-4 text-brand-text font-medium outline-none transition-all text-sm"
          >
            <option value="">None</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar my-6 space-y-8">
          {user.role === 'superadmin' ? (
            <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-6 flex items-start gap-4">
              <ShieldCheck className="text-brand-primary shrink-0" size={24} />
              <div>
                <h4 className="text-brand-primary font-black uppercase tracking-widest text-sm mb-1">SuperAdmin Unrestricted Access</h4>
                <p className="text-brand-text text-sm font-medium">This user has full administrative control. Individual permission overrides are not required as SuperAdmin inherits all platform capabilities.</p>
              </div>
            </div>
          ) : (
            permissionGroups.map(group => (
              <div key={group.title} className="space-y-4">
                <h4 className="text-[10px] font-black text-brand-text uppercase tracking-[0.2em] border-b border-brand-border pb-2 inline-block">{group.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.perms.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => togglePerm(p.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border bg-brand-bg/30 cursor-pointer transition-all duration-200 group",
                        perms[p.id] ? "border-brand-primary/30 ring-1 ring-brand-primary/20" : "border-brand-border hover:border-brand-text-muted/30"
                      )}
                    >
                      <span className={cn("text-xs font-bold transition-colors", perms[p.id] ? "text-brand-primary" : "text-brand-text")}>{p.label}</span>
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center transition-all duration-200",
                        perms[p.id] ? "bg-brand-primary text-white" : "bg-brand-bg border border-brand-border group-hover:border-brand-text-muted"
                      )}>
                        {perms[p.id] && <CheckCircle2 size={12} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-brand-border">
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 bg-transparent hover:bg-brand-border text-brand-text font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || user.role === 'superadmin'}
            className="px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-20"
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            Save Permissions
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
