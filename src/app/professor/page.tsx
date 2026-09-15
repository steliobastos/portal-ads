import type { Metadata } from "next";
import Link from "next/link";
import { Selo, cx } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { momentoCampus, situacao } from "@/lib/datas";
import { situacaoDoEncontro, type SituacaoAluno } from "@/lib/painel-quiz";
import { prazoDoQuiz } from "@/lib/portfolio";
import { marcar } from "./acoes";
import { Moldura, exigirProfessor } from "./moldura";

export const metadata: Metadata = {
  title: "Área do professor",
  robots: { index: false, follow: false },
};

// Sem isto, um build feito sem as variáveis do Supabase congelaria a tela de
// "não configurado" como página estática — nunca chegaria a ler a sessão.
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ disciplina?: string; encontro?: string }> };

export default async function PaginaQuizzes({ searchParams }: Props) {
  const acesso = await exigirProfessor();
  if ("bloqueio" in acesso) return acesso.bloqueio;

  const params = await searchParams;
  const slug = slugsPublicados().includes(params.disciplina ?? "")
    ? params.disciplina!
    : slugsPublicados()[0];
  const conteudo = conteudoDa(slug)!;
  const comQuiz = conteudo.encontros.filter((e) =>
    conteudo.quizzes.some((q) => q.encontro === e.numero),
  );

  // Sem escolha explícita, abre no quiz mais recente cuja aula já aconteceu.
  const padrao = comQuiz.findLast((e) => situacao(e.data) === "concluido") ?? comQuiz[0];
  const encontro = comQuiz.find((e) => String(e.numero) === params.encontro) ?? padrao;
  const quiz = conteudo.quizzes.find((q) => q.encontro === encontro.numero)!;
  const prazo = prazoDoQuiz(conteudo, encontro.numero);

  const alunos = await situacaoDoEncontro(conteudo, encontro.numero);
  const comCredito = alunos.filter((a) => a.aprovado).length;
  const atrasosPendentes = alunos.filter((a) => a.atrasado && !a.atrasoAceito).length;

  return (
    <Moldura aba="quizzes" email={acesso.email}>
      <nav aria-label="Encontros com quiz" className="mb-8 flex flex-wrap gap-1.5">
        {comQuiz.map((e) => (
          <Link
            key={e.numero}
            href={`/professor?disciplina=${slug}&encontro=${e.numero}`}
            aria-current={e.numero === encontro.numero ? "page" : undefined}
            className={cx(
              "rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors",
              e.numero === encontro.numero
                ? "border-primary bg-primary text-white"
                : "border-line bg-card text-ink-dim hover:border-primary-dim",
            )}
          >
            Enc. {e.numero}
          </Link>
        ))}
      </nav>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl">
            Encontro {encontro.numero} · {encontro.titulo}
          </h2>
          <p className="mt-1 text-sm text-ink-dim">
            Prazo: {momentoCampus(prazo, true)} · {alunos.length}{" "}
            {alunos.length === 1 ? "aluno enviou" : "alunos enviaram"} · {comCredito} com crédito
            na leitura
            {atrasosPendentes > 0 && (
              <span className="text-alert"> · {atrasosPendentes} atraso(s) aguardando decisão</span>
            )}
          </p>
        </div>
        {alunos.length > 0 && (
          <a
            href={`/professor/exportar?disciplina=${slug}&encontro=${encontro.numero}`}
            className="rounded-xl border border-line bg-card px-4 py-2 text-sm text-ink hover:border-primary-dim hover:text-primary"
          >
            Baixar planilha (.csv)
          </a>
        )}
      </header>

      <p className="mb-6 text-sm text-ink-faint">
        Acertos contam do primeiro envio; observações, do último. Observações ficam aceitas até você
        marcá-las como insuficientes. Atraso é medido pelo primeiro envio e só conta se você aceitar.
      </p>

      {alunos.length === 0 ? (
        <p className="text-ink-faint">Nenhum envio para este encontro ainda.</p>
      ) : (
        <ul className="space-y-3">
          {alunos.map((a) => (
            <li key={a.matricula}>
              <details className="rounded-xl border border-line bg-card">
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{a.nome}</span>
                    <span className="font-mono text-xs text-ink-faint">{a.matricula}</span>
                  </span>
                  <Selo tom={a.aprovado ? "secondary" : "alert"}>
                    {a.acertos}/{quiz.perguntas.length}
                  </Selo>
                  {a.observacoesInsuficientes && <Selo tom="alert">obs. insuficientes</Selo>}
                  {a.atrasado && (
                    <Selo tom={a.atrasoAceito ? "neutro" : "alert"}>
                      {a.atrasoAceito ? "atraso aceito" : "atrasado"}
                    </Selo>
                  )}
                  {a.envios > 1 && <Selo>{a.envios} envios</Selo>}
                  {a.nomesDivergentes.length > 0 && <Selo tom="alert">nomes diferentes</Selo>}
                  <span className="font-mono text-xs text-ink-faint">
                    {momentoCampus(a.ultimoEnvio)}
                  </span>
                </summary>

                <div className="space-y-4 border-t border-line p-4">
                  {a.nomesDivergentes.length > 0 && (
                    <p className="text-sm text-alert">
                      Envios desta matrícula com nomes diferentes: {a.nomesDivergentes.join(" · ")}
                    </p>
                  )}
                  {quiz.observacoes.map((o, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium text-ink-dim">
                        {i + 1}. {o.enunciado}
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-wrap text-ink">{a.observacoes[i]}</p>
                    </div>
                  ))}
                  <p className="font-mono text-xs text-ink-faint">
                    primeiro envio {momentoCampus(a.primeiroEnvio)}
                    {a.envios > 1 && ` · último ${momentoCampus(a.ultimoEnvio)}`}
                  </p>

                  <div className="flex flex-wrap gap-2 border-t border-line-soft pt-4">
                    <BotaoMarca
                      aluno={a}
                      slug={slug}
                      encontro={encontro.numero}
                      campo="observacoes"
                      ativo={a.observacoesInsuficientes}
                      ligar="Marcar observações como insuficientes"
                      desligar="Aceitar as observações"
                    />
                    {a.atrasado && (
                      <BotaoMarca
                        aluno={a}
                        slug={slug}
                        encontro={encontro.numero}
                        campo="atraso"
                        ativo={a.atrasoAceito}
                        ligar="Aceitar o atraso"
                        desligar="Recusar o atraso"
                      />
                    )}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Moldura>
  );
}

function BotaoMarca({
  aluno,
  slug,
  encontro,
  campo,
  ativo,
  ligar,
  desligar,
}: {
  aluno: SituacaoAluno;
  slug: string;
  encontro: number;
  campo: "observacoes" | "atraso";
  ativo: boolean;
  ligar: string;
  desligar: string;
}) {
  return (
    <form action={marcar}>
      <input type="hidden" name="disciplina" value={slug} />
      <input type="hidden" name="encontro" value={encontro} />
      <input type="hidden" name="matricula" value={aluno.matricula} />
      <input type="hidden" name="campo" value={campo} />
      <input type="hidden" name="valor" value={String(!ativo)} />
      <button
        type="submit"
        className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs text-ink-dim hover:border-primary-dim hover:text-primary"
      >
        {ativo ? desligar : ligar}
      </button>
    </form>
  );
}
