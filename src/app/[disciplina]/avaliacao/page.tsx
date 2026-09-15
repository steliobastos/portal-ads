import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cartao, Selo, TituloSecao } from "@/components/ui";
import { conteudoDa } from "@/content";
import { carregarProjeto } from "@/content/roteiros";
import { dataExtensa, momentoCampus } from "@/lib/datas";

type Props = { params: Promise<{ disciplina: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina } = await params;
  const conteudo = conteudoDa(disciplina);
  return conteudo ? { title: `Avaliação — ${conteudo.disciplina.nome}` } : {};
}

const PROJETO: { etapa: 1 | 2; nome: string; descricao: string; entrega: string }[] = [
  {
    etapa: 1,
    nome: "Diagnóstico do sistema",
    descricao:
      "Investigar um sistema operacional real pelo terminal — conceitos, arquitetura e processos — e produzir um relatório que conecte o que foi observado ao que foi lido.",
    entrega: "Relatório Raio-X, defesa oral e demonstração de um container ao vivo.",
  },
  {
    etapa: 2,
    nome: "Automação e operação",
    descricao:
      "Aprofundar memória e E/S e construir um toolkit de automação — deploy, backup e monitoramento — operando sobre um container.",
    entrega: "Três scripts (deploy.sh, backup.sh, monitor.sh), README e apresentação final.",
  },
];

const pct = (peso: number) => `${Math.round(peso * 100)}%`;
const decimal = (n: number) => n.toFixed(1).replace(".", ",");

export default async function PaginaAvaliacao({ params }: Props) {
  const { disciplina: slug } = await params;
  const conteudo = conteudoDa(slug);
  if (!conteudo) notFound();

  const { regrasNota } = conteudo;
  const { portfolio } = regrasNota;
  const comEnunciado = await Promise.all(PROJETO.map((p) => carregarProjeto(slug, p.etapa)));

  return (
    <div className="space-y-14">
      <TituloSecao
        sobretitulo={conteudo.disciplina.codigo}
        descricao="Não há prova tradicional. A nota de cada etapa vem do projeto integrador, avaliado em dois momentos, e do portfólio de quizzes semanais."
      >
        Avaliação
      </TituloSecao>

      <section>
        <TituloSecao sobretitulo="O que você constrói">Projeto integrador</TituloSecao>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PROJETO.map((p, i) => (
            <li key={p.etapa}>
              <Cartao className="h-full">
                <Selo tom="primary">{p.etapa}ª etapa</Selo>
                <h3 className="mt-3 text-xl">{p.nome}</h3>
                <p className="mt-2 text-sm text-ink-dim">{p.descricao}</p>
                <p className="mt-3 text-sm text-ink">
                  <span className="text-ink-faint">Entrega: </span>
                  {p.entrega}
                </p>
                {comEnunciado[i] ? (
                  <Link
                    href={`/${slug}/projeto/${p.etapa}`}
                    className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Ler o enunciado e enviar →
                  </Link>
                ) : (
                  <p className="mt-4 text-sm text-ink-faint">
                    O enunciado é publicado no lançamento do projeto.
                  </p>
                )}
              </Cartao>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <TituloSecao
          sobretitulo="Composição"
          descricao="Cada instrumento vale de 0 a 10. A nota da etapa é a média ponderada deles, com os pesos abaixo."
        >
          Como a nota de cada etapa é formada
        </TituloSecao>
        <ul className="grid gap-4 sm:grid-cols-2">
          {regrasNota.etapas.map((e) => (
            <li key={e.etapa}>
              <Cartao className="h-full">
                <Selo tom="primary">{e.etapa}ª etapa</Selo>
                <ul className="mt-4 space-y-3">
                  {e.componentes.map((c) => (
                    <li key={c.id} className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-3 last:border-0">
                      <span>
                        <span className="block text-ink">{c.nome}</span>
                        <span className="block text-sm text-ink-dim">{c.detalhe}</span>
                      </span>
                      <span className="font-mono text-lg text-primary">{pct(c.peso)}</span>
                    </li>
                  ))}
                </ul>
              </Cartao>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-3xl text-sm text-ink-dim">
          <span className="font-medium text-ink">Exemplo, 1ª etapa:</span> portfólio 9,2, Raio-X
          parcial 7,0 e Raio-X final 8,0 dão{" "}
          <span className="font-mono">0,2 × 9,2 + 0,2 × 7,0 + 0,6 × 8,0 = 8,0</span>.
        </p>
      </section>

      <section id="portfolio" className="scroll-mt-24">
        <TituloSecao
          sobretitulo="Portfólio"
          descricao="O quiz da semana verifica a leitura e registra o que você observou no laboratório. Somados, os quizzes de uma etapa formam o portfólio."
        >
          Como os quizzes viram nota
        </TituloSecao>
        <ul className="grid gap-4 sm:grid-cols-2">
          <li>
            <Cartao className="h-full">
              <h3 className="text-lg">Cada quiz vale até 1 ponto</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-dim">
                <li>
                  <span className="font-mono text-ink">{decimal(portfolio.valorLeitura)}</span> pela
                  leitura: 2 de 3 acertos no <strong>primeiro</strong> envio.
                </li>
                <li>
                  <span className="font-mono text-ink">{decimal(portfolio.valorObservacoes)}</span>{" "}
                  pelas 3 observações, salvo se o professor as considerar insuficientes: genéricas,
                  copiadas ou sem ligação com o conceito.
                </li>
              </ul>
            </Cartao>
          </li>
          <li>
            <Cartao className="h-full">
              <h3 className="text-lg">
                {portfolio.descartaPiores === 1
                  ? "O pior quiz não conta"
                  : `Os ${portfolio.descartaPiores} piores quizzes não contam`}
              </h3>
              <p className="mt-3 text-sm text-ink-dim">
                Para cobrir uma falta ou um imprevisto. A nota é a média dos quizzes restantes, de 0 a
                10. Exemplo com 7 quizzes: cinco completos, um só com observações e um não enviado.
                O não enviado sai, e a nota fica{" "}
                <span className="font-mono">(5 + 0,5) ÷ 6 × 10 = 9,2</span>.
              </p>
            </Cartao>
          </li>
          <li className="sm:col-span-2">
            <Cartao>
              <h3 className="text-lg">Prazo</h3>
              <p className="mt-3 text-sm text-ink-dim">
                Cada quiz fica aberto até a quinta-feira seguinte ao encontro, às 23:59, véspera da
                próxima aula. O prazo aparece na página de cada quiz.
                {portfolio.prazosEspeciais.map((p) => (
                  <span key={p.prazo}>
                    {" "}
                    Excepcionalmente, os quizzes dos Encontros {p.encontros[0]} a{" "}
                    {p.encontros[p.encontros.length - 1]} ficam abertos até{" "}
                    {momentoCampus(p.prazo, true)}.
                  </span>
                ))}{" "}
                Depois do prazo o envio ainda é aceito, mas fica marcado como atrasado e só conta se
                o professor aceitar.
              </p>
            </Cartao>
          </li>
        </ul>
      </section>

      <section>
        <TituloSecao sobretitulo="Calendário">Os quatro momentos</TituloSecao>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-left">
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Nota</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Data</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Encontro</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Instrumento</th>
              </tr>
            </thead>
            <tbody>
              {conteudo.avaliacoes.map((a) => (
                <tr key={`${a.etapa}-${a.nota}`} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Selo tom={a.nota === "N2" ? "alert" : "primary"}>
                      {a.nota} · {a.etapa}ª
                    </Selo>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink">{dataExtensa(a.data)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${slug}/encontros/${a.encontro}`}
                      className="font-mono text-primary hover:underline"
                    >
                      {String(a.encontro).padStart(2, "0")}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-dim">{a.instrumento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <TituloSecao
          sobretitulo="Transparência"
          descricao="Você conhece os critérios antes de ser avaliado. Os pesos abaixo são a proposta em vigor e podem ser ajustados pelo professor — qualquer mudança é anunciada em aula antes da entrega."
        >
          Como os pontos são distribuídos
        </TituloSecao>

        <ul className="grid gap-4 sm:grid-cols-2">
          {regrasNota.rubricas.map((r) => (
            <li key={r.nota}>
              <Cartao className="h-full">
                <div className="flex items-center justify-between gap-3">
                  <Selo tom="alert">{r.nota}</Selo>
                  <span className="font-mono text-sm text-ink-dim">
                    {decimal(r.criterios.reduce((s, c) => s + c.peso, 0))} pts
                  </span>
                </div>
                <p className="mt-3 font-medium text-ink">{r.titulo}</p>
                <ul className="mt-3 space-y-2">
                  {r.criterios.map((c) => (
                    <li key={c.nome} className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-2 last:border-0">
                      <span className="text-ink">{c.nome}</span>
                      <span className="font-mono text-ink-dim">{decimal(c.peso)}</span>
                    </li>
                  ))}
                </ul>
              </Cartao>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm text-ink-faint">
          Os critérios da N1 da 2ª etapa, a prática avaliada, são apresentados antes do Encontro 12.
        </p>
      </section>

      <section>
        <TituloSecao sobretitulo="Contrato pedagógico">Regras que valem o semestre inteiro</TituloSecao>
        <ul className="grid gap-4 sm:grid-cols-2">
          {conteudo.regras.map((r) => (
            <li key={r.titulo}>
              <Cartao className="h-full">
                <h3 className="text-lg">{r.titulo}</h3>
                <p className="mt-1.5 text-sm text-ink-dim">{r.texto}</p>
              </Cartao>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
