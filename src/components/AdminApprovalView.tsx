import React from "react";
import { collection, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../lib/firebase";
import { UserProfile, Sector } from "../types";
import { motion } from "motion/react";

export function AdminApprovalView() {
  const usersRef = collection(db, "users");
  const [value, loading] = useCollection(query(usersRef, orderBy("name", "asc")));
  const [sectorsSnapshot] = useCollection(collection(db, "sectors"));

  const customSectors = sectorsSnapshot?.docs.map(d => ({id: d.id, name: (d.data() as any).name})) || [];
  const baseSectors = [
    {id: "chapa", name: "Chapa"},
    {id: "porcoes", name: "Porções"},
    {id: "bebidas", name: "Bebidas"},
    {id: "compras", name: "Compras"}
  ];
  // we combine them and keep unique ones in case some base ones got overwritten
  const allSectors = [...baseSectors, ...customSectors].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

  const users = value?.docs.map((d) => ({ ...d.data() }) as UserProfile) || [];
  const pendingUsers = users.filter((u) => !u.approved);
  const approvedUsers = users.filter((u) => u.approved);

  const handleApprove = async (user: UserProfile) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      approved: true,
      allowedSectors: ["geral", "chapa", "porcoes", "bebidas", "compras"], // Default all for now
    });
  };

  const handleToggleSector = async (user: UserProfile, sector: Sector) => {
    const userRef = doc(db, "users", user.uid);
    const newSectors = user.allowedSectors.includes(sector)
      ? user.allowedSectors.filter((s) => s !== sector)
      : [...user.allowedSectors, sector];

    await updateDoc(userRef, {
      allowedSectors: newSectors,
    });
  };

  const handleToggleAdmin = async (user: UserProfile) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      role: user.role === "admin" ? "chef" : "admin",
    });
  };

  if (loading)
    return <div className="p-20 text-center">Carregando usuários...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header>
        <span className="font-mono text-[10px] text-primary-container tracking-[0.3em] uppercase">
          Controle de Acesso
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-on-surface mt-1">
          Gestão de Operadores
        </h2>
      </header>

      {pendingUsers.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-mono text-[10px] text-error tracking-widest uppercase">
            Aguardando Aprovação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((u) => (
              <UserCard
                key={u.uid}
                user={u}
                sectorsList={allSectors}
                onApprove={() => handleApprove(u)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="font-mono text-[10px] text-primary tracking-widest uppercase">
          Operadores Ativos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedUsers.map((u) => (
            <UserCard
              key={u.uid}
              user={u}
              sectorsList={allSectors}
              onToggleSector={(s) => handleToggleSector(u, s as Sector)}
              onToggleAdmin={() => handleToggleAdmin(u)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function UserCard({
  user,
  sectorsList,
  onApprove,
  onToggleSector,
  onToggleAdmin,
}: {
  user: UserProfile;
  sectorsList: {id: string, name: string}[];
  onApprove?: () => void;
  onToggleSector?: (s: string) => void;
  onToggleAdmin?: () => void;
  key?: React.Key;
}) {
  return (
    <div className="glass-panel border border-outline-variant/30 p-5 rounded-xl space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
              alt="avatar"
              loading="lazy"
            />
          </div>
          <div>
            <h4 className="font-sans font-bold text-on-surface">{user.name}</h4>
            <p className="font-mono text-[9px] text-on-surface-variant uppercase">
              {user.email}
            </p>
          </div>
        </div>
        {onApprove ? (
          <button
            onClick={onApprove}
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase"
          >
            Aprovar
          </button>
        ) : (
          <div className="flex gap-2">
            <span
              className={`font-mono text-[9px] px-2 py-1 rounded bg-surface-container-highest ${user.role === "admin" ? "text-primary" : "text-on-surface-variant"}`}
            >
              {user.role.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {!onApprove && onToggleSector && (
        <div className="pt-2 border-t border-outline-variant/20">
          <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mb-3">
            Permissões de Telas
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
             <button
               onClick={() => onToggleSector("geral")}
               className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all border ${
                 user.allowedSectors?.includes("geral")
                   ? "bg-primary-container/20 border-primary-container text-primary-container"
                   : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant opacity-50"
               }`}
             >
               TELAS (TODAS)
             </button>
             <button
               onClick={() => onToggleSector("compras")}
               className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all border ${
                 user.allowedSectors?.includes("compras" as Sector)
                   ? "bg-primary-container/20 border-primary-container text-primary-container"
                   : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant opacity-50"
               }`}
             >
               TELAS (COMPRAS/ALERTAS)
             </button>
          </div>

          <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mb-3">
            Permissões de Cards (Setores)
          </p>
          <div className="flex flex-wrap gap-2">
            {sectorsList.filter(s => s.id !== "compras").map((s) => (
              <button
                key={s.id}
                onClick={() => onToggleSector(s.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all border ${
                  user.allowedSectors?.includes(s.id as Sector)
                    ? "bg-primary-container/20 border-primary-container text-primary-container"
                    : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant opacity-50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onToggleAdmin}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[14px]">
                {user.role === "admin" ? "person_remove" : "verified_user"}
              </span>
              {user.role === "admin" ? "Remover Admin" : "Tornar Admin"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
