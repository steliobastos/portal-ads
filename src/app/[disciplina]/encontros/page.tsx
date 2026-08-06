import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeloFaixa } from "@/components/leitura";
import { materiaisDo } from "@/components/material";
import { Cartao, Selo, TituloSecao } from "@/components/ui";
import { conteudoDa } from "@/content";
import { dataCurta, paraData } from "@/lib/datas";

export const revalidate = 3600;

type Props = { params: Promise<{ disciplina: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina } = await params;
  const conteudo = conteudoDa(disciplina);
  return conteudo ? { title: `Encontros — ${conteudo.disciplina.nome}` } : {};
}

export default async function PaginaEncontros({ params }: Props) {
  const { disciplina: slug } = await params;
  const conteudo = conteudoDa(slug);
  if (!conteudo) notFound();

  const hoje = new Date();
  const referencia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const proximoNumero = conteudo.encontros.find((e) => paraData(e.data) >= referencia)?.numero;

  const porEtapa = [1, 2].map((etapa) => ({
    etapa,
    info: conteudo.etapas.find((e) => e.numero === etapa)!,
    lista: conteudo.encontros.filter((e) => e.etapa === etapa),
  }));

  return (
    <div className="space-y-14">
      <TituloSecao
        sobretitulo={conteudo.disciplina.codigo}
        descricao="Cada encontro tem slides, roteiro de laboratório e quiz da semana. O roteiro é escrito para você seguir sozinho: cada comando vem com o que é, por que importa e o que esperar na tela."
      >
        Encontros
      </TituloSecao>

      {porEtapa.map(({ etapa, info, lista }) => (
        <section key={etapa}>
          <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-line pb-3">
            <h2 className="text-xl">{etapa}ª etapa</h2>
            <Selo>{info.periodo}</Selo>
            <span className="text-sm text-ink-dim">{info.conteudo}</span>
          </div>

          <ul className="space-y-4">
            {lista.map((e) => {
              const passado = paraData(e.data) < referencia;
              const materiais = materiaisDo(slug, e.pasta);

              return (
                <li key={e.numero}>
                  <Cartao destaque={e.numero === proximoNumero} className={passado ? "opacity-80" : undefined}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {/* Coluna do número */}
                      <div className="flex shrink-0 items-center gap-3 sm:w-24 sm:flex-col sm:items-start sm:gap-1">
                        <span className="font-display text-3xl leading-none text-primary">
                          {e.numero === 0 ? "S0" : String(e.numero).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-xs text-ink-faint">{dataCurta(e.data)}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] tracking-wide text-ink-faint uppercase">
                            {e.unidade}
                          </span>
                          {e.numero === proximoNumero && <Selo tom="primary">Próximo</Selo>}
                          {e.marco && (
                            <Selo tom="alert">
                              {e.marco.nota} · {e.marco.etapa}ª etapa
                            </Selo>
                          )}
                        </div>

                        <h3 className="mt-1 text-xl">
                          <Link href={`/${slug}/encontros/${e.numero}`} className="hover:text-primary">
                            {e.titulo}
                          </Link>
                        </h3>

                        <p className="mt-1.5 text-sm text-ink-dim">{e.resumo}</p>

                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {e.topicos.map((t) => (
                            <li key={t}>
                              <span className="rounded-md bg-panel px-2 py-0.5 font-mono text-[11px] text-ink-dim">
                                {t}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="text-ink-faint">
                            {materiais.length} {materiais.length === 1 ? "arquivo" : "arquivos"} de
                            material
                          </span>
                          <span className="flex flex-wrap gap-1.5">
                            {e.leituras
                              .filter((l) => l.faixa === "base" || l.faixa === "recorte")
                              .map((l) => (
                                <SeloFaixa key={l.fonte + l.titulo} faixa={l.faixa} />
                              ))}
                          </span>
                          <Link
                            href={`/${slug}/encontros/${e.numero}`}
                            className="ml-auto text-primary hover:underline"
                          >
                            Abrir →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Cartao>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
