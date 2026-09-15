import Link from "next/link";
import type { ReactNode } from "react";
import { LoginProfessor } from "@/components/login-professor";
import { Cartao, cx } from "@/components/ui";
import { configSupabase, professorLogado } from "@/lib/supabase/servidor";
import { sair } from "./acoes";

const ABAS = [
  { href: "/professor", id: "quizzes", rotulo: "Quizzes" },
  { href: "/professor/portfolio", id: "portfolio", rotulo: "Portfólio" },
  { href: "/professor/relatorios", id: "relatorios", rotulo: "Relatórios" },
  { href: "/professor/roteiros", id: "roteiros", rotulo: "Roteiros" },
] as const;

export type Aba = (typeof ABAS)[number]["id"];

/**
 * Todas as páginas da área restrita começam por aqui: sem banco configurado ou
 * sem professor logado, devolve a tela certa no lugar do conteúdo.
 *
 * A checagem fica em cada página, e não num `layout.tsx`: o layout não é
 * renderizado de novo quando se navega entre páginas irmãs, então não serve
 * como porteiro.
 */
export async function exigirProfessor(): Promise<{ bloqueio: ReactNode } | { email: string }> {
  if (!configSupabase()) {
    return {
      bloqueio: (
        <Moldura>
          <Cartao className="border-alert/30 bg-alert-soft">
            <p className="text-ink">
              O banco de dados ainda não está configurado neste ambiente: faltam as variáveis{" "}
              <code className="font-mono text-sm">SUPABASE_*</code>.
            </p>
          </Cartao>
        </Moldura>
      ),
    };
  }

  const professor = await professorLogado();
  if (!professor) {
    return {
      bloqueio: (
        <Moldura>
          <p className="mb-6 text-ink-dim">Acesso restrito ao professor da disciplina.</p>
          <LoginProfessor />
        </Moldura>
      ),
    };
  }

  return { email: professor.email ?? "" };
}

export function Moldura({ children, aba, email }: { children: ReactNode; aba?: Aba; email?: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Restrito</p>
          <h1 className="mt-3 text-4xl">Área do professor</h1>
        </div>
        {email && (
          <form action={sair}>
            <span className="mr-3 font-mono text-xs text-ink-faint">{email}</span>
            <button type="submit" className="text-sm text-primary hover:underline">
              Sair
            </button>
          </form>
        )}
      </header>

      {aba && (
        <nav aria-label="Seções da área do professor" className="mb-10 flex gap-1 border-b border-line">
          {ABAS.map((a) => (
            <Link
              key={a.id}
              href={a.href}
              aria-current={a.id === aba ? "page" : undefined}
              className={cx(
                "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
                a.id === aba
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-ink-dim hover:text-ink",
              )}
            >
              {a.rotulo}
            </Link>
          ))}
        </nav>
      )}

      {children}
    </main>
  );
}
