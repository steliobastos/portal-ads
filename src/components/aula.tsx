import type { ReactNode } from "react";
import { cx } from "./ui";

/**
 * Componentes dos roteiros de laboratório.
 *
 * Substituem, em React, os blocos que cada HTML de material reimplementava com
 * CSS próprio. A estrutura é a mesma que já estava consolidada nos 13 roteiros
 * do padrão dominante — cartão de comando, grade "o que é / por que importa",
 * terminal simulado, dica colapsável, checklist —, agora escrita uma vez só.
 *
 * Os que precisam de estado (rascunho de observação, checklist com progresso)
 * vivem em `aula-interativo.tsx`, marcados como client component.
 */

/** Cabeçalho do roteiro: tempo estimado, título e chamada. */
export function Abertura({
  duracao,
  titulo,
  children,
}: {
  duracao: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <header className="mb-12">
      <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">
        Mão na massa · {duracao}
      </p>
      <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{titulo}</h1>
      <div className="mt-4 max-w-3xl text-lg text-ink-dim">{children}</div>
    </header>
  );
}

/** Faixa com as partes do roteiro ("Passos 1–4 · Diagnóstico"). */
export function Partes({ children }: { children: ReactNode }) {
  return <div className="mb-14 flex flex-wrap gap-3">{children}</div>;
}

export function Parte({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <span className="rounded-lg border border-line bg-card px-4 py-2.5 font-mono text-xs text-ink-dim">
      <b className="text-primary">{rotulo}</b> · {children}
    </span>
  );
}

/** Uma etapa do roteiro. */
export function Passo({
  numero,
  de,
  titulo,
  children,
}: {
  numero: number;
  de: number;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section id={`passo-${numero}`} className="mb-14 scroll-mt-32">
      <p className="font-mono text-xs tracking-[0.06em] text-ink-faint uppercase">
        Passo {numero} de {de}
      </p>
      <h2 className="mt-2 text-2xl">{titulo}</h2>
      {children}
    </section>
  );
}

/** Frase de contexto logo abaixo do título de um passo. */
export function Intro({ children }: { children: ReactNode }) {
  return <p className="mt-2 mb-6 max-w-3xl text-ink-dim">{children}</p>;
}

/** Cartão de um comando: o número da etapa, o comando e tudo que o explica. */
export function Comando({
  passo,
  cmd,
  children,
}: {
  passo: number;
  cmd: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5 rounded-xl border border-line bg-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs text-white">
          {passo}
        </span>
        <code className="rounded-md bg-primary-soft px-2.5 py-1 font-mono text-[15px] text-primary">
          {cmd}
        </code>
      </div>
      {children}
    </div>
  );
}

/** Grade de explicação — na prática, sempre "O que é" + "Por que importa". */
export function Explica({ children }: { children: ReactNode }) {
  return <div className="mb-4 grid gap-3.5 sm:grid-cols-2">{children}</div>;
}

export function Caixa({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line-soft bg-panel p-3.5">
      <p className="mb-1.5 font-mono text-[10.5px] tracking-[0.05em] text-ink-faint uppercase">
        {titulo}
      </p>
      <div className="text-sm text-ink-dim [&_p]:m-0">{children}</div>
    </div>
  );
}

/**
 * Terminal simulado. Mantém a sub-paleta escura mesmo com a página clara — é o
 * contraste que faz o aluno reconhecer "isto é a tela do terminal", e vale a
 * exceção à paleta.
 */
export function Terminal({ comando, children }: { comando?: string; children?: ReactNode }) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-term-line bg-term">
      <div className="flex gap-1.5 px-3 py-2" aria-hidden>
        <span className="size-2 rounded-full bg-term-line" />
        <span className="size-2 rounded-full bg-term-line" />
        <span className="size-2 rounded-full bg-term-line" />
      </div>
      <pre className="overflow-x-auto px-4 pb-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
        {comando && (
          <>
            <span className="text-term-prompt">$</span>{" "}
            <span className="text-[#cfd6e0]">{comando}</span>
            {children ? "\n" : ""}
          </>
        )}
        {children && <span className="text-term-dim">{children}</span>}
      </pre>
    </div>
  );
}

/** "O que esperar" — o parágrafo que calibra a expectativa antes de rodar. */
export function Esperar({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-ink-dim">
      <b className="text-ink">O que esperar:</b> {children}
    </p>
  );
}

/** Dica colapsável — fechada por padrão, para não entregar a resposta. */
export function Dica({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <details className="mt-3 rounded-lg border border-line-soft bg-panel">
      <summary className="cursor-pointer px-3.5 py-2.5 font-mono text-sm text-primary">
        {titulo}
      </summary>
      <div className="px-3.5 pb-3.5 text-sm text-ink-dim [&_p]:mt-0">{children}</div>
    </details>
  );
}

/** Divisor entre as duas metades do roteiro. */
export function Divisor({ children }: { children: ReactNode }) {
  return (
    <div className="my-14 flex items-center gap-4">
      <span className="h-px flex-1 bg-line" />
      <span className="font-mono text-xs tracking-[0.08em] text-primary uppercase">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Par de exemplos: o que é uma observação fraca e o que é uma forte. */
export function Exemplos({ children }: { children: ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="mb-4 text-lg">Exemplo de observação forte × fraca</h2>
      <div className="grid gap-3.5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Exemplo({ tipo, children }: { tipo: "fraca" | "forte"; children: ReactNode }) {
  const forte = tipo === "forte";
  return (
    <div
      className={cx(
        "rounded-lg border p-4",
        forte ? "border-secondary bg-secondary-soft" : "border-alert bg-alert-soft",
      )}
    >
      <p
        className={cx(
          "mb-1.5 font-mono text-[11px] uppercase",
          forte ? "text-secondary" : "text-alert",
        )}
      >
        Observação {tipo}
      </p>
      <div className="text-sm text-ink-dim italic [&_p]:m-0">{children}</div>
    </div>
  );
}

/** Onde a prática do dia encosta na teoria do slide e da leitura. */
export function Teoria({ children }: { children: ReactNode }) {
  return (
    <aside className="mb-14 rounded-xl border border-primary-dim bg-primary-soft p-5">
      <p className="mb-1.5 font-mono text-[11px] tracking-wide text-primary uppercase">
        Conexão com a teoria
      </p>
      <div className="text-sm text-ink-dim [&_p]:m-0">{children}</div>
    </aside>
  );
}

/** Aviso destacado — usado para lembrete de entrega e alerta de avaliação. */
export function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mb-8 rounded-xl border border-alert/40 bg-alert-soft p-5">
      <p className="mb-1.5 font-mono text-[11px] tracking-wide text-alert uppercase">{titulo}</p>
      <div className="text-sm text-ink-dim [&_p]:mt-0 [&_p:last-child]:mb-0">{children}</div>
    </div>
  );
}
