import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntregaRelatorio } from "@/components/entrega-relatorio";
import { Cartao, Selo, TituloSecao } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { carregarProjeto } from "@/content/roteiros";
import { momentoCampus } from "@/lib/datas";

type Props = { params: Promise<{ disciplina: string; etapa: string }> };

export async function generateStaticParams() {
  const params = [];
  for (const disciplina of slugsPublicados()) {
    for (const etapa of [1, 2]) {
      if (await carregarProjeto(disciplina, etapa)) params.push({ disciplina, etapa: String(etapa) });
    }
  }
  return params;
}

/** Só as etapas com enunciado publicado geram página. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { etapa } = await params;
  return {
    title: `Projeto integrador · ${etapa}ª etapa`,
    description: "Enunciado, prazos, critérios de avaliação e envio do relatório.",
  };
}

export default async function PaginaProjeto({ params }: Props) {
  const { disciplina: slug, etapa: etapaTexto } = await params;
  const conteudo = conteudoDa(slug);
  const etapa = Number(etapaTexto) as 1 | 2;
  const Enunciado = conteudo && (await carregarProjeto(slug, etapa));
  if (!conteudo || !Enunciado) notFound();

  const { regrasNota } = conteudo;
  const entregas = regrasNota.entregas.filter((e) => e.etapa === etapa);
  const componentes = regrasNota.etapas.find((e) => e.etapa === etapa)!.componentes;
  const rubricas = regrasNota.rubricas.filter((r) => r.nota.endsWith(`${etapa}ª etapa`));

  return (
    <div className="max-w-4xl">
      <nav aria-label="Trilha" className="mb-10 font-mono text-xs text-ink-faint">
        <Link href={`/${slug}`} className="hover:text-primary">
          {conteudo.disciplina.codigo}
        </Link>
        {" / "}
        <Link href={`/${slug}/avaliacao`} className="hover:text-primary">
          avaliação
        </Link>
        {" / "}
        <span className="text-ink-dim">projeto {etapa}ª etapa</span>
      </nav>

      <Enunciado />

      <section className="mb-14">
        <TituloSecao sobretitulo="Prazos e critérios" descricao="Cada instrumento é avaliado de 0 a 10; o peso diz quanto ele vale na nota da etapa.">
          Como o projeto é avaliado
        </TituloSecao>

        {entregas.length > 0 && (
          <ul className="mb-6 grid gap-3 sm:grid-cols-2">
            {entregas.map((e) => (
              <li key={e.fase}>
                <Cartao className="h-full">
                  <Selo tom="alert">Prazo</Selo>
                  <p className="mt-3 font-medium text-ink">{e.nome}</p>
                  <p className="text-sm text-ink-dim">{e.secoes}</p>
                  <p className="mt-2 font-mono text-sm text-ink">{momentoCampus(e.prazo, true)}</p>
                </Cartao>
              </li>
            ))}
          </ul>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {rubricas.map((r) => {
            const peso = componentes.find((c) => r.nota.startsWith(c.id))?.peso;
            return (
              <li key={r.nota}>
                <Cartao className="h-full">
                  <div className="flex items-center justify-between gap-3">
                    <Selo tom="primary">{r.nota}</Selo>
                    {peso !== undefined && (
                      <span className="font-mono text-sm text-ink-dim">
                        {Math.round(peso * 100)}% da etapa
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-medium text-ink">{r.titulo}</p>
                  <ul className="mt-3 space-y-2">
                    {r.criterios.map((c) => (
                      <li
                        key={c.nome}
                        className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-2 text-sm last:border-0"
                      >
                        <span className="text-ink-dim">{c.nome}</span>
                        <span className="font-mono text-ink">{c.peso.toFixed(1).replace(".", ",")}</span>
                      </li>
                    ))}
                  </ul>
                </Cartao>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-sm text-ink-faint">
          A composição completa da nota, com o portfólio de quizzes, está na{" "}
          <Link href={`/${slug}/avaliacao`} className="text-primary hover:underline">
            página de avaliação
          </Link>
          .
        </p>
      </section>

      {entregas.length > 0 && (
        <section id="entrega" className="scroll-mt-24">
          <TituloSecao sobretitulo="Envio" descricao="Um integrante envia pela equipe inteira. Confira nomes e matrículas: é por elas que a nota chega a cada um.">
            Enviar o relatório
          </TituloSecao>
          <Cartao>
            <EntregaRelatorio
              disciplina={slug}
              etapa={etapa}
              entregas={entregas.map(({ fase, nome, secoes, prazo }) => ({ fase, nome, secoes, prazo }))}
            />
          </Cartao>
        </section>
      )}
    </div>
  );
}
