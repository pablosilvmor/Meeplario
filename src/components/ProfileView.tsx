import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export function ProfileView({
  onAdminPanel,
  onDataPanel,
}: {
  onAdminPanel?: () => void;
  onDataPanel?: () => void;
}) {
  const { profile, logOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Fetch all allowed items to calculate stats
  const itemsRef = collection(db, "items");
  const [itemsSnapshot] = useCollection(itemsRef);
  const items = itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) || [];
  
  // Only count items in allowed sectors if not admin/general
  const visibleItems = (profile?.role === "admin" || profile?.allowedSectors?.includes("geral")) 
    ? items 
    : items.filter(i => profile?.allowedSectors?.includes(i.sectorId));

  const totalItems = visibleItems.length;
  const criticalItems = visibleItems.filter(i => (i.quantity || i.qty || 0) <= (i.criticalQuantity || i.minQty || 0)).length;


  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[320px] glass-panel border border-outline-variant rounded-2xl p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-container/30">
                <span className="material-symbols-outlined text-primary-container text-3xl">logout</span>
              </div>
              <h4 className="font-display text-lg text-on-surface uppercase tracking-[0.2em] mb-4">
                ENCERRAR SESSÃO?
              </h4>
              <p className="font-sans text-sm text-on-surface-variant mb-8 leading-relaxed">
                Deseja realmente sair do sistema e encerrar seu turno?
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    logOut();
                    setShowLogoutConfirm(false);
                  }}
                  className="w-full py-4 bg-primary-container text-on-primary-container rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  SIM, ENCERRAR AGORA
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 border border-outline-variant text-on-surface-variant rounded-xl uppercase tracking-widest hover:bg-surface-container transition-colors"
                >
                  PERMANECER ATIVO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header className="text-center">
        <div className="w-24 h-24 rounded-2xl bg-surface-container-highest border border-outline-variant mx-auto mb-4 flex items-center justify-center overflow-hidden">
          <img
            src="https://i.imgur.com/4dwZg3s.png"
            alt="Avatar do Operador"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-on-surface flex items-center justify-center gap-2">
          {profile?.name}
          {profile?.role === 'admin' && (
            <span className="bg-primary-container text-on-primary-container text-[8px] px-2 py-0.5 rounded-full font-mono font-bold tracking-tighter">ADMIN</span>
          )}
        </h2>
        <p className="font-mono text-xs text-primary uppercase tracking-[.3em] font-bold mt-1">
          {profile?.role === "admin"
            ? "Comandante"
            : profile?.role === "chef"
              ? "Chef Tático"
              : profile?.role || "Chef Tático"}{" "}
          • Operador Ativo
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel border border-outline-variant/30 p-6 rounded-xl">
          <h3 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
            Credenciais
          </h3>
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[9px] text-on-surface-variant uppercase">
                ID de E-mail
              </p>
              <p className="font-sans font-bold text-on-surface">
                {profile?.email}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] text-on-surface-variant uppercase">
                ID do Operador
              </p>
              <p className="font-sans font-bold text-on-surface" title={profile?.uid}>
                {profile?.uid?.substring(0, 8).toUpperCase() || "N/A"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] text-on-surface-variant uppercase">
                Código de Comando
              </p>
              <p className="font-sans font-bold text-primary-container" title={profile?.uid}>
                {profile?.uid ? `PRO-${profile.uid.substring(profile.uid.length - 8).toUpperCase()}` : "PRO-ACCESS"}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel border border-outline-variant/30 p-6 rounded-xl">
          <h3 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
            Estatísticas Táticas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[9px] text-on-surface-variant uppercase">
                Itens Ativos
              </p>
              <p className="font-display text-2xl text-primary font-bold">{totalItems < 10 ? `0${totalItems}` : totalItems}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] text-on-surface-variant uppercase">
                Atenção Necessária
              </p>
              <p className="font-display text-2xl text-error font-bold">{criticalItems < 10 ? `0${criticalItems}` : criticalItems}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {profile?.role === "admin" && onAdminPanel && (
          <button
            onClick={onAdminPanel}
            className="w-full py-4 bg-primary-container/10 border border-primary-container/30 text-primary-container rounded-xl font-mono text-xs tracking-widest uppercase hover:bg-primary-container/20 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">
              admin_panel_settings
            </span>
            Painel de Acesso
          </button>
        )}
        {profile?.role === "admin" && onDataPanel && (
          <button
            onClick={onDataPanel}
            className="w-full py-4 bg-secondary-container/10 border border-secondary-container/30 text-secondary-container rounded-xl font-mono text-xs tracking-widest uppercase hover:bg-secondary-container/20 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">database</span>
            Gestão de Setores e Itens
          </button>
        )}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 bg-error/10 border border-error/30 text-error rounded-xl font-mono text-xs tracking-widest uppercase hover:bg-error/20 transition-all flex items-center justify-center gap-2 mt-4"
        >
          <span className="material-symbols-outlined">logout</span>
          Encerrar Sessão
        </button>
      </div>

      <footer className="pt-8 text-center opacity-30">
        <p className="font-mono text-[10px] uppercase tracking-widest">
          Conectado ao Núcleo MEEPLÁRIO • V1.2.0 • {profile?.role?.toUpperCase()}
        </p>
      </footer>
    </div>
  );
}
