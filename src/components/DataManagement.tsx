import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../lib/firebase";
import { CustomSector, Item } from "../types";

import { getSmartIcon, availableIcons } from "../lib/icons";

const IconPicker = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = availableIcons.filter(icon => icon.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="relative w-full z-10">
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">{value || 'category'}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="bg-surface border border-outline-variant text-on-surface px-3 py-1 text-sm rounded w-full flex items-center justify-between hover:bg-surface-container-high transition-colors"
          >
            <span className="truncate">{value || "Selecionar Ícone..."}</span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant flex-shrink-0">search</span>
          </button>
        </div>
      </div>
      
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant shadow-2xl z-10 w-full max-w-lg flex flex-col max-h-[80vh] animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-display text-xl text-on-surface">Selecionar Ícone</h3>
               <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             <input 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Pesquisar ícones..."
               className="bg-surface border border-outline-variant text-on-surface px-4 py-3 rounded-lg w-full mb-4 focus:outline-primary"
               autoFocus
             />
             <div className="overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-2 styled-scrollbar pr-2 flex-1 min-h-0 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
               {filteredIcons.map(icon => (
                 <button
                   key={icon}
                   onClick={(e) => { e.preventDefault(); onChange(icon); setOpen(false); setSearch(""); }}
                   className={`flex items-center justify-center aspect-square p-0 rounded-lg transition-all border relative overflow-hidden group/icon ${value === icon ? 'bg-primary-container text-on-primary-container border-primary shadow-lg scale-105 z-10' : 'border-transparent text-on-surface hover:border-outline-variant hover:bg-surface-container-high'}`}
                   title={icon}
                 >
                   <span className="material-symbols-outlined select-none text-[24px] leading-none pointer-events-none">
                     {icon}
                   </span>
                 </button>
               ))}
               {filteredIcons.length === 0 && (
                 <div className="col-span-full py-8 text-center text-on-surface-variant text-sm">
                   Nenhum ícone encontrado.
                 </div>
               )}
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export function DataManagement() {
  const [sectorsSnapshot] = useCollection(collection(db, "sectors"));
  const [itemsSnapshot] = useCollection(collection(db, "items"));

  const sectors =
    sectorsSnapshot?.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as CustomSector,
    ) || [];
  const items =
    itemsSnapshot?.docs.map((d) => ({ id: d.id, ...d.data() }) as Item) || [];

  const [newSectorName, setNewSectorName] = useState("");
  const [newSectorDesc, setNewSectorDesc] = useState("");

  const [newItemName, setNewItemName] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  
  const [bulkItems, setBulkItems] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [editSectorName, setEditSectorName] = useState("");
  const [editSectorDesc, setEditSectorDesc] = useState("");
  const [editSectorIcon, setEditSectorIcon] = useState("");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemIcon, setEditItemIcon] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Undo state
  const [deletedRecord, setDeletedRecord] = useState<{ id: string, type: 'sector' | 'item', data: any } | null>(null);

  useEffect(() => {
    let timer: any;
    if (deletedRecord) {
      timer = setTimeout(() => {
        setDeletedRecord(null);
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [deletedRecord]);

  const handleAddSector = async () => {
    if (!newSectorName.trim()) return;
    if (sectors.find((s) => s.name.toLowerCase() === newSectorName.toLowerCase())) {
      setErrorMsg(`Erro: Já existe um setor com o nome "${newSectorName}". duplicate não permitido.`);
      return;
    }
    try {
      await addDoc(collection(db, "sectors"), {
        name: newSectorName,
        description: newSectorDesc,
        icon: getSmartIcon(newSectorName),
        createdAt: serverTimestamp(),
      });
      setNewSectorName("");
      setNewSectorDesc("");
      setErrorMsg("");
      setSuccessMsg("Setor criado. Vá em 'Acesso' para conceder permissão aos usuários.");
    } catch (e) {
      console.error(e);
    }
  };

  const [isSavingSector, setIsSavingSector] = useState(false);
  const handleSaveSector = async (id: string) => {
    if (!editSectorName.trim()) return;
     if (sectors.find((s) => s.name.toLowerCase() === editSectorName.toLowerCase() && s.id !== id)) {
      setErrorMsg(`Erro: Já existe um setor com o nome "${editSectorName}". Não é permitida duplicidade.`);
      return;
    }
    setIsSavingSector(true);
    try {
      await updateDoc(doc(db, "sectors", id), {
        name: editSectorName,
        description: editSectorDesc,
        icon: editSectorIcon.trim() || getSmartIcon(editSectorName)
      });
      setEditingSectorId(null);
      setErrorMsg("");
      setSuccessMsg("Setor atualizado com sucesso.");
    } catch (e) {
      console.error(e);
      setErrorMsg("Erro ao salvar setor.");
    } finally {
      setIsSavingSector(false);
    }
  };

  const [isDeletingSector, setIsDeletingSector] = useState<string | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<string | null>(null);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  const handleDeleteSector = async (id: string) => {
    setIsDeletingSector(id);
    try {
      const { writeBatch, collection, query, where, getDocs } = await import("firebase/firestore");
      
      const itemsQuery = query(collection(db, "items"), where("sectorId", "==", id));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const batch = writeBatch(db);
      
      itemsSnapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
      batch.delete(doc(db, "sectors", id));
      
      await batch.commit();

      setErrorMsg("");
      setSuccessMsg(`Setor e ${itemsSnapshot.size} item(ns) removidos com sucesso.`);
    } catch (e) {
      console.error(e);
      setErrorMsg("Erro ao excluir setor e itens.");
    } finally {
      setIsDeletingSector(null);
      setSectorToDelete(null);
    }
  };

  const handleCleanupItems = async () => {
    try {
      const { writeBatch, collection, getDocs, doc } = await import("firebase/firestore");
      const itemsSnapshot = await getDocs(collection(db, "items"));
      
      const itemsToDelete = itemsSnapshot.docs.filter(docSnap => {
        const item = docSnap.data() as Item;
        // Item is orphan if sectorId is missing or sectorId does not exist in sectors
        return !item.sectorId || !sectors.find(s => s.id === item.sectorId);
      });
      
      if (itemsToDelete.length === 0) {
        setSuccessMsg("Nenhum item órfão encontrado.");
        setShowCleanupConfirm(false);
        return;
      }
      
      // Batch size limit is 500
      for (let i = 0; i < itemsToDelete.length; i += 500) {
        const batch = writeBatch(db);
        const chunk = itemsToDelete.slice(i, i + 500);
        chunk.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }
      
      setSuccessMsg(`${itemsToDelete.length} itens órfãos removidos.`);
      setShowCleanupConfirm(false);
    } catch (e) {
      console.error("Erro ao limpar itens:", e);
      setErrorMsg("Erro ao limpar itens. Verifique o console.");
      setShowCleanupConfirm(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim() || !selectedSector) {
      setErrorMsg("Selecione um setor e preencha a descrição do item.");
      return;
    }
    if (items.find((i) => i.name.toLowerCase() === newItemName.toLowerCase() && i.sectorId === selectedSector)) {
      setErrorMsg(`Erro: Já existe um item com a descrição "${newItemName}" neste setor.`);
      return;
    }

    try {
      await addDoc(collection(db, "items"), {
        name: newItemName,
        sectorId: selectedSector,
        currentStock: 0,
        minStock: 5,
        idealStock: 20,
        unit: "un",
        icon: getSmartIcon(newItemName),
        updatedAt: serverTimestamp(),
        lastUpdatedBy: "Admin",
      });
      setNewItemName("");
      setErrorMsg("");
      setSuccessMsg("Item cadastrado com sucesso.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkAddItems = async () => {
    if (!bulkItems.trim() || !selectedSector) {
      setErrorMsg("Selecione um setor e preencha a lista de itens.");
      return;
    }
    const lines = bulkItems.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return;

    let addedCount = 0;
    let duplicateCount = 0;

    for (const line of lines) {
       if (items.find((i) => i.name.toLowerCase() === line.toLowerCase() && i.sectorId === selectedSector)) {
          duplicateCount++;
          continue;
       }
       try {
        await addDoc(collection(db, "items"), {
          name: line,
          sectorId: selectedSector,
          currentStock: 0,
          minStock: 5,
          idealStock: 20,
          unit: "un",
          icon: getSmartIcon(line),
          updatedAt: serverTimestamp(),
          lastUpdatedBy: "Admin",
        });
        addedCount++;
       } catch (e) {
         console.error(e);
       }
    }
    
    setBulkItems("");
    setErrorMsg("");
    setSuccessMsg(`${addedCount} itens adicionados. ${duplicateCount > 0 ? `(${duplicateCount} ignorados por duplicidade)` : ''}`);
  };

  const [isSavingItem, setIsSavingItem] = useState(false);
  const handleSaveItem = async (id: string, sectorId: string) => {
    if (!editItemName.trim()) return;
    const item = items.find(i => i.id === id);
    if (items.find((i) => i.name.toLowerCase() === editItemName.toLowerCase() && i.sectorId === sectorId && i.id !== id)) {
      setErrorMsg(`Erro: Já existe um item com a descrição "${editItemName}" neste setor.`);
      return;
    }
    setIsSavingItem(true);
    try {
      await updateDoc(doc(db, "items", id), { 
        name: editItemName,
        icon: editItemIcon.trim() || getSmartIcon(editItemName)
      });
      setEditingItemId(null);
      setErrorMsg("");
      setSuccessMsg("Item atualizado com sucesso.");
    } catch (e) {
      console.error(e);
      setErrorMsg("Erro ao salvar item.");
    } finally {
      setIsSavingItem(false);
    }
  };

  const [isDeletingItem, setIsDeletingItem] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const handleDeleteItem = async (id: string) => {
    const itemToDel = items.find(i => i.id === id);
    
    setIsDeletingItem(id);
    try {
      if (itemToDel) {
         setDeletedRecord({ id, type: 'item', data: itemToDel });
      }
      await deleteDoc(doc(db, "items", id));
      setSuccessMsg("Item removido.");
    } catch (e) {
      console.error(e);
      setErrorMsg("Erro ao excluir item.");
    } finally {
      setIsDeletingItem(null);
      setItemToDelete(null);
    }
  };

  const handleUndo = async () => {
    if (!deletedRecord) return;
    try {
      const { id, type, data } = deletedRecord;
      if (type === 'sector') {
         await setDoc(doc(db, "sectors", id), data);
      } else {
         await setDoc(doc(db, "items", id), data);
      }
      setDeletedRecord(null);
      setSuccessMsg("Ação desfeita com sucesso.");
    } catch (e) {
      console.error(e);
    }
  };

  // Clear messages after a while
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(""), 6000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    item.sectorId && sectors.find(s => s.id === item.sectorId)
  ).sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative">
     {showCleanupConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-background/90" onClick={() => setShowCleanupConfirm(false)} />
           <div className="bg-surface-container p-6 rounded-xl border border-outline-variant shadow-lg z-10 w-full max-w-sm">
             <h3 className="text-on-surface font-bold mb-4">Confirmar Limpeza</h3>
             <p className="text-on-surface-variant text-sm mb-6">Tem certeza que deseja apagar todos os itens que não pertencem a um setor existente?</p>
             <div className="flex gap-3">
               <button onClick={() => setShowCleanupConfirm(false)} className="flex-1 py-2 text-on-surface hover:bg-surface-container-high rounded-lg font-mono text-xs uppercase">Cancelar</button>
               <button onClick={handleCleanupItems} className="flex-1 py-2 bg-error text-white rounded-lg font-mono text-xs uppercase font-bold">Limpar</button>
             </div>
           </div>
        </div>
     )}
     <header>
        <span className="font-mono text-[10px] text-primary-container tracking-[0.3em] uppercase">
          Gestão Modular
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-on-surface mt-1">
          Sistemas e Itens
        </h2>
      </header>

      {errorMsg && (
        <div className="bg-error/20 border border-error text-error p-4 rounded-xl font-mono text-xs shadow-lg transition-all">
          {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="bg-[#4caf50]/20 border border-[#4caf50] text-[#4caf50] p-4 rounded-xl font-mono text-xs shadow-lg transition-all">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sector Manager */}
        <div className="glass-panel border border-outline-variant/30 p-6 rounded-xl space-y-4">
          <h3 className="font-sans font-bold text-lg text-primary">
            Criar Setor
          </h3>
          <button
            onClick={() => setShowCleanupConfirm(true)}
            className="w-full bg-error/10 text-error border border-error/50 font-bold py-2 rounded-lg font-mono text-xs uppercase hover:bg-error hover:text-white transition-all mb-4"
          >
            Limpar Itens Órfãos
          </button>
          <div className="flex flex-col gap-3">
            <input
              value={newSectorName}
              onChange={(e) => setNewSectorName(e.target.value)}
              placeholder="Nome do Setor"
              className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2 font-sans text-sm focus:outline-none focus:border-primary-container"
            />
            <input
              value={newSectorDesc}
              onChange={(e) => setNewSectorDesc(e.target.value)}
              placeholder="Descrição"
              className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2 font-sans text-sm focus:outline-none focus:border-primary-container"
            />
            <button
              onClick={handleAddSector}
              className="bg-primary-container text-on-primary-container font-bold py-2 rounded-lg font-mono text-xs uppercase hover:brightness-110"
            >
              Adicionar Setor
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-3">
              Setores Ativos
            </h4>
            {sectors.map((s) => (
              <div
                key={s.id}
                className="flex flex-col p-3 border border-outline-variant/20 rounded-lg bg-surface-container"
              >
                {editingSectorId === s.id ? (
                  <div className="flex flex-col gap-2 w-full">
                    <input 
                      value={editSectorName} 
                      onChange={e => setEditSectorName(e.target.value)} 
                      placeholder="Nome do Setor"
                      className="bg-surface border text-on-surface px-2 py-1 text-sm rounded w-full"
                    />
                    <input 
                      value={editSectorDesc} 
                      onChange={e => setEditSectorDesc(e.target.value)} 
                      placeholder="Descrição"
                      className="bg-surface border text-on-surface px-2 py-1 text-sm rounded w-full"
                    />
                    <IconPicker value={editSectorIcon} onChange={setEditSectorIcon} />
                    <div className="flex justify-end gap-3 mt-3 border-t border-outline-variant/10 pt-3">
                      <button 
                        disabled={isSavingSector}
                        onClick={() => setEditingSectorId(null)} 
                        className="text-on-surface-variant text-[10px] font-mono uppercase tracking-widest hover:bg-surface-container-high px-3 py-1 rounded transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        disabled={isSavingSector}
                        onClick={() => handleSaveSector(s.id)} 
                        className="bg-primary-container text-on-primary-container text-[10px] font-bold font-mono uppercase tracking-widest px-4 py-1.5 rounded shadow-sm hover:brightness-110 active:scale-95 transition-all"
                      >
                        {isSavingSector ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-on-surface font-sans">
                        {s.name}
                      </p>
                      <p className="font-mono text-[10px] text-on-surface-variant">
                        {s.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-primary-container border border-outline-variant/20 overflow-hidden">
                        <span className="material-symbols-outlined text-[18px]">
                          {(s.icon && availableIcons.includes(s.icon)) ? s.icon : 'category'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSectorId(s.id);
                            setEditSectorName(s.name);
                            setEditSectorDesc(s.description);
                            setEditSectorIcon(s.icon || "");
                          }}
                          className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                          title="Editar Setor"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          disabled={isDeletingSector === s.id}
                          onClick={() => {
                            if (sectorToDelete === s.id) {
                              handleDeleteSector(s.id);
                            } else {
                              setSectorToDelete(s.id);
                              setTimeout(() => setSectorToDelete(null), 3000);
                            }
                          }}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all border border-transparent ${sectorToDelete === s.id ? 'bg-error text-white' : 'text-error hover:bg-error/10'}`}
                          title={sectorToDelete === s.id ? "Clique novamente para confirmar" : "Excluir Setor"}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {isDeletingSector === s.id ? "sync" : sectorToDelete === s.id ? "warning" : "delete"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Item Manager */}
        <div className="glass-panel border border-outline-variant/30 p-6 rounded-xl space-y-4">
          <h3 className="font-sans font-bold text-lg text-primary">
            Cadastrar Itens
          </h3>
          <div className="flex flex-col gap-3">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2 font-sans text-sm inline-block"
            >
              <option value="">Selecione um Setor...</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Single Add */}
            <div className="border border-outline-variant/20 p-3 rounded-lg bg-surface/30">
               <h4 className="font-mono text-[10px] text-on-surface-variant uppercase mb-2">Adição Unitária</h4>
               <input
                 value={newItemName}
                 onChange={(e) => setNewItemName(e.target.value)}
                 placeholder="Descrição do Item"
                 className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2 font-sans text-sm focus:outline-none focus:border-primary-container w-full mb-2"
               />
               <button
                 onClick={handleAddItem}
                 className="w-full bg-primary-container/20 text-primary-container border border-primary-container/30 font-bold py-2 rounded-lg font-mono text-xs uppercase hover:bg-primary-container hover:text-on-primary-container transition-all"
               >
                 Adicionar Item Único
               </button>
            </div>

            {/* Bulk Add */}
            <div className="border border-outline-variant/20 p-3 rounded-lg bg-surface/30">
               <h4 className="font-mono text-[10px] text-on-surface-variant uppercase mb-2">Adição em Massa</h4>
               <textarea
                 value={bulkItems}
                 onChange={(e) => setBulkItems(e.target.value)}
                 placeholder="Itens (um por linha)..."
                 rows={4}
                 className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2 font-sans text-sm focus:outline-none focus:border-primary-container w-full mb-2 resize-none"
               />
               <button
                 onClick={handleBulkAddItems}
                 className="w-full bg-secondary-container/20 text-secondary-container border border-secondary-container/30 font-bold py-2 rounded-lg font-mono text-xs uppercase hover:bg-secondary-container hover:text-on-secondary-container transition-all"
               >
                 Processar Adição em Massa
               </button>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex flex-col gap-2 mb-3">
              <h4 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                Estoque Geral
              </h4>
              <div className="flex items-center bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-1">
                 <span className="material-symbols-outlined text-[16px] text-on-surface-variant">search</span>
                 <input 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Filtrar itens..."
                   className="bg-transparent text-on-surface text-sm px-2 py-1 focus:outline-none w-full"
                 />
                 {searchTerm && (
                   <button onClick={() => setSearchTerm('')} className="text-on-surface-variant hover:text-primary">
                     <span className="material-symbols-outlined text-[16px]">close</span>
                   </button>
                 )}
              </div>
            </div>
            
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                  key={item.id}
                  className="flex flex-col p-3 border border-outline-variant/20 rounded-lg bg-surface-container mb-2"
                >
                {editingItemId === item.id ? (
                   <div className="flex flex-col gap-2">
                     <input 
                        value={editItemName} 
                        onChange={e => setEditItemName(e.target.value)} 
                        placeholder="Nome do Item"
                        className="bg-surface border text-on-surface px-2 py-1 text-sm rounded w-full"
                     />
                     <IconPicker value={editItemIcon} onChange={setEditItemIcon} />
                     <div className="flex justify-end gap-3 mt-3 border-t border-outline-variant/10 pt-3">
                        <button 
                          disabled={isSavingItem}
                          onClick={() => setEditingItemId(null)} 
                          className="text-on-surface-variant text-[10px] font-mono uppercase tracking-widest hover:bg-surface-container-high px-3 py-1 rounded transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          disabled={isSavingItem}
                          onClick={() => handleSaveItem(item.id, item.sectorId)} 
                          className="bg-primary-container text-on-primary-container text-[10px] font-bold font-mono uppercase tracking-widest px-4 py-1.5 rounded shadow-sm hover:brightness-110 active:scale-95 transition-all"
                        >
                          {isSavingItem ? "SALVANDO..." : "SALVAR"}
                        </button>
                     </div>
                   </div>
                ) : (
                   <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 truncate flex-1 relative z-10">
                      <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant border border-outline-variant/20 flex-shrink-0 overflow-hidden">
                        <span className="material-symbols-outlined text-[16px]">
                          {(item.icon && availableIcons.includes(item.icon)) ? item.icon : 'inventory_2'}
                        </span>
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-on-surface font-sans text-sm truncate pr-2">
                          {item.name}
                        </p>
                        <p className="font-mono text-[10px] text-on-surface-variant">
                          SETOR:{" "}
                          {sectors.find((s) => s.id === item.sectorId)?.name ||
                            item.sectorId.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItemId(item.id);
                          setEditItemName(item.name);
                          setEditItemIcon(item.icon || "");
                        }}
                        className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                        title="Editar Item"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        disabled={isDeletingItem === item.id}
                        onClick={() => {
                          if (itemToDelete === item.id) {
                            handleDeleteItem(item.id);
                          } else {
                            setItemToDelete(item.id);
                            setTimeout(() => setItemToDelete(null), 3000);
                          }
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all border border-transparent ${itemToDelete === item.id ? 'bg-error text-white' : 'text-error hover:bg-error/10'}`}
                        title={itemToDelete === item.id ? "Clique novamente para confirmar" : "Excluir Item"}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isDeletingItem === item.id ? "sync" : itemToDelete === item.id ? "warning" : "delete"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Toast Undo (Desfazer) */}
      {deletedRecord && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface-container-high border border-outline-variant text-on-surface px-6 py-3 rounded-full shadow-2xl flex items-center justify-between gap-6 z-50 animate-in slide-in-from-bottom-6">
          <span className="text-sm font-sans">
            {deletedRecord.type === 'sector' ? 'Setor apagado' : 'Item apagado'}
          </span>
          <button 
            onClick={handleUndo}
            className="text-primary uppercase font-bold font-mono text-xs tracking-wider hover:brightness-125"
          >
            Desfazer
          </button>
        </div>
      )}

    </div>
  );
}
