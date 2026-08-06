import type { Metadata } from "next";
import Link from "next/link";
import { ArteCamadas } from "@/components/arte";
import { Cartao, Selo, TituloSecao } from "@/components/ui";
import { DISCIPLINAS_ATIVAS } from "@/content";
import { PORTAL } from "@/content/portal";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "O que é este portal, quem o mantém e por que o código-fonte dele é público.",
};

export default function PaginaSobre() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-12 sm:py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Portal</p>
        <h1 className="mt-3 text-4xl">Sobre</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-dim">
          Um guia de estudo para os alunos — e, ao mesmo tempo, um exemplo real de programação web
          para eles lerem por dentro.
        </p>
      </header>

      <section className="mb-16">
        <TituloSecao sobretitulo="O que é">Um lugar só, o semestre inteiro</TituloSecao>
        <div className="max-w-3xl space-y-4 text-ink-dim">
          <p>
            Material de disciplina costuma viver espalhado: um PDF no grupo, um link no sistema
            acadêmico, um slide que alguém mandou. No meio do semestre, ninguém sabe qual é a versão
            certa.
          </p>
          <p>
            Este portal existe para resolver isso. O semestre inteiro é publicado antes de começar —
            cronograma, material de todos os encontros, mapa de leituras e critérios de avaliação —
            num endereço que não muda. Quem faltou, quem quer adiantar e quem quer revisar usam o
            mesmo lugar.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <TituloSecao sobretitulo="Quem mantém">Professor e curso</TituloSecao>
        <Cartao>
          <p className="font-display text-xl">{PORTAL.professor}</p>
          <p className="mt-1 text-ink-dim">
            {PORTAL.curso} — {PORTAL.instituicao}, {PORTAL.campus}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {DISCIPLINAS_ATIVAS.map((d) => (
              <li key={d.slug}>
                <Link href={`/${d.slug}`}>
                  <Selo tom="primary">
                    {d.codigo} · {d.nome}
                  </Selo>
                </Link>
              </li>
            ))}
          </ul>
        </Cartao>
      </section>

      <section className="mb-16">
        <TituloSecao sobretitulo="Como as aulas funcionam">
          Prática primeiro, livro depois
        </TituloSecao>

        <div className="grid items-center gap-10 sm:grid-cols-[1fr_0.8fr]">
          <div className="space-y-4 text-ink-dim">
            <p>
              Cada encontro abre com 10 a 15 minutos de professor amarrando o essencial, e o resto
              do tempo é mão na massa — terminal aberto, cenário de trabalho, professor circulando
              como mentor.
            </p>
            <p>
              A leitura entra depois da prática, com recorte cirúrgico: as páginas ligadas à
              atividade do dia, nunca &ldquo;o capítulo&rdquo;. E não há prova tradicional: a nota
              vem de um projeto integrador em duas etapas.
            </p>
          </div>

          <ArteCamadas className="w-full max-w-xs justify-self-center" />
        </div>
      </section>

      <section>
        <TituloSecao sobretitulo="Código aberto">Por que o código é público</TituloSecao>
        <div className="max-w-3xl space-y-4 text-ink-dim">
          <p>
            O portal é escrito em Next.js, React e TypeScript, e o repositório é público de
            propósito. A ideia é que ele sirva de material didático em Programação Web: em vez de um
            projeto de exemplo inventado, os alunos leem o código de um site que eles próprios usam
            toda semana.
          </p>
          <p>
            O que <em>não</em> está no repositório: roteiros de condução, checklists e rubricas de
            correção. Esses ficam fora até estarem fechados — publicar critério de nota em rascunho
            confunde mais do que ajuda.
          </p>

          <p>
            <a
              href={PORTAL.repositorio}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary-dim hover:text-primary"
            >
              Ver o código no GitHub
              <span aria-hidden className="font-mono text-xs text-ink-faint">
                ↗
              </span>
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
