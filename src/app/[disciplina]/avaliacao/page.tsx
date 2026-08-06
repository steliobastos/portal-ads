import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cartao, Selo, TituloSecao } from "@/components/ui";
import { conteudoDa } from "@/content";
import { dataExtensa } from "@/lib/datas";

type Props = { params: Promise<{ disciplina: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina } = await params;
  const conteudo = conteudoDa(disciplina);
  return conteudo ? { title: `Avaliação — ${conteudo.disciplina.nome}` } : {};
}

const PROJETO = [
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

const RUBRICAS = [
  {
    nota: "N2 · 1ª etapa",
    total: "10,0 pts",
    criterios: [
      { nome: "Relatório Raio-X", peso: "4,0" },
      { nome: "Defesa oral (5–6 min)", peso: "3,0" },
      { nome: "Container ao vivo", peso: "2,0" },
      { nome: "Trabalho em equipe", peso: "1,0" },
    ],
  },
  {
    nota: "N2 · 2ª etapa",
    total: "10,0 pts",
    criterios: [
      { nome: "Toolkit (os três scripts)", peso: "3,5" },
      { nome: "Demonstração ao vivo", peso: "2,5" },
      { nome: "README", peso: "2,0" },
      { nome: "Apresentação (~10 min)", peso: "1,5" },
      { nome: "Trabalho em equipe", peso: "0,5" },
    ],
  },
];

export default async function PaginaAvaliacao({ params }: Props) {
  const { disciplina: slug } = await params;
  const conteudo = conteudoDa(slug);
  if (!conteudo) notFound();

  return (
    <div className="space-y-14">
      <TituloSecao
        sobretitulo={conteudo.disciplina.codigo}
        descricao="Não há prova tradicional. A nota vem de um projeto integrador em duas etapas, com dois momentos de avaliação em cada uma — e o portfólio de quizzes semanais alimentando a N1."
      >
        Avaliação
      </TituloSecao>

      <section>
        <TituloSecao sobretitulo="O que você constrói">Projeto integrador</TituloSecao>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PROJETO.map((p) => (
            <li key={p.etapa}>
              <Cartao className="h-full">
                <Selo tom="primary">{p.etapa}ª etapa</Selo>
                <h3 className="mt-3 text-xl">{p.nome}</h3>
                <p className="mt-2 text-sm text-ink-dim">{p.descricao}</p>
                <p className="mt-3 text-sm text-ink">
                  <span className="text-ink-faint">Entrega: </span>
                  {p.entrega}
                </p>
              </Cartao>
            </li>
          ))}
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
          {RUBRICAS.map((r) => (
            <li key={r.nota}>
              <Cartao className="h-full">
                <div className="flex items-center justify-between gap-3">
                  <Selo tom="alert">{r.nota}</Selo>
                  <span className="font-mono text-sm text-ink-dim">{r.total}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {r.criterios.map((c) => (
                    <li key={c.nome} className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-2 last:border-0">
                      <span className="text-ink">{c.nome}</span>
                      <span className="font-mono text-ink-dim">{c.peso}</span>
                    </li>
                  ))}
                </ul>
              </Cartao>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm text-ink-faint">
          Os critérios detalhados de cada N1 são apresentados no encontro correspondente, junto com
          o instrumento.
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
