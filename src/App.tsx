/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { seedItems } from './lib/seed';
import { ScrollToTop } from './components/ScrollToTop';

const LoginScreen = lazy(() => import('./components/LoginScreen').then(module => ({ default: module.LoginScreen })));
const MainDashboard = lazy(() => import('./components/MainDashboard').then(module => ({ default: module.MainDashboard })));

function Preloader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6 p-4 text-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-pulse relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
        <div className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-[-10px] bg-primary/20 blur-xl rounded-full animate-pulse"></div>
      </div>
      <div className="font-mono text-xs text-primary tracking-[0.3em] uppercase animate-pulse">Iniciando Fornalha</div>
    </div>
  );
}

function AppContent() {
  const { user, loading, profile } = useAuth();

  useEffect(() => {
    if (profile?.role === 'admin') {
      seedItems().catch(console.error);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <Preloader />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="fixed inset-0 z-[9999]"><Preloader /></div>}>
      {user ? <MainDashboard /> : <LoginScreen />}
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-on-background relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        {/* Visual Decorations */}
        <div className="fixed inset-0 z-0 mesh-pattern opacity-40 pointer-events-none" />
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-surface-container-highest/30 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <AppContent />
          <ScrollToTop />
        </div>
      </div>
    </AuthProvider>
  );
}
