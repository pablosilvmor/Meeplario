import React, { useState, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { SectorDashboard } from "./SectorDashboard";
import { Sector } from "../types";
import { LoginScreen } from "./LoginScreen";

const InventoryList = lazy(() => import('./InventoryList').then(m => ({ default: m.InventoryList })));
const ShoppingList = lazy(() => import('./ShoppingList').then(m => ({ default: m.ShoppingList })));
const ProfileView = lazy(() => import('./ProfileView').then(m => ({ default: m.ProfileView })));
const AdminApprovalView = lazy(() => import('./AdminApprovalView').then(m => ({ default: m.AdminApprovalView })));
const DataManagement = lazy(() => import('./DataManagement').then(m => ({ default: m.DataManagement })));

function Fallback() {
  return (
    <div className="flex justify-center py-20 animate-pulse">
      <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function MainDashboard() {
  const [activeTab, setActiveTab] = useState<
    Sector | "profile" | "admin" | "data"
  >("geral");
  const { profile } = useAuth();

  if (!profile || !profile.approved) {
    return <LoginScreen />;
  }

  const allowedSectors = profile.allowedSectors || [];
  const isAdmin = profile.role === "admin";

  const renderContent = () => {
    switch (activeTab) {
      case "geral":
        return (
          <SectorDashboard
            onSectorSelect={(s) => setActiveTab(s)}
            allowedSectors={allowedSectors}
            onDataManagement={isAdmin ? () => setActiveTab("data") : undefined}
          />
        );
      case "compras":
        return allowedSectors.includes("compras") || allowedSectors.includes("geral") ? (
          <ShoppingList />
        ) : (
          <SectorDashboard
            onSectorSelect={(s) => setActiveTab(s)}
            allowedSectors={allowedSectors}
            onDataManagement={isAdmin ? () => setActiveTab("data") : undefined}
          />
        );
      case "profile":
        return (
          <ProfileView
            onAdminPanel={() => setActiveTab("admin")}
            onDataPanel={() => setActiveTab("data")}
          />
        );
      case "admin":
        return isAdmin ? (
          <AdminApprovalView />
        ) : (
          <ProfileView onAdminPanel={() => setActiveTab("admin")} />
        );
      case "data":
        return isAdmin ? (
          <DataManagement />
        ) : (
          <ProfileView onAdminPanel={() => setActiveTab("admin")} />
        );
      default:
        // Assume activeTab is a custom sector or standard sector
        return allowedSectors.includes(activeTab) || allowedSectors.includes("geral") ? (
          <InventoryList sector={activeTab} />
        ) : (
          <SectorDashboard
            onSectorSelect={(s) => setActiveTab(s)}
            allowedSectors={allowedSectors}
            onDataManagement={isAdmin ? () => setActiveTab("data") : undefined}
          />
        );
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-outline-variant/30 flex justify-between items-center w-full px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="flex items-center gap-2 font-display text-xl md:text-2xl uppercase tracking-widest text-primary-container drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]">
              <img src="https://i.imgur.com/6w277DR.jpeg" className="w-8 h-8 rounded-lg" alt="Logo" />
              MEEPLÁRIO
            </h1>
            <p className="font-sans text-[9px] text-on-surface-variant opacity-60">
              Desenvolvido por{" "}
              <a
                href="https://pablosilvmor.github.io/site/1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-container hover:underline"
              >
                Pablo Moreira
              </a>
            </p>
          </div>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<Fallback />}>
              {renderContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,0,0,0.5)] rounded-t-xl px-4 h-16 flex justify-around items-center">
        <NavButton
          icon="inventory_2"
          label="Estoque"
          active={
            activeTab !== "geral" &&
            activeTab !== "compras" &&
            activeTab !== "profile" &&
            activeTab !== "admin"
          }
          onClick={() => setActiveTab("geral")}
        />
        <NavButton
          icon="warning"
          label="Alertas"
          active={activeTab === "compras"}
          onClick={() => setActiveTab("compras")}
        />
        <NavButton
          icon="category"
          label="Setores"
          active={activeTab === "geral"}
          onClick={() => setActiveTab("geral")}
        />
        <NavButton
          icon="person"
          label="Perfil"
          active={activeTab === "profile" || activeTab === "admin"}
          onClick={() => setActiveTab("profile")}
        />
      </nav>
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all ${
        active
          ? "text-primary-container scale-105 drop-shadow-[0_0_5px_rgba(255,107,0,0.4)]"
          : "text-on-surface-variant opacity-60 hover:opacity-100"
      }`}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontVariationSettings: active ? "'FILL' 1" : undefined }}
      >
        {icon}
      </span>
      <span className="font-mono text-[10px] mt-1 uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}
