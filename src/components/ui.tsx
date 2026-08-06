import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Junta classes ignorando valores falsos — evita dependência extra. */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const TONS = {
  primary: "bg-primary-soft text-primary border-primary-dim",
  secondary: "bg-secondary-soft text-secondary border-secondary-dim",
  alert: "bg-alert-soft text-alert border-alert/30",
  neutro: "bg-panel text-ink-dim border-line",
} as const;

export type Tom = keyof typeof TONS;

export function Selo({
  children,
  tom = "neutro",
  className,
}: {
  children: ReactNode;
  tom?: Tom;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] leading-5 tracking-wide",
        TONS[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Cartao({
  children,
  className,
  destaque = false,
}: {
  children: ReactNode;
  className?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border bg-card p-5 sm:p-6",
        destaque ? "border-primary-dim shadow-[0_1px_16px_rgba(27,135,143,0.10)]" : "border-line",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TituloSecao({
  sobretitulo,
  children,
  descricao,
}: {
  sobretitulo?: string;
  children: ReactNode;
  descricao?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {sobretitulo && (
        <p className="mb-1.5 font-mono text-xs tracking-[0.14em] text-primary uppercase">
          {sobretitulo}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl">{children}</h2>
      {descricao && <p className="mt-2 max-w-3xl text-ink-dim">{descricao}</p>}
    </header>
  );
}

export function BotaoLink({
  children,
  className,
  variante = "primario",
  ...props
}: ComponentProps<typeof Link> & { variante?: "primario" | "secundario" }) {
  return (
    <Link
      className={cx(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
        variante === "primario"
          ? "bg-primary text-white hover:bg-primary/90"
          : "border border-line bg-card text-ink hover:border-primary-dim hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

/** Bloco de terminal — mantém a sub-paleta escura dos materiais. */
export function Terminal({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-term-line bg-term p-4 font-mono text-[13px] leading-relaxed text-term-dim">
      {children}
    </pre>
  );
}
