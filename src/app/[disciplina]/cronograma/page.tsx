import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cartao, Selo, TituloSecao } from "@/components/ui";
import { conteudoDa } from "@/content";
import { dataCurta, dataExtensa, paraData } from "@/lib/datas";

export const revalidate = 3600;

type Props = { params: Promise<{ disciplina: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina } = await params;
  const conteudo = conteudoDa(disciplina);
  return conteudo ? { title: `Cronograma — ${conteudo.disciplina.nome}` } : {};
}

export default async function PaginaCronograma({ params }: Props) {
  const { disciplina: slug } = await params;
  const conteudo = conteudoDa(slug);
  if (!conteudo) notFound();

  const hoje = new Date();
  const referencia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  return (
    <div className="space-y-12">
      <TituloSecao
        sobretitulo={`${conteudo.disciplina.codigo} · ${conteudo.disciplina.periodo}`}
        descricao={conteudo.disciplina.encontrosInfo}
      >
        Cronograma
      </TituloSecao>

      <div className="grid gap-4 sm:grid-cols-2">
        {conteudo.etapas.map((e) => (
          <Cartao key={e.numero}>
            <Selo tom="primary">{e.numero}ª etapa</Selo>
            <p className="mt-3 font-mono text-lg text-ink">{e.periodo}</p>
            <p className="mt-1 text-sm text-ink-dim">{e.conteudo}</p>
          </Cartao>
        ))}
      </div>

      <section>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">
              Cronograma de encontros de {conteudo.disciplina.nome}
            </caption>
            <thead>
              <tr className="border-b border-line bg-panel text-left">
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">
                  Etapa
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">
                  Aula
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">
                  Data
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">
                  Conteúdo
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">
                  Marco
                </th>
              </tr>
            </thead>
            <tbody>
              {conteudo.encontros.map((e) => {
                const passado = paraData(e.data) < referencia;
                return (
                  <tr
                    key={e.numero}
                    className={`border-b border-line-soft last:border-0 ${passado ? "text-ink-faint" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{e.etapa}ª</td>
                    <td className="px-4 py-3 font-mono">
                      {e.numero === 0 ? "S0" : String(e.numero).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3 font-mono whitespace-nowrap">{dataCurta(e.data)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${slug}/encontros/${e.numero}`}
                        className="text-ink hover:text-primary"
                      >
                        {e.titulo}
                      </Link>
                      <span className="mt-0.5 block font-mono text-[11px] text-ink-faint">
                        {e.unidade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {e.marco && (
                        <Selo tom="alert">
                          {e.marco.nota} · {e.marco.etapa}ª
                        </Selo>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <TituloSecao sobretitulo="Atenção ao calendário">Datas sem aula</TituloSecao>
        <ul className="space-y-3">
          {conteudo.semAula.map((d) => (
            <li key={d.data}>
              <Cartao className="border-alert/30 bg-alert-soft">
                <p className="font-mono text-ink">{dataExtensa(d.data)}</p>
                <p className="mt-1 text-sm text-ink-dim">{d.motivo}</p>
              </Cartao>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-dim">
          Provas finais (recuperação): 16, 17 e 18 de dezembro de 2026. São 36h presenciais nos 17
          encontros mais a Semana 0; as 4h restantes são repostas em sábados letivos e eventos do
          campus.
        </p>
      </section>
    </div>
  );
}
