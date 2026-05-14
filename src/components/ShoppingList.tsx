import React, { useState } from "react";
import {
  collection,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Item } from "../types";
import { motion, AnimatePresence } from "motion/react";

export function ShoppingList() {
  const { profile, user } = useAuth();
  const itemsRef = collection(db, "items");
  const valueResult = useCollection(
    query(itemsRef, orderBy("name", "asc")),
  );
  
  const sectorsResult = useCollection(collection(db, "sectors"));
  const sectors = sectorsResult[0]?.docs.map(d => ({id: d.id, ...d.data()})) || [];

  const value = valueResult[0];
  const loading = valueResult[1] || sectorsResult[1];
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const [cart, setCart] = useState<{ id: string; name: string; qty: number; price: number; unit: string }[]>([]);
  const [purchaseModalItem, setPurchaseModalItem] = useState<Item | null>(null);
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const allItems =
    value?.docs.map((d) => ({ id: d.id, ...d.data() }) as Item) || [];
  
  // Filter items: only if sector exists
  const filteredItems = allItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    item.sectorId && sectors.find(s => s.id === item.sectorId)
  );

  const needsPurchase = filteredItems.filter(
    (item) => item.currentStock <= item.minStock,
  );
  
  const activeNeedsPurchase = needsPurchase.filter(item => !cart.some(c => c.id === item.id));

  const stableItems = filteredItems.filter(
    (item) => item.currentStock > item.minStock,
  );

  const totalCartQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);

  const handleConfirmPurchase = () => {
    const qty = parseFloat(purchaseQty);
    const price = parseFloat(purchasePrice);
    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) return;

    if (editingCartIndex !== null) {
      const newCart = [...cart];
      newCart[editingCartIndex] = {
        ...newCart[editingCartIndex],
        qty,
        price
      };
      setCart(newCart);
      setEditingCartIndex(null);
    } else if (purchaseModalItem) {
      setCart([...cart, {
        id: purchaseModalItem.id,
        name: purchaseModalItem.name,
        qty,
        price,
        unit: purchaseModalItem.unit
      }]);
    }
    
    setPurchaseModalItem(null);
    setPurchaseQty("");
    setPurchasePrice("");
  };

  const handleEditCartItem = (index: number) => {
    const item = cart[index];
    setEditingCartIndex(index);
    setPurchaseQty(item.qty.toString());
    setPurchasePrice(item.price.toString());
    // Create a dummy item object for the UI label
    setPurchaseModalItem({ name: item.name, unit: item.unit } as Item);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const generatePDF = async (itemsToReport: any[], startDate: string, endDate: string) => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    try {
      const logoUrl = "https://i.imgur.com/4dwZg3s.png";
      // Adicionando a logo (proporção mantida)
      doc.addImage(logoUrl, 'PNG', 14, 10, 30, 30);
    } catch (e) {
      console.warn("Logo failed to load", e);
    }
    
    doc.setFontSize(26);
    doc.setTextColor(255, 107, 0); // Primary color
    doc.text("MEEPLÁRIO", 115, 25, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Relatório de Confirmação de Compra", 115, 35, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${startDate} até ${endDate}`, 115, 42, { align: "center" });

    // Table
    const tableRows = itemsToReport.map((item, index) => [
      index + 1,
      item.itemName || item.name,
      `${item.amount || item.qty} ${item.unit || ""}`,
      `R$ ${(item.price || 0).toFixed(2)}`,
      `R$ ${((item.amount || item.qty) * (item.price || 0)).toFixed(2)}`
    ]);

    const total = itemsToReport.reduce((acc, item) => acc + ((item.amount || item.qty) * (item.price || 0)), 0);

    autoTable(doc, {
      startY: 50,
      head: [['#', 'Item', 'Quantidade', 'Valor Unit.', 'Total']],
      body: tableRows,
      foot: [['', '', '', 'TOTAL GERAL:', `R$ ${total.toFixed(2)}`]],
      theme: 'striped',
      headStyles: { fillColor: [255, 107, 0], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Footer
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("By Pablo Moreira", 14, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10, { align: "right" });
    }

    doc.save(`relatorio-compras-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleReplenish = async () => {
    if (cart.length === 0) return;
    setIsExporting(true);
    
    try {
      // First, filter history to get exactly what matches the period if needed
      // But user said "relatório exportar conterá com itens baseado no período informado"
      // and "com base nas datas que ele confirmou pedido"
      // If we just replenished, they are for TODAY.
      // I'll filter the history for the PDF after adding them, or just use selected range.
      
      for (const c of cart) {
        const item = allItems.find(i => i.id === c.id);
        if (!item) continue;
        
        const itemRef = doc(db, "items", item.id);
        
        await updateDoc(itemRef, {
          currentStock: item.currentStock + c.qty,
          updatedAt: serverTimestamp(),
          lastUpdatedBy: profile?.name || "Staff",
        });

        await addDoc(collection(db, "history"), {
          itemId: item.id,
          itemName: item.name,
          userName: profile?.name || "Staff",
          userId: user?.uid,
          sectorId: item.sectorId,
          type: "replenish",
          amount: c.qty,
          price: c.price,
          unit: item.unit,
          timestamp: serverTimestamp(),
        });
      }

      // After adding, generate PDF based on the period (filtering history)
      // We'll fetch from database to be accurate for the period
      const historyRef = collection(db, "history");
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      end.setHours(23, 59, 59, 999);

      const qHistory = query(
        historyRef,
        where("type", "==", "replenish"),
        where("timestamp", ">=", start),
        where("timestamp", "<=", end),
        orderBy("timestamp", "desc")
      );
      
      const snap = await getDocs(qHistory);
      const itemsToReport = snap.docs.map(d => d.data());

      if (itemsToReport.length > 0) {
        await generatePDF(itemsToReport, periodStart, periodEnd);
      } else {
        // Fallback to current cart if nothing in history matches (unlikely but safe)
        await generatePDF(cart, periodStart, periodEnd);
      }

      setCart([]);
      setShowPeriodModal(false);
    } catch (error) {
      console.error("Erro ao processar pedido:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20 text-primary-container">
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-primary-container tracking-[0.3em] uppercase">
            Sistema de Estoque
          </span>
          <h2 className="font-display text-2xl md:text-3xl text-on-surface mt-1">
            Painel de Alertas Inteligente
          </h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
          <div className="flex gap-2">
            <div className="glass-panel border border-outline-variant/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">
                warning
              </span>
              <span className="font-mono text-[10px] text-error font-bold uppercase">
                {activeNeedsPurchase.length} CRÍTICO
              </span>
            </div>
            <div className="glass-panel border border-outline-variant/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                priority_high
              </span>
              <span className="font-mono text-[10px] text-primary font-bold uppercase">
                {filteredItems.length} TOTAL
              </span>
            </div>
          </div>
          
          {/* Search Filter */}
          <div className="bg-surface-container-low border border-outline-variant/30 px-3 py-2 rounded-xl flex gap-2 items-center w-full md:w-64">
             <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0 text-[20px]">search</span>
             <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Pesquisar compras..."
               className="flex-1 bg-transparent text-on-surface text-sm focus:outline-none placeholder:text-on-surface-variant/50 w-full"
             />
             {searchTerm && (
               <button onClick={() => setSearchTerm('')} className="text-on-surface-variant flex-shrink-0 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
               </button>
             )}
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <AnimatePresence>
          {activeNeedsPurchase.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
            >
              <ShoppingCard
                item={item}
                onReplenish={() => {
                  setPurchaseModalItem(item);
                  setPurchaseQty((item.idealStock - item.currentStock).toString());
                  setPurchasePrice("");
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {needsPurchase.length === 0 && (
          <div className="py-20 text-center glass-panel border border-outline-variant/20 rounded-xl">
            <span className="material-symbols-outlined text-primary text-6xl mb-4">
              check_circle
            </span>
            <h3 className="font-display text-xl text-on-surface">
              Arsenal Totalmente Abastecido
            </h3>
            <p className="font-sans text-sm text-on-surface-variant">
              Nenhuma aquisição imediata necessária.
            </p>
          </div>
        )}

        {stableItems.length > 0 && (
          <div className="pt-8 opacity-50 grayscale">
            <h3 className="font-mono text-[10px] tracking-widest text-on-surface-variant uppercase mb-4">
              Recursos Estáveis
            </h3>
            <div className="space-y-3">
              {stableItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="glass-panel border border-outline-variant/20 p-4 rounded-xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary opacity-50">
                        inventory
                      </span>
                    </div>
                    <span className="font-sans font-bold text-on-surface opacity-70">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-tertiary">
                    ESTOQUE CHEIO
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="glass-panel border border-primary/20 rounded-xl p-6 relative overflow-hidden mt-12 bg-gradient-to-br from-primary-container/10 to-transparent">
          <h3 className="font-mono text-[10px] text-primary tracking-widest uppercase mb-4">
            Pedido de Compra Pendente
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">
                    Tipos de Item
                  </span>
                  <span className="font-display text-2xl font-bold text-on-surface">
                    {cart.length.toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">
                    Soma de Valores
                  </span>
                  <span className="font-display text-2xl font-bold text-primary-container">
                    R$ {totalCartPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Cart Item Chips */}
              <div className="flex flex-wrap gap-2 max-w-2xl">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="group/chip flex items-center gap-2 bg-surface-container border border-outline-variant/30 pl-3 pr-2 py-1.5 rounded-full text-[10px] font-mono hover:border-primary transition-colors animate-in zoom-in-95">
                    <span className="text-on-surface truncate max-w-[80px]">{item.name}</span>
                    <span className="text-primary-container font-bold">{item.qty}{item.unit}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditCartItem(idx)}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button 
                         onClick={() => handleRemoveFromCart(idx)}
                         className="text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setPeriodStart(today);
                setPeriodEnd(today);
                setShowPeriodModal(true);
              }}
              className="w-full md:w-auto bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
            >
              ENVIAR TUDO AO FORNECEDOR
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      )}

      {/* Period Selection Modal */}
      <AnimatePresence>
        {showPeriodModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isExporting && setShowPeriodModal(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel border border-primary/30 rounded-2xl p-8"
            >
              <h3 className="font-display text-xl text-primary-container mb-2 uppercase tracking-widest">
                Relatório de Compra
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mb-6 uppercase tracking-widest opacity-80">
                Selecione o período para consolidação do PDF
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
                    Início
                  </label>
                  <input 
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl font-display focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
                    Fim
                  </label>
                  <input 
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl font-display focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  disabled={isExporting}
                  onClick={() => setShowPeriodModal(false)}
                  className="flex-1 py-4 border border-outline-variant text-on-surface-variant rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-surface-container transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  disabled={isExporting}
                  onClick={handleReplenish}
                  className="flex-[2] py-4 bg-primary-container text-on-primary-container rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      GERANDO...
                    </>
                  ) : (
                    <>
                      CONFIRMAR E EXPORTAR
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchaseModalItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setPurchaseModalItem(null); setEditingCartIndex(null); }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-panel border border-outline-variant/30 rounded-2xl overflow-hidden p-6"
            >
              <h3 className="font-display text-xl text-primary-container mb-4 uppercase tracking-widest">
                {editingCartIndex !== null ? 'Editar Item' : 'Confirmar Compra'}: {purchaseModalItem.name}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Quantidade ({purchaseModalItem.unit})
                  </label>
                  <input 
                    type="number"
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-lg font-display focus:border-primary-container outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Valor Unitário (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface px-4 py-3 rounded-lg font-display focus:border-primary-container outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setPurchaseModalItem(null); setEditingCartIndex(null); }}
                  className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded-xl uppercase tracking-widest text-xs hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-[2] py-3 bg-primary-container text-on-primary-container rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  {editingCartIndex !== null ? 'Salvar Edição' : 'Adicionar Pedido'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShoppingCard({
  item,
  onReplenish,
}: {
  item: Item;
  onReplenish: () => void;
  key?: React.Key;
}) {
  const amountMissing = item.idealStock - item.currentStock;

  return (
    <div className="group relative glass-panel border border-error/40 p-5 rounded-xl transition-all hover:border-error shadow-[0_0_15px_rgba(147,0,10,0.05)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 lg:w-1/3">
          <div className="w-16 h-16 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-3xl opacity-60 text-primary">
              {item.name.toLowerCase().includes("batata")
                ? "fries"
                : item.name.toLowerCase().includes("onions")
                  ? "lens"
                  : item.name.toLowerCase().includes("nuggets")
                    ? "dinner_dining"
                    : item.name.toLowerCase().includes("gelo")
                      ? "ac_unit"
                      : item.name.toLowerCase().includes("cola")
                        ? "local_drink"
                        : "inventory"}
            </span>
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-on-surface">
              {item.name}
            </h3>
            <span className="font-mono text-[9px] text-error flex items-center gap-1 uppercase tracking-widest font-bold">
              <span className="material-symbols-outlined text-[14px]">
                priority_high
              </span>{" "}
              COMPRA URGENTE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">
              Atual
            </span>
            <span className="font-sans font-bold text-on-surface">
              {item.currentStock}{" "}
              <small className="text-[10px] opacity-60">{item.unit}</small>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">
              Est. Mínimo
            </span>
            <span className="font-sans font-bold text-tertiary">
              {item.minStock}{" "}
              <small className="text-[10px] opacity-60">{item.unit}</small>
            </span>
          </div>
          <div className="flex flex-col border-l border-outline-variant/20 pl-4 col-span-2 lg:col-span-1">
            <span className="font-mono text-[9px] text-primary-container uppercase tracking-widest">
              Necessário
            </span>
            <span className="font-sans font-bold text-primary-container">
              Faltam {amountMissing} {item.unit}s
            </span>
          </div>
        </div>

        <button
          onClick={onReplenish}
          className="bg-error text-on-error px-6 py-3 rounded-lg font-mono text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
        >
          CONFIRMAR PEDIDO
          <span className="material-symbols-outlined text-[18px]">
            shopping_cart_checkout
          </span>
        </button>
      </div>
    </div>
  );
}
