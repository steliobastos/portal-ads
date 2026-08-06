import type { Metadata } from "next";
import { Icone } from "@/components/arte";
import { Selo } from "@/components/ui";
import { CATEGORIAS, TOTAL_LINKS } from "@/content/links";

export const metadata: Metadata = {
  title: "Links úteis",
  description:
    "Referências gratuitas e estáveis para linha de comando, Docker, Git, desenvolvimento web e estudo.",
};

/** "https://explainshell.com/" → "explainshell.com" */
function dominio(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

export default function PaginaLinks() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:py-16">
      <header className="mb-10">
        <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Portal</p>
        <h1 className="mt-3 text-4xl">Links úteis</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-dim">
          {TOTAL_LINKS} referências para consultar o curso inteiro. O critério de entrada é
          simples: precisa ser gratuito, estável e realmente útil no dia a dia — documentação
          oficial e ferramenta interativa, não tutorial que envelhece em seis meses.
        </p>
      </header>

      {/* Índice — a página é longa, e pular direto para a categoria é o uso real. */}
      <nav aria-label="Categorias" className="mb-14 flex flex-wrap gap-2">
        {CATEGORIAS.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-sm text-ink-dim transition-colors hover:border-primary-dim hover:text-primary"
          >
            <Icone nome={cat.icone} className="size-4" />
            {cat.titulo}
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        {CATEGORIAS.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-32">
            <header className="mb-6 flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icone nome={cat.icone} className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl">{cat.titulo}</h2>
                <p className="mt-1 max-w-2xl text-ink-dim">{cat.descricao}</p>
              </div>
            </header>

            <ul className="grid gap-3 sm:grid-cols-2">
              {cat.links.map((link) => (
                <li key={link.url}>
                  {/* Link externo: nova aba, para não tirar o aluno do portal. */}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col rounded-xl border border-line bg-card p-4 transition-colors hover:border-primary-dim"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink group-hover:text-primary">
                        {link.titulo}
                      </span>
                      {link.destaque && <Selo tom="primary">comece por aqui</Selo>}
                    </span>

                    <span className="mt-1.5 flex-1 text-sm text-ink-dim">{link.descricao}</span>

                    <span className="mt-3 font-mono text-xs text-ink-faint">
                      {dominio(link.url)} ↗
                      <span className="sr-only"> (abre em nova aba)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-16 rounded-xl border border-line bg-panel p-5 text-sm text-ink-dim">
        Achou um link quebrado, ou tem uma indicação que faltou? Avise em aula — a lista é mantida
        à mão e melhora com o uso.
      </p>
    </main>
  );
}
