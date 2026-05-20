import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { doc, updateDoc, serverTimestamp, deleteDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Item } from "../types";
import { useAuth } from "../context/AuthContext";

interface StockUpdateModalProps {
  item: Item;
  onClose: () => void;
}

export function StockUpdateModal({ item, onClose }: StockUpdateModalProps) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    name: item.name,
    minStock: item.minStock,
    idealStock: item.idealStock,
    currentStock: item.currentStock,
    unit: item.unit,
    icon: item.icon || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const itemRef = doc(db, "items", item.id);
      await updateDoc(itemRef, {
        ...formData,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: profile?.name || "Staff",
      });
      
      const delta = formData.currentStock - item.currentStock;
      if (delta !== 0) {
        await addDoc(collection(db, "history"), {
          itemId: item.id,
          itemName: item.name,
          userName: profile?.name || "Staff",
          userId: profile?.id || "unknown",
          sectorId: item.sectorId,
          type: delta > 0 ? "increase" : "decrease",
          amount: Math.abs(delta),
          unit: formData.unit || "un",
          timestamp: serverTimestamp(),
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Failed to update item", error);
    } finally {
      setIsSaving(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!profile || profile.role !== 'admin') {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "items", item.id));
      onClose();
    } catch (error) {
      console.error("Failed to delete item", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[320px] glass-panel border-2 border-error/50 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(255,0,0,0.2)]"
            >
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-error/30">
                <span className="material-symbols-outlined text-error text-3xl">warning</span>
              </div>
              <h4 className="font-display text-lg text-error uppercase tracking-[0.2em] mb-4">
                CONFIRMAR EXCLUSÃO?
              </h4>
              <p className="font-sans text-sm text-on-surface-variant mb-8 leading-relaxed">
                Você está prestes a apagar <span className="text-on-surface font-bold">"{item.name}"</span>. Esta ação é IRREVERSÍVEL.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="w-full py-4 bg-error text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-error/20"
                >
                  {isDeleting ? "APAGANDO..." : "SIM, EXCLUIR AGORA"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 border border-outline-variant text-on-surface-variant rounded-xl uppercase tracking-widest hover:bg-surface-container transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg glass-panel border border-outline-variant/50 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/50">
          <h3 className="font-display text-xl text-primary-container uppercase tracking-widest">
            Atualizar Recurso
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Nome do Recurso"
                value={formData.name}
                onChange={(v: string) => setFormData({ ...formData, name: v })}
              />
              <InputField
                label="Ícone (opcional)"
                value={formData.icon}
                onChange={(v: string) => setFormData({ ...formData, icon: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Estoque Mínimo"
                type="number"
                value={formData.minStock}
                onChange={(v: string) =>
                  setFormData({ ...formData, minStock: Number(v) })
                }
              />
              <InputField
                label="Estoque Ideal"
                type="number"
                value={formData.idealStock}
                onChange={(v: string) =>
                  setFormData({ ...formData, idealStock: Number(v) })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Estoque Atual"
                type="number"
                value={formData.currentStock}
                onChange={(v: string) =>
                  setFormData({ ...formData, currentStock: Number(v) })
                }
              />
              <InputField
                label="Unidade (un/kg/lt)"
                value={formData.unit}
                onChange={(v: string) => setFormData({ ...formData, unit: v })}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 border border-outline-variant/30 rounded-xl font-mono text-[10px] tracking-widest uppercase hover:bg-surface-container transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Cancelar
            </button>
            
            <button
              disabled={isSaving || isDeleting}
              onClick={handleSave}
              className="flex-[2] py-4 bg-primary-container text-on-primary-container rounded-xl font-mono text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-primary-container/20 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? "Gravando..." : "Sincronizar"}
              <span className="material-symbols-outlined text-[18px]">
                {isSaving ? "sync" : "verified"}
              </span>
            </button>

            {profile?.role === 'admin' && (
              <button
                 disabled={isSaving || isDeleting}
                 onClick={() => setShowDeleteConfirm(true)}
                 className="flex-1 py-4 bg-error/10 border border-error/50 text-error rounded-xl hover:bg-error hover:text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                 title="Excluir item permanentemente"
              >
                 <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                   {isDeleting ? "sync" : "delete"}
                 </span>
                 <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Excluir</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-primary-container transition-colors w-full"
      />
    </div>
  );
}
