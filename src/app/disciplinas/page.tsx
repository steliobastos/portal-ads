import type { Metadata } from "next";
import Link from "next/link";
import { BotaoLink, Cartao, Selo, TituloSecao } from "@/components/ui";
import { DISCIPLINAS, conteudoDa } from "@/content";
import { proximoEncontroDe } from "@/lib/agenda";
import { dataExtensa } from "@/lib/datas";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Disciplinas",
  description:
    "As disciplinas publicadas no portal, com cronograma, material dos encontros e critérios de avaliação.",
};

export default function PaginaDisciplinas() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Portal</p>
        <h1 className="mt-3 text-4xl">Disciplinas</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-dim">
          Cada disciplina publicada aqui traz o semestre inteiro no ar desde o primeiro dia:
          cronograma, material de todos os encontros, mapa de leituras e critérios de avaliação.
        </p>
      </header>

      <ul className="space-y-6">
        {DISCIPLINAS.map((d) => {
          const conteudo = conteudoDa(d.slug);
          const proximo = d.ativa ? proximoEncontroDe(d.slug) : null;

          return (
            <li key={d.slug}>
              <Cartao destaque={d.ativa} className={d.ativa ? undefined : "opacity-70"}>
                <div className="flex flex-wrap items-center gap-2">
                  {d.ativa ? (
                    <>
                      <Selo tom="primary">{d.codigo}</Selo>
                      <Selo>{d.periodo}</Selo>
                      <Selo>{d.cargaHoraria}</Selo>
                    </>
                  ) : (
                    <Selo>Em breve</Selo>
                  )}
                </div>

                <h2 className="mt-3 font-display text-2xl">
                  {d.ativa ? (
                    <Link href={`/${d.slug}`} className="hover:text-primary">
                      {d.nome}
                    </Link>
                  ) : (
                    <span className="text-ink-dim">{d.nome}</span>
                  )}
                </h2>

                <p className="mt-2 max-w-3xl text-ink-dim">{d.ementaResumo}</p>

                {d.ativa && conteudo && (
                  <>
                    {d.eixo && (
                      <p className="mt-4 rounded-xl border border-secondary-dim bg-secondary-soft p-4 text-sm text-ink">
                        <span className="font-mono text-xs tracking-wide text-secondary uppercase">
                          Eixo do curso
                        </span>
                        <span className="mt-1 block">{d.eixo}</span>
                      </p>
                    )}

                    <dl className="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                      <div className="flex gap-2">
                        <dt className="text-ink-faint">Encontros</dt>
                        <dd className="text-ink-dim">{d.encontrosInfo}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-ink-faint">Unidades</dt>
                        <dd className="text-ink-dim">{conteudo.unidades.length}</dd>
                      </div>
                      {proximo && (
                        <div className="flex gap-2">
                          <dt className="text-ink-faint">Próximo encontro</dt>
                          <dd className="text-ink-dim">
                            {proximo.numero === 0 ? "Semana 0" : `Encontro ${proximo.numero}`} ·{" "}
                            {dataExtensa(proximo.data)}
                          </dd>
                        </div>
                      )}
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <BotaoLink href={`/${d.slug}`}>Visão geral</BotaoLink>
                      <BotaoLink href={`/${d.slug}/encontros`} variante="secundario">
                        Encontros
                      </BotaoLink>
                      <BotaoLink href={`/${d.slug}/avaliacao`} variante="secundario">
                        Avaliação
                      </BotaoLink>
                    </div>
                  </>
                )}
              </Cartao>
            </li>
          );
        })}
      </ul>

      <section className="mt-16">
        <TituloSecao sobretitulo="Ainda não está aqui?">Como o portal cresce</TituloSecao>
        <p className="max-w-3xl text-ink-dim">
          O portal foi construído multi-disciplina desde o primeiro commit: nenhuma rota assume
          &ldquo;disciplina única&rdquo;. Publicar uma disciplina nova é acrescentar o conteúdo em{" "}
          <code className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[13px] text-primary">
            src/content/
          </code>{" "}
          e o material em{" "}
          <code className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[13px] text-primary">
            public/material/
          </code>{" "}
          — sem tocar no código das páginas.
        </p>
      </section>
    </main>
  );
}
