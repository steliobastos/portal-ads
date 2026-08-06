"use client";

import { createContext, useContext, useEffect, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "./ui";

/**
 * As partes do roteiro que guardam estado do aluno.
 *
 * Diferença em relação ao HTML original: o que o aluno digita **sobrevive ao
 * recarregamento**. No laboratório ele escreve as observações durante a prática
 * e só depois cola no quiz — perder o texto num F5 acidental era um jeito fácil
 * de perder trabalho. Fica no navegador dele (localStorage), não no servidor.
 */

const MINIMO_CARACTERES = 40;

function useLocal(chave: string, inicial = "") {
  const [valor, setValor] = useState(inicial);
  const [carregado, setCarregado] = useState(false);

  // Só depois da hidratação: no servidor não existe localStorage, e ler durante
  // a renderização faria o HTML do servidor divergir do primeiro render.
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(chave);
      if (guardado !== null) setValor(guardado);
    } catch {
      // navegador com armazenamento bloqueado — o campo só deixa de lembrar
    }
    setCarregado(true);
  }, [chave]);

  useEffect(() => {
    if (!carregado) return;
    try {
      window.localStorage.setItem(chave, valor);
    } catch {
      // idem
    }
  }, [chave, valor, carregado]);

  return [valor, setValor] as const;
}

/** Rascunho de uma das observações que serão entregues no quiz da semana. */
export function Rascunho({
  encontro,
  numero,
  children,
}: {
  encontro: number;
  numero: number;
  children: ReactNode;
}) {
  const id = useId();
  const [texto, setTexto] = useLocal(`roteiro:${encontro}:obs${numero}`);
  const suficiente = texto.length >= MINIMO_CARACTERES;

  return (
    <div className="mt-6 rounded-xl border border-line bg-panel p-4">
      {/*
       * O enunciado fica fora do `<label>`, ligado por `aria-describedby`: o MDX
       * gera um `<p>` quando o texto é escrito em linhas próprias, e `<p>`
       * dentro de `<label>` é HTML inválido. De quebra, o leitor de tela anuncia
       * um rótulo curto e a pergunta como descrição, em vez de um bloco só.
       */}
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        Rascunho da observação {numero}
      </label>

      <div id={`${id}-pergunta`} className="mt-1 text-sm text-ink-dim [&_p]:my-0">
        {children}
      </div>

      <textarea
        id={id}
        aria-describedby={`${id}-pergunta`}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        className="mt-2 w-full resize-y rounded-lg border border-line bg-card p-3 text-sm text-ink"
      />

      <p
        className={cx(
          "mt-1 text-right font-mono text-[11.5px]",
          suficiente ? "text-secondary" : "text-ink-faint",
        )}
        aria-live="polite"
      >
        {texto.length} / {MINIMO_CARACTERES} caracteres
      </p>
    </div>
  );
}

type ContextoChecklist = {
  marcados: Record<string, boolean>;
  alternar: (chave: string, valor: boolean) => void;
};

const Checklist_ = createContext<ContextoChecklist | null>(null);

/** Checklist final, com barra de progresso e memória entre sessões. */
export function Checklist({ encontro, children }: { encontro: number; children: ReactNode }) {
  const chave = `roteiro:${encontro}:checklist`;
  const [bruto, setBruto] = useLocal(chave, "{}");

  const marcados = useMemo<Record<string, boolean>>(() => {
    try {
      const lido: unknown = JSON.parse(bruto);
      return lido && typeof lido === "object" ? (lido as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  }, [bruto]);

  const alternar = (item: string, valor: boolean) =>
    setBruto(JSON.stringify({ ...marcados, [item]: valor }));

  const total = Array.isArray(children) ? children.length : 1;
  const feitos = Object.values(marcados).filter(Boolean).length;
  const porcento = total > 0 ? Math.round((feitos / total) * 100) : 0;

  return (
    <section className="mb-12">
      <h2 className="mb-4 text-lg">Checklist final</h2>

      <Checklist_.Provider value={{ marcados, alternar }}>
        <ul className="flex flex-col gap-2.5">{children}</ul>
      </Checklist_.Provider>

      <div className="mt-5 flex items-center gap-4">
        <span className="font-mono text-xs whitespace-nowrap text-ink-dim">
          {feitos} / {total} verificados
        </span>
        <div className="h-1.5 max-w-xs flex-1 overflow-hidden rounded-full bg-line-soft">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${porcento}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export function Item({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(Checklist_);
  const marcado = ctx?.marcados[id] ?? false;

  return (
    <li
      className={cx(
        "flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
        marcado ? "border-secondary bg-secondary-soft text-ink" : "border-line bg-card text-ink-dim",
      )}
    >
      <input
        type="checkbox"
        checked={marcado}
        onChange={(e) => ctx?.alternar(id, e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-secondary"
      />
      <span>{children}</span>
    </li>
  );
}
