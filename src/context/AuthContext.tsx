import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, browserPopupRedirectResolver, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const isAdminEmail = user.email === 'meeplariojogos@gmail.com' || user.email === 'pablo.silvmor@gmail.com';
        
        if (userDoc.exists()) {
          const currentProfile = userDoc.data() as UserProfile;
          // Upgrade to admin if email matches but role doesn't
          if (isAdminEmail && (currentProfile.role !== 'admin' || !currentProfile.approved)) {
            const updatedProfile = { 
              ...currentProfile, 
              role: 'admin' as const, 
              approved: true,
              allowedSectors: ['geral', 'chapa', 'porcoes', 'bebidas', 'compras']
            };
            await setDoc(doc(db, 'users', user.uid), updatedProfile);
            setProfile(updatedProfile);
          } else {
            setProfile(currentProfile);
          }
        } else {
          // Create new profile - defaults to unapproved for non-admin
          const newProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || 'Staff',
            email: user.email || '',
            role: isAdminEmail ? 'admin' : 'chef',
            approved: isAdminEmail, // Admin is auto-approved
            allowedSectors: isAdminEmail ? ['geral', 'chapa', 'porcoes', 'bebidas', 'compras'] : []
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      // Explicitly set persistence and use the resolver for better iframe compatibility
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logOut = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
