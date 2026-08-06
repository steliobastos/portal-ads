import Link from "next/link";
import { Cabecalho } from "@/components/navegacao";
import { BotaoLink, Cartao, Selo } from "@/components/ui";
import { DISCIPLINAS, DISCIPLINAS_ATIVAS } from "@/content";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Na capa o menu lista as disciplinas — é o que existe para navegar aqui. */}
      <Cabecalho
        itens={DISCIPLINAS_ATIVAS.map((d) => ({ href: `/${d.slug}`, rotulo: d.nome }))}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-16 sm:py-24">
        <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">
          IFCE · Campus Horizonte
        </p>

        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">Portal de Disciplinas</h1>

        <p className="mt-4 max-w-2xl text-lg text-ink-dim">
          O guia do aluno das disciplinas do curso de Tecnologia em Análise e Desenvolvimento de
          Sistemas: cronograma, material de cada encontro, mapa de leituras e critérios de
          avaliação — tudo num lugar só.
        </p>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {DISCIPLINAS.map((d) => (
            <li key={d.slug}>
              {d.ativa ? (
                <Cartao className="flex h-full flex-col" destaque>
                  <div className="flex flex-wrap items-center gap-2">
                    <Selo tom="primary">{d.codigo}</Selo>
                    <Selo>{d.periodo}</Selo>
                  </div>
                  <h2 className="mt-3 text-2xl">
                    <Link href={`/${d.slug}`} className="hover:text-primary">
                      {d.nome}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-ink-dim">{d.ementaResumo}</p>
                  <p className="mt-3 font-mono text-xs text-ink-faint">{d.encontrosInfo}</p>
                  <div className="mt-5">
                    <BotaoLink href={`/${d.slug}`}>Entrar</BotaoLink>
                  </div>
                </Cartao>
              ) : (
                <Cartao className="flex h-full flex-col opacity-70">
                  <Selo>Em breve</Selo>
                  <h2 className="mt-3 text-2xl text-ink-dim">{d.nome}</h2>
                  <p className="mt-2 flex-1 text-sm text-ink-faint">{d.ementaResumo}</p>
                </Cartao>
              )}
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-ink-dim">
          <p>Instituto Federal de Educação, Ciência e Tecnologia do Ceará — Campus Horizonte</p>
          <p className="mt-1">Prof. José Stelio Sampaio Bastos Neto</p>
        </div>
      </footer>
    </div>
  );
}
