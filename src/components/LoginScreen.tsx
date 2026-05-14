import React from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function LoginScreen() {
  const { signIn, user, profile, loading, logOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center flex flex-col items-center"
      >
        <img
          src="https://i.imgur.com/4dwZg3s.png"
          alt="MEEPLÁRIO Logo"
          className="h-24 md:h-32 mb-6 drop-shadow-[0_0_15px_rgba(255,107,0,0.5)]"
        />
        <h1 className="font-display text-4xl md:text-6xl uppercase tracking-[0.2em] text-primary-container neon-glow mb-2">
          Meeplário
        </h1>
        <p className="font-mono text-[10px] md:text-xs text-on-surface-variant opacity-70 tracking-[0.3em] uppercase">
          Controle de Estoque • Inventário Tático
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-[420px] glass-panel border border-outline-variant/30 rounded-xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glass Highlight */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-outline-variant to-transparent opacity-50" />

        <div className="flex flex-col space-y-6">
          {!user ? (
            <>
              <div className="space-y-1">
                <h2 className="font-sans text-xl font-bold text-on-surface">
                  Iniciar Sessão
                </h2>
                <p className="font-sans text-sm text-on-surface-variant">
                  Acesse o arsenal tático para gerenciar recursos.
                </p>
              </div>

              <div className="space-y-5">
                <div className="pt-4 space-y-4">
                  <button
                    onClick={signIn}
                    className="w-full bg-primary-container text-on-primary-container font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:shadow-[0_0_25px_rgba(255,107,0,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <span>Iniciar Missão</span>
                    <span
                      className="material-symbols-outlined font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      swords
                    </span>
                  </button>

                  <div className="text-center">
                    <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest leading-loose">
                      Apenas Pessoal Autorizado
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : user && !profile ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl">
                  {loading ? 'sync' : 'database_off'}
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="font-sans text-xl font-bold text-on-surface">
                  {loading ? 'Sincronizando...' : 'Erro de Acesso ao Banco'}
                </h2>
                <p className="font-sans text-sm text-on-surface-variant">
                  {loading 
                    ? 'Aguarde enquanto carregamos seus dados táticos...' 
                    : 'Não foi possível acessar o banco de dados. Verifique se o Firestore está ativo e se as Regras de Segurança foram publicadas.'}
                </p>
              </div>
              {!loading && (
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-surface-container text-on-surface font-mono text-[10px] py-3 rounded-lg uppercase tracking-widest hover:bg-surface-container-high transition-colors"
                  >
                    Tentar Novamente
                  </button>
                  <button
                    onClick={logOut}
                    className="w-full border border-outline text-on-surface-variant font-mono text-[10px] py-2 rounded-lg uppercase tracking-widest hover:bg-surface-container"
                  >
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : user && profile && !profile.approved ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-primary-container/10 text-primary-container rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl animate-pulse">
                  lock_clock
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="font-sans text-xl font-bold text-on-surface">
                  Aguardando Aprovação
                </h2>
                <p className="font-sans text-sm text-on-surface-variant">
                  Sua conta foi criada, mas ainda não foi aprovada pelo
                  Comandante.
                </p>
              </div>
              <button
                onClick={logOut}
                className="text-error font-mono text-[10px] uppercase tracking-widest hover:underline"
              >
                SAIR DA CONTA
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center space-y-6"
      >
        <div className="flex items-center justify-center gap-6">
          <div className="h-[1px] w-12 bg-outline-variant" />
          <div className="font-mono text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">
            V1.0.4 ACESSO SEGURO
          </div>
          <div className="h-[1px] w-12 bg-outline-variant" />
        </div>
        <p className="font-sans text-[11px] text-on-surface-variant opacity-60">
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
      </motion.footer>
    </div>
  );
}
