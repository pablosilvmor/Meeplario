import React, { useState, useRef, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc,
  deleteDoc,
  limit,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Item, Sector, CustomSector } from "../types";
import { availableIcons, getSmartIcon } from "../lib/icons";
import { motion, AnimatePresence } from "motion/react";
import { StockUpdateModal } from "./StockUpdateModal";

interface InventoryListProps {
  sector: Sector;
}

export function InventoryList({ sector }: InventoryListProps) {
  const { profile, user } = useAuth();
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);

  // Sector edit state
  const [isEditingSector, setIsEditingSector] = useState(false);
  const [editSectorName, setEditSectorName] = useState("");
  const [editSectorIcon, setEditSectorIcon] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [quickAddSector, setQuickAddSector] = useState(sector);

  const itemsRef = collection(db, "items");
  const q = query(
    itemsRef,
    where("sectorId", "==", sector)
  );

  const [value, loading, error] = useCollection(q);
  const [sectorsSnapshot] = useCollection(collection(db, "sectors"));
  const customSectorDoc = sectorsSnapshot?.docs.find((d) => d.id === sector);
  const customSector = customSectorDoc
    ? ({ id: customSectorDoc.id, ...customSectorDoc.data() } as CustomSector)
    : null;

  if (error) {
    console.error("Erro ao carregar inventário:", error);
  }

  const items =
    value?.docs.map((d) => ({ id: d.id, ...d.data() }) as Item)
      .sort((a, b) => a.name.localeCompare(b.name)) || [];

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const allSectorsObj =
    sectorsSnapshot?.docs.map((d) => ({ id: d.id, name: d.data().name })) || [];
  const allSectors = allSectorsObj;

  const handleUpdateStock = async (item: Item, delta: number) => {
    const newStock = Math.max(0, item.currentStock + delta);
    const itemRef = doc(db, "items", item.id);

    await updateDoc(itemRef, {
      currentStock: newStock,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: profile?.name || "Staff",
    });

    await addDoc(collection(db, "history"), {
      itemId: item.id,
      itemName: item.name,
      userName: profile?.name || "Staff",
      userId: user?.uid,
      sectorId: item.sectorId,
      type: delta > 0 ? "increase" : "decrease",
      amount: Math.abs(delta),
      unit: item.unit || "un",
      timestamp: serverTimestamp(),
    });
  };

  const handleSetStockDirectly = async (item: Item, quantity: number) => {
    const itemRef = doc(db, "items", item.id);
    const delta = quantity - item.currentStock;
    if (delta === 0) return;

    await updateDoc(itemRef, {
      currentStock: quantity,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: profile?.name || "Staff",
    });

    await addDoc(collection(db, "history"), {
      itemId: item.id,
      itemName: item.name,
      userName: profile?.name || "Staff",
      userId: user?.uid,
      sectorId: item.sectorId,
      type: delta > 0 ? "increase" : "decrease",
      amount: Math.abs(delta),
      unit: item.unit || "un",
      timestamp: serverTimestamp(),
    });
  };

  // Sector delete/edit modals
  const [showDeleteSectorConfirm, setShowDeleteSectorConfirm] = useState(false);
  const [isDeletingSectorState, setIsDeletingSectorState] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteSectorError, setDeleteSectorError] = useState("");

  const handleDeleteSector = async () => {
    if (!profile || profile.role !== "admin") return;

    setIsDeletingSectorState(true);
    setDeleteProgress(0);
    try {
      const { writeBatch, collection, query, where, getDocs } = await import("firebase/firestore");
      
      // Query items for this sector just to be sure we have everything
      const itemsQuery = query(collection(db, "items"), where("sectorId", "==", sector));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const batch = writeBatch(db);
      
      // Add items to batch
      itemsSnapshot.docs.forEach((docSnap, index) => {
        batch.delete(docSnap.ref);
        // Approximate progress
        setDeleteProgress(Math.floor(((index + 1) / (itemsSnapshot.size + 1)) * 100));
      });
      
      // Add sector to batch
      batch.delete(doc(db, "sectors", sector));
      setDeleteProgress(100);
      
      await batch.commit();
      
      window.location.reload(); 
    } catch (e) {
      console.error(e);
      setDeleteSectorError("Erro ao apagar setor.");
      setIsDeletingSectorState(false);
      setDeleteProgress(0);
    }
  };

  const handleSaveSectorName = async () => {
    if (!editSectorName.trim() || !customSector) return;
    try {
      await updateDoc(doc(db, "sectors", sector), {
        name: editSectorName,
        icon: editSectorIcon.trim() || customSector.icon || "inventory",
      });
      setIsEditingSector(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8 pb-12">
      <AnimatePresence>
        {showDeleteSectorConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDeleteSectorConfirm(false); setDeleteSectorError(""); }}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[320px] glass-panel border-2 border-error/50 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(255,0,0,0.2)]"
            >
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-error/30">
                <span className="material-symbols-outlined text-error text-3xl">delete_forever</span>
              </div>
              <h4 className="font-display text-lg text-error uppercase tracking-[0.2em] mb-4">
                APAGAR SETOR INTEIRO?
              </h4>
              <p className="font-sans text-sm text-on-surface-variant mb-4 leading-relaxed">
                Você está prestes a excluir permanentemente o setor <span className="text-on-surface font-bold">"{customSector?.name}"</span> e todos os itens vinculados a ele. Esta ação não pode ser desfeita.
              </p>
              
              {deleteSectorError && (
                <div className="bg-error/20 border border-error text-error p-3 rounded-lg text-xs mb-4">
                  {deleteSectorError}
                </div>
              )}

              {isDeletingSectorState && (
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-mono text-on-surface-variant mb-1">
                    <span>PROGRESSO</span>
                    <span>{deleteProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-error"
                      initial={{ width: 0 }}
                      animate={{ width: `${deleteProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <button
                  disabled={isDeletingSectorState}
                  onClick={handleDeleteSector}
                  className="w-full py-4 bg-error text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-error/20"
                >
                  {isDeletingSectorState ? "APAGANDO..." : "SIM, APAGAR AGORA"}
                </button>
                <button
                  onClick={() => { setShowDeleteSectorConfirm(false); setDeleteSectorError(""); }}
                  className="w-full py-4 border border-outline-variant text-on-surface-variant rounded-xl uppercase tracking-widest hover:bg-surface-container transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col gap-1 relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary-container w-6 h-6 overflow-hidden select-none block text-center flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1", lineHeight: '24px' }}
            >
              {(customSector?.icon && availableIcons.includes(customSector?.icon)) ? customSector.icon : getIcon(sector)}
            </span>
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.3em]">
              Setor Ativo
            </span>
          </div>
          {customSector && profile?.role === "admin" && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditingSector(true);
                  setEditSectorName(customSector.name);
                  setEditSectorIcon(customSector.icon || "");
                }}
                className="flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 px-4 py-2 rounded-xl text-primary-container hover:bg-primary-container/20 transition-all text-[10px] font-mono uppercase font-bold tracking-[0.15em] group/btn shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] group-hover/btn:rotate-12 transition-transform">
                  edit_note
                </span>
                CONFIGURAR SETOR
              </button>
              <button
                onClick={() => setShowDeleteSectorConfirm(true)}
                className="flex items-center gap-2 bg-error/10 border border-error/30 px-4 py-2 rounded-xl text-error hover:bg-error hover:text-white transition-all text-[10px] font-mono uppercase font-bold tracking-[0.15em] group/btn shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] group-hover/btn:scale-125 transition-transform">
                  delete_forever
                </span>
                APAGAR SETOR
              </button>
            </div>
          )}
        </div>

        {isEditingSector ? (
          <div className="flex flex-col gap-2 mt-4 glass-panel p-4 border border-primary-container/30 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={editSectorName}
                onChange={(e) => setEditSectorName(e.target.value)}
                className="flex-[2] bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-2 text-sm rounded-lg font-display focus:border-primary-container outline-none"
                placeholder="Novo nome do setor"
              />
              <input
                value={editSectorIcon}
                onChange={(e) => setEditSectorIcon(e.target.value)}
                className="flex-1 bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-2 text-sm rounded-lg font-display focus:border-primary-container outline-none"
                placeholder="Ícone (ex: fastfood)"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditingSector(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant text-xs uppercase tracking-widest hover:bg-surface-container"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSectorName}
                className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:brightness-110"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <h2 className="font-display text-2xl md:text-3xl text-on-surface flex items-center gap-3">
            {customSector?.name || (sector === 'chapa' ? 'Setor Chapa' : sector === 'porcoes' ? 'Setor Porções' : sector === 'bebidas' ? 'Setor Bebidas' : `Setor: ${sector.toUpperCase()}`)}
            <span className="font-mono text-xs text-primary-container bg-primary-container/10 px-2 py-1 rounded-lg border border-primary-container/20">
              {filteredItems.length} ITENS
            </span>
          </h2>
        )}
        <p className="font-sans text-sm text-on-surface-variant">
          {customSector?.description ||
            "Sincronização de estoque em tempo real para componentes estratégicos."}
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Search Filter */}
        <div className="flex-1 bg-surface-container-low border border-outline-variant/30 px-4 py-2 rounded-xl flex gap-3 items-center">
          <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0">
            search
          </span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar itens..."
            className="flex-1 bg-transparent text-on-surface text-sm focus:outline-none placeholder:text-on-surface-variant/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-on-surface-variant flex-shrink-0 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Quick Add Item Form */}
        <div className="flex-1 bg-surface-container-low border border-outline-variant/30 p-2 rounded-xl flex gap-2 items-center">
          <select
            value={quickAddSector}
            onChange={(e) => setQuickAddSector(e.target.value)}
            className="bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-2 py-2 text-xs focus:outline-none w-24 md:w-32"
          >
            {allSectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            id={`quickadd-${sector}`}
            placeholder="Adicionar novo item..."
            className="flex-1 bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-container"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                const name = e.currentTarget.value.trim();
                const existing = items.find(
                  (i) =>
                    i.name.toLowerCase() === name.toLowerCase() &&
                    i.sectorId === quickAddSector,
                );
                if (existing) {
                  e.currentTarget.value = "";
                  e.currentTarget.placeholder = "Item já existe!";
                  e.currentTarget.classList.add("border-error", "placeholder-error");
                  setTimeout(() => {
                    const el = document.getElementById(`quickadd-${sector}`) as HTMLInputElement;
                    if(el) {
                       el.placeholder = "Adicionar novo item...";
                       el.classList.remove("border-error", "placeholder-error");
                    }
                  }, 2000);
                  return;
                }
                e.currentTarget.disabled = true;
                e.currentTarget.value = "Adicionando...";
                try {
                  const smartIcon = getSmartIcon(name);
                  await addDoc(collection(db, "items"), {
                    name,
                    icon: smartIcon,
                    sectorId: quickAddSector,
                    currentStock: 0,
                    minStock: 5,
                    idealStock: 20,
                    unit: "un",
                    updatedAt: serverTimestamp(),
                    lastUpdatedBy: profile?.name || "Staff",
                  });
                  const input = document.getElementById(
                    `quickadd-${sector}`,
                  ) as HTMLInputElement;
                  if (input) {
                    input.value = "";
                    input.disabled = false;
                    input.focus();
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }}
          />
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AnimatePresence>
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onUpdate={(delta) => handleUpdateStock(item, delta)}
              onSetQuantity={(q) => handleSetStockDirectly(item, q)}
              onEdit={() => setSelectedItem(item)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <ShiftFeed sector={sector} />

      {selectedItem && (
        <StockUpdateModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function ItemCard({
  item,
  onUpdate,
  onSetQuantity,
  onEdit,
}: {
  item: Item;
  onUpdate: (delta: number) => void;
  onSetQuantity: (q: number) => void;
  onEdit: () => void;
  key?: React.Key;
}) {
  const [localStock, setLocalStock] = useState(item.currentStock);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(String(item.currentStock));

  const isCritical = localStock <= item.minStock;
  const percentage = Math.min(
    100,
    Math.round((localStock / item.idealStock) * 100),
  );

  // Sync local stock with prop when prop changes (if not interacting)
  useEffect(() => {
    if (!timerRef.current && !fastTimerRef.current) {
      setLocalStock(item.currentStock);
    }
  }, [item.currentStock]);

  // Debounced update to Firestore
  useEffect(() => {
    if (localStock === item.currentStock) return;
    
    const timeout = setTimeout(() => {
      onSetQuantity(localStock);
    }, 600); // 600ms grace period after last click

    return () => clearTimeout(timeout);
  }, [localStock, item.currentStock, onSetQuantity]);

  // Refs for hold logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = (delta: number) => {
    if (timerRef.current || fastTimerRef.current) return;
    setLocalStock(prev => Math.max(0, prev + delta));
    timerRef.current = setTimeout(() => {
      fastTimerRef.current = setInterval(() => {
        setLocalStock(prev => Math.max(0, prev + delta));
      }, 150); // Slower count
    }, 500); // Longer delay before fast count
  };

  const handleEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fastTimerRef.current) clearInterval(fastTimerRef.current);
    timerRef.current = null;
    fastTimerRef.current = null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-4 flex flex-col gap-4 relative group hover:border-primary-container transition-colors"
    >
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex-shrink-0 rounded bg-surface-container-highest flex items-center justify-center text-primary-container border border-outline-variant/20 shadow-inner relative overflow-hidden">
            <span className="material-symbols-outlined text-[18px] select-none pointer-events-none">
               {(item.icon && availableIcons.includes(item.icon)) ? item.icon : 'inventory_2'}
            </span>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-xl">edit_square</span>
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-sans font-bold text-on-surface truncate">
          {item.name}
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/10">
            <motion.div
              layout
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={`h-full ${isCritical ? "bg-error critical-glow" : "bg-primary-container neon-border"}`}
            />
          </div>
          <span
            className={`font-mono text-[10px] ${isCritical ? "text-error" : "text-primary-container"}`}
          >
            {isCritical ? "CRÍTICO" : `${percentage}%`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <button
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handleStart(-1); }}
          onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleEnd(); }}
          onPointerLeave={handleEnd}
          onPointerCancel={handleEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="w-11 h-11 flex items-center justify-center bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface active:scale-95 transition-all hover:border-primary-container select-none touch-none"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>

        <div
          className="flex flex-col items-center cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          onClick={() => {
            setIsEditingQuantity(true);
            setTempQuantity(String(localStock));
          }}
        >
          <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest max-w-[50px] truncate" title={item.unit || "QTD"}>
            {item.unit || "QTD"}
          </span>
          <span
            className={`font-display text-3xl leading-none font-bold ${isCritical ? "text-error" : "text-primary-container"}`}
          >
            {localStock}
          </span>
        </div>

        <button
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handleStart(1); }}
          onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleEnd(); }}
          onPointerLeave={handleEnd}
          onPointerCancel={handleEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="w-11 h-11 flex items-center justify-center bg-primary-container border border-primary-container rounded-lg text-on-primary-container active:scale-95 transition-all neon-glow select-none touch-none"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <AnimatePresence>
        {isEditingQuantity && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingQuantity(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[280px] glass-panel border border-primary-container/30 rounded-2xl p-6 text-center shadow-2xl"
            >
              <h4 className="font-display text-sm text-primary-container uppercase tracking-[0.2em] mb-4">
                DEFINIR QUANTIDADE
              </h4>
              <p className="font-sans text-xs text-on-surface-variant mb-6">
                Defina o valor exato para <span className="text-on-surface font-bold">{item.name}</span>
              </p>
              
              <input
                autoFocus
                type="number"
                value={tempQuantity}
                onChange={(e) => setTempQuantity(e.target.value)}
                className="w-full bg-surface-container border-2 border-primary-container/50 text-on-surface text-4xl font-display font-bold text-center py-4 rounded-xl mb-6 outline-none focus:border-primary-container shadow-[0_0_20px_rgba(255,107,0,0.2)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = Number(tempQuantity);
                    setLocalStock(q);
                    onSetQuantity(q);
                    setIsEditingQuantity(false);
                  }
                }}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingQuantity(false)}
                  className="flex-1 py-3 font-mono text-[10px] border border-outline-variant text-on-surface-variant rounded-xl uppercase tracking-widest hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const q = Number(tempQuantity);
                    setLocalStock(q);
                    onSetQuantity(q);
                    setIsEditingQuantity(false);
                  }}
                  className="flex-1 py-3 font-mono text-[10px] bg-primary-container text-on-primary-container rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary-container/20"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isCritical && (
        <div className="absolute -top-2 -left-2 bg-error p-1 rounded-full border-2 border-surface shadow-xl pointer-events-none z-20">
          <span
            className="material-symbols-outlined text-white text-[14px] font-bold block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
        </div>
      )}
    </motion.div>
  );
}

function ShiftFeed({ sector }: { sector: Sector }) {
  const q = query(collection(db, "history"), orderBy("timestamp", "desc"), limit(20));
  const [value] = useCollection(q);
  const logs =
    value?.docs
      .map((d) => ({ id: d.id, ...d.data() }) as any)
      .filter((l) => !l.sectorId || l.sectorId === sector)
      .slice(0, 5) || [];

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-sans font-bold text-primary tracking-wide">
          Feed de Turno
        </h4>
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
          STATUS_AO_VIVO
        </span>
      </div>
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex gap-4 p-3 border-l-2 border-primary-container bg-surface-container/40 rounded-r-lg"
          >
            <span className="material-symbols-outlined text-primary-container">
              history
            </span>
            <div>
              <p className="font-sans text-sm text-on-surface">
                <span className="text-primary-container font-bold">
                  {log.userName}
                </span>{" "}
                {log.type === "increase" ? "adicionou" : "reduziu"}{" "}
                <span className="font-bold">{log.itemName}</span> em{" "}
                {log.amount}{log.unit ? ` ${log.unit}` : ""}.
              </p>
              <span className="font-mono text-[9px] text-on-surface-variant opacity-60 uppercase">
                {log.timestamp
                  ?.toDate()
                  .toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) || "AGORA"}
              </span>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-center py-4 font-mono text-[10px] text-on-surface-variant uppercase">
            Sincronização inicial pendente...
          </p>
        )}
      </div>
    </div>
  );
}

function getIcon(sector: string) {
  switch (sector) {
    case "chapa":
      return "fireplace";
    case "porcoes":
      return "inventory_2";
    case "bebidas":
      return "ac_unit";
    default:
      return "fort";
  }
}
