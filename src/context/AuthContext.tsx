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
      try {
        setUser(user);
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const isAdminEmail = user.email === 'meeplariojogos@gmail.com' || user.email === 'pablo.silvmor@gmail.com';
            
            if (userDoc.exists()) {
              const currentProfile = userDoc.data() as UserProfile;
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
              const newProfile: UserProfile = {
                uid: user.uid,
                name: user.displayName || 'Staff',
                email: user.email || '',
                role: isAdminEmail ? 'admin' : 'chef',
                approved: isAdminEmail,
                allowedSectors: isAdminEmail ? ['geral', 'chapa', 'porcoes', 'bebidas', 'compras'] : []
              };
              await setDoc(doc(db, 'users', user.uid), newProfile);
              setProfile(newProfile);
            }
          } catch (firestoreError: any) {
            console.error("Firestore access error during auth init:", firestoreError);
            const isDbMissing = firestoreError?.message?.includes('not found') || firestoreError?.code === 'not-found';
            setProfile(null); 
            if (isDbMissing) {
              console.warn("CRITICAL: Firestore Database not found. Please create it in the Firebase Console.");
            }
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization fatal error:", error);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      // Ensure persistence is set BEFORE trying to sign in
      await setPersistence(auth, browserLocalPersistence);
      // Use the standard popup method with explicit resolver
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      if (result.user) {
        console.log("Successfully logged in:", result.user.email);
      }
    } catch (error: any) {
      console.error("Login Error Details:", error.code, error.message);
      if (error.code === 'auth/popup-blocked') {
        alert("O pop-up de login foi bloqueado pelo seu navegador. Por favor, permita pop-ups para este site.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Silently handle user closing the popup
      } else {
        alert(`Erro ao realizar login (${error.code}). Por favor, verifique se o domínio está autorizado no Firebase.`);
      }
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
