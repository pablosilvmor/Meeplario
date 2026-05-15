import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sector, CustomSector } from "../types";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { db } from "../lib/firebase";

interface SectorDashboardProps {
  onSectorSelect: (sector: Sector) => void;
  allowedSectors: Sector[];
  onDataManagement?: () => void;
}

export function SectorDashboard({
  onSectorSelect,
  allowedSectors,
  onDataManagement,
}: SectorDashboardProps) {
  const isAllowed = (sector: Sector) => allowedSectors.includes("geral") || allowedSectors.includes(sector);

  const [sectorsSnapshot] = useCollection(collection(db, "sectors"));
  const [itemsSnapshot] = useCollection(collection(db, "items"));
  const customSectors = sectorsSnapshot?.docs.map(d => ({ id: d.id, ...d.data() } as CustomSector)) || [];
  
  const totalItems = itemsSnapshot?.size || 0;
  const criticalItems = itemsSnapshot?.docs.filter(d => (d.data().currentStock || 0) <= (d.data().minStock || 0)).length || 0;

  const [searchTerm, setSearchTerm] = useState("");

  const allSectorsList = [
    {
      id: "compras",
      name: "COMPRAS",
      description: "Lista de aquisições pendentes",
      icon: "priority_high",
      status: "ATENÇÃO",
      cap: "LISTA VIVA",
      critical: true,
      urgent: true,
      isLocked: !isAllowed("compras")
    },
    ...customSectors.map((s) => {
      const sectorItemsCount = itemsSnapshot?.docs.filter(d => d.data().sectorId === s.id).length || 0;
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon || "inventory",
        status: "NORMAL",
        cap: `${sectorItemsCount} ITENS`,
        critical: false,
        urgent: false,
        isLocked: !isAllowed(s.id)
      };
    })
  ];

  const filteredSectors = allSectorsList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <p className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] mb-1">
          CENTRO DE COMANDO
        </p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-display text-2xl md:text-3xl text-on-surface">
            Setores da Cozinha
          </h2>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Filter */}
            <div className="bg-surface-container-low border border-outline-variant/30 px-3 py-2 rounded-xl flex gap-2 items-center flex-1 md:w-64">
               <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0 text-[20px]">search</span>
               <input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Pesquisar setores..."
                 className="flex-1 bg-transparent text-on-surface text-sm focus:outline-none placeholder:text-on-surface-variant/50 w-full"
               />
               {searchTerm && (
                 <button onClick={() => setSearchTerm('')} className="text-on-surface-variant flex-shrink-0 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                 </button>
               )}
            </div>

            <button
               onClick={async () => {
                 const { jsPDF } = await import("jspdf");
                 const autoTable = (await import("jspdf-autotable")).default;
                 const doc = new jsPDF();
                 const pageWidth = doc.internal.pageSize.width;

                 try {
                   const logoUrl = "https://i.imgur.com/4dwZg3s.png";
                   doc.addImage(logoUrl, 'PNG', 14, 10, 30, 30);
                 } catch (e) {
                   console.warn("Logo failed to load", e);
                 }

                 doc.setFont("helvetica", "bold");
                 doc.setFontSize(22);
                 doc.setTextColor(255, 107, 0); // Primary color
                 doc.text("MEEPLÁRIO", 50, 22);

                 doc.setFontSize(14);
                 doc.setTextColor(100, 100, 100);
                 doc.text("Relatório Geral de Estoque", 50, 30);

                 doc.setFontSize(10);
                 doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, 36);

                 const itemsList = itemsSnapshot?.docs.map(d => {
                   const data = d.data();
                   return {
                     ...data,
                     id: d.id,
                     sectorName: allSectorsList.find(s => s.id === data.sectorId)?.name || data.sectorId
                   };
                 }) || [];
                 
                 // Sort alphabetically by name
                 itemsList.sort((a, b) => a.name.localeCompare(b.name));

                 // Group by sector
                 const groupedItems: Record<string, any[]> = {};
                 itemsList.forEach(item => {
                   if (!groupedItems[item.sectorName]) {
                     groupedItems[item.sectorName] = [];
                   }
                   groupedItems[item.sectorName].push(item);
                 });

                 // Sort sectors alphabetically
                 const sortedSectors = Object.keys(groupedItems).sort((a, b) => a.localeCompare(b));

                 let finalBody: any[] = [];
                 sortedSectors.forEach(sector => {
                   finalBody.push([{ content: sector.toUpperCase(), colSpan: 3, styles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' } }]);
                   groupedItems[sector].forEach(item => {
                     finalBody.push([
                       item.name,
                       `${item.currentStock} ${item.unit}`,
                       item.currentStock <= item.minStock ? "CRÍTICO" : "NORMAL"
                     ]);
                   });
                 });

                 autoTable(doc, {
                   startY: 45,
                   head: [['ITEM', 'ESTOQUE', 'STATUS']],
                   body: finalBody,
                   theme: 'grid',
                   headStyles: {
                     fillColor: [255, 107, 0],
                     textColor: 255,
                     fontStyle: 'bold'
                   },
                   styles: {
                     font: 'helvetica',
                     fontSize: 10,
                     cellPadding: 5,
                   },
                   willDrawCell: function(data: any) {
                     // Cor para status CRÍTICO
                     if (data.row.section === 'body' && data.column.index === 2) {
                       if (data.cell.raw === 'CRÍTICO') {
                         doc.setTextColor(220, 38, 38);
                         doc.setFont("helvetica", "bold");
                       } else if (data.cell.raw === 'NORMAL') {
                         doc.setTextColor(100, 100, 100);
                         doc.setFont("helvetica", "normal");
                       }
                     }
                   }
                 });

                 doc.save(`estoque_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
               }}
               className="bg-surface-container-high border border-outline-variant/30 px-4 py-2 rounded-xl flex items-center justify-center text-primary hover:bg-surface-container-highest transition-colors flex-shrink-0"
               title="Exportar em PDF"
            >
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            </button>
          </div>
        </div>
      </header>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredSectors.map((s) => (
             <SectorCard
               key={s.id}
               id={s.id.toUpperCase()}
               name={s.name}
               description={s.description}
               icon={s.icon}
               status={s.status}
               cap={s.cap}
               critical={s.critical}
               urgent={s.urgent}
               isLocked={s.isLocked}
               onClick={() => !s.isLocked && onSectorSelect(s.id as any)}
             />
          ))}
          {onDataManagement && !searchTerm && (
            <motion.button 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onDataManagement} 
              className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-all group min-h-[140px]"
            >
              <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">
                add_circle
              </span>
              <span className="font-mono text-[10px] tracking-widest uppercase">
                ADICIONAR SETOR
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <section className="mt-12 p-6 bg-surface-container-low border border-outline-variant/30 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatItem label="Total de Itens" value={String(totalItems)} color="text-primary" />
        <StatItem label="Alertas Críticos" value={String(criticalItems)} color="text-error" />
        <StatItem label="Carga do Sistema" value="LIVE" color="text-tertiary" />
        <StatItem
          label="Operadores"
          value="ATIVO"
          color="text-on-primary-fixed"
        />
      </section>
    </div>
  );
}

function SectorCard({
  id,
  name,
  description,
  icon,
  status,
  cap,
  critical = false,
  urgent = false,
  onClick,
  isLocked = false,
}: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={isLocked ? {} : { y: -4 }}
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer bg-surface-container-high border rounded-xl p-5 flex flex-col gap-4 group transition-[border-color,background-color] duration-300 ${
        isLocked
          ? "grayscale opacity-40 cursor-not-allowed"
          : urgent
            ? "border-error critical-glow"
            : critical
              ? "border-primary-container neon-border"
              : "border-outline-variant/30 hover:border-primary-container"
      }`}
    >
      <div className="flex justify-between items-start z-10">
        <div
          className={`p-3 rounded-lg border transition-colors overflow-hidden ${
            isLocked
              ? "bg-surface-container-highest border-outline-variant/30 text-on-surface-variant"
              : urgent
                ? "bg-error-container/20 border-error/50 text-error"
                : critical
                  ? "bg-surface-container-highest border-primary-container/30 text-primary-container"
                  : "bg-surface-container-highest border-outline-variant/30 text-primary group-hover:text-primary-container"
          }`}
        >
          <span className="material-symbols-outlined text-3xl">
            {isLocked ? "lock" : icon}
          </span>
        </div>
        <span className="font-mono text-[10px] bg-surface-container-lowest px-2 py-1 rounded text-on-surface-variant border border-outline-variant/20 tracking-wider">
          {cap}
        </span>
      </div>

      <div className="z-10">
        <h3 className="font-sans font-bold text-lg text-on-surface uppercase tracking-tight">
          {name}{" "}
          {isLocked && (
            <span className="material-symbols-outlined text-xs align-middle">
              lock
            </span>
          )}
        </h3>
        <p className="font-sans text-xs text-on-surface-variant">
          {isLocked ? "Acesso restrito" : description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2 z-10">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              urgent
                ? "bg-error animate-pulse"
                : critical
                  ? "bg-primary-container animate-pulse"
                  : "bg-primary-container"
            }`}
          />
          <span
            className={`font-mono text-[10px] tracking-wider ${
              urgent
                ? "text-error"
                : critical
                  ? "text-primary-container"
                  : "text-primary-fixed-dim"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Decorative Icons In Background removed as per user report of overlapping text */}
    </motion.div>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center group">
      <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-[0.2em] mb-1 group-hover:text-primary transition-colors">
        {label}
      </p>
      <p className={`font-sans font-bold text-lg ${color}`}>{value}</p>
    </div>
  );
}
