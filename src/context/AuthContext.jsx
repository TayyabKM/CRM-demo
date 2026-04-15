import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default permissions object as specified in requirements
  const defaultPermissions = {
    viewEstimator: true,
    viewProjects: true,
    viewClients: true,
    viewInvoices: true,
    viewProducts: true,
    viewMaterials: true,
    viewInventory: true,
    viewSettings: true,
    editProducts: true,
    editMaterials: true,
    editInventory: true,
    createProjects: true,
    editProjects: true,
    deleteProjects: true,
    createInvoices: true,
    editInvoices: true,
    deleteInvoices: true,
    manageUsers: true,
    manageRoles: true,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await syncUserProfile(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const syncUserProfile = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        
        // Update last login
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      } else {
        // Check if this is the first user
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(query(usersRef, limit(1)));
        const isFirstUser = usersSnapshot.empty;

        const newUserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
          role: isFirstUser ? 'superadmin' : 'custom',
          permissions: defaultPermissions,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };

        await setDoc(userDocRef, newUserProfile);
        setUserProfile(newUserProfile);
      }
    } catch (error) {
      console.error("Error syncing user profile:", error);
    }
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

  const hasPermission = (permissionKey) => {
    if (!userProfile) return false;
    if (userProfile.role === 'superadmin') return true;
    return userProfile.permissions?.[permissionKey] === true;
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    loginWithGoogle,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
