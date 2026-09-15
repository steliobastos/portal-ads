import type { Metadata } from "next";
import Link from "next/link";
import { cx } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { portfolioDaEtapa } from "@/lib/painel-quiz";
import type { CelulaPortfolio } from "@/lib/portfolio";
import { Moldura, exigirProfessor } from "../moldura";

export const metadata: Metadata = {
  title: "Portfólio · Área do professor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ disciplina?: string; etapa?: string }> };

export default async function PaginaPortfolio({ searchParams }: Props) {
  const acesso = await exigirProfessor();
  if ("bloqueio" in acesso) return acesso.bloqueio;

  const params = await searchParams;
  const slug = slugsPublicados().includes(params.disciplina ?? "")
    ? params.disciplina!
    : slugsPublicados()[0];
  const conteudo = conteudoDa(slug)!;
  const etapa = params.etapa === "2" ? 2 : 1;
  const regras = conteudo.regrasNota.portfolio;
  const peso = conteudo.regrasNota.etapas
    .find((e) => e.etapa === etapa)!
    .componentes.find((c) => c.id === "portfolio")!.peso;

  const { quizzes, linhas } = await portfolioDaEtapa(conteudo, etapa);
  const pendentes = linhas.reduce((s, l) => s + l.pendentes, 0);

  return (
    <Moldura aba="portfolio" email={acesso.email}>
      <nav aria-label="Etapas" className="mb-8 flex gap-1.5">
        {([1, 2] as const).map((e) => (
          <Link
            key={e}
            href={`/professor/portfolio?disciplina=${slug}&etapa=${e}`}
            aria-current={e === etapa ? "page" : undefined}
            className={cx(
              "rounded-lg border px-3 py-1.5 font-mono text-xs",
              e === etapa
                ? "border-primary bg-primary text-white"
                : "border-line bg-card text-ink-dim hover:border-primary-dim",
            )}
          >
            {e}ª etapa
          </Link>
        ))}
      </nav>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl">Portfólio da {etapa}ª etapa</h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-dim">
            Cada quiz vale {regras.valorLeitura} pela leitura + {regras.valorObservacoes} pelas
            observações. {regras.descartaPiores === 1 ? "O pior quiz é descartado" : `Os ${regras.descartaPiores} piores quizzes são descartados`}.
            Nota de 0 a 10, com peso {Math.round(peso * 100)}% na etapa.
            {pendentes > 0 && (
              <span className="text-alert">
                {" "}
                {pendentes} atraso(s) valem zero até você decidir, na aba Quizzes.
              </span>
            )}
          </p>
        </div>
        {linhas.length > 0 && (
          <a
            href={`/professor/exportar?disciplina=${slug}&etapa=${etapa}&tipo=portfolio`}
            className="rounded-xl border border-line bg-card px-4 py-2 text-sm text-ink hover:border-primary-dim hover:text-primary"
          >
            Baixar planilha (.csv)
          </a>
        )}
      </header>

      {linhas.length === 0 ? (
        <p className="text-ink-faint">Nenhum quiz desta etapa recebeu envio ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-left">
                <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Aluno</th>
                {quizzes.map((q) => (
                  <th key={q.encontro} scope="col" className="px-2 py-3 text-center font-mono text-xs font-medium text-ink-dim">
                    <Link href={`/professor?disciplina=${slug}&encontro=${q.encontro}`} className="hover:text-primary">
                      E{q.encontro}
                    </Link>
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-medium text-ink-dim">Nota</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.matricula} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-2.5">
                    <span className="block text-ink">{l.nome}</span>
                    <span className="font-mono text-xs text-ink-faint">{l.matricula}</span>
                  </td>
                  {l.celulas.map((c) => (
                    <td key={c.encontro} className="px-2 py-2.5 text-center">
                      <Celula celula={c} descartada={l.descartados.includes(c.encontro)} />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right font-mono text-base text-ink">
                    {l.nota.toFixed(1).replace(".", ",")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-faint">
        <span className="line-through">riscado</span> = descartado ·{" "}
        <span className="text-alert">!</span> = atrasado, aguardando decisão · — = sem envio
      </p>
    </Moldura>
  );
}

function Celula({ celula, descartada }: { celula: CelulaPortfolio; descartada: boolean }) {
  const texto =
    celula.situacao === "sem-envio"
      ? "—"
      : celula.situacao === "atrasado"
        ? "!"
        : celula.pontos.toFixed(1).replace(".", ",");

  const titulo = {
    "sem-envio": "sem envio",
    "no-prazo": `leitura ${celula.leitura} + observações ${celula.observacoes}`,
    atrasado: "atrasado — vale zero até o atraso ser aceito",
    "atraso-aceito": `atraso aceito · leitura ${celula.leitura} + observações ${celula.observacoes}`,
  }[celula.situacao];

  return (
    <span
      title={titulo}
      className={cx(
        "inline-block min-w-9 rounded-md px-1.5 py-0.5 font-mono text-xs",
        descartada && "line-through opacity-50",
        celula.situacao === "atrasado" && "bg-alert-soft font-semibold text-alert",
        celula.situacao !== "atrasado" && celula.pontos === 1 && "bg-secondary-soft text-secondary",
        celula.situacao !== "atrasado" && celula.pontos > 0 && celula.pontos < 1 && "bg-panel text-ink",
        celula.pontos === 0 && celula.situacao !== "atrasado" && "text-ink-faint",
      )}
    >
      {texto}
    </span>
  );
}
