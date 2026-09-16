"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { enviarQuiz } from "@/lib/acoes-quiz";
import type { Correcao, QuizPublico } from "@/lib/quiz";
import { acertosParaCredito } from "@/lib/quiz";
import { CampoAluno, identificado, useTurma, VAZIO, type Identificacao } from "./identificacao";
import { cx } from "./ui";

/**
 * As observações, guardadas no navegador com a mesma chave dos rascunhos do
 * roteiro (`roteiro:<encontro>:obs<n>`, ver `Rascunho` em aula-interativo.tsx).
 */
function useObservacoes(encontro: number, quantidade: number) {
  const chave = (i: number) => `roteiro:${encontro}:obs${i + 1}`;
  const [textos, setTextos] = useState<string[]>(() => Array(quantidade).fill(""));

  // Só depois da hidratação — no servidor não existe localStorage.
  useEffect(() => {
    try {
      setTextos(
        Array.from({ length: quantidade }, (_, i) =>
          window.localStorage.getItem(`roteiro:${encontro}:obs${i + 1}`) ?? "",
        ),
      );
    } catch {
      // armazenamento bloqueado: os campos só começam vazios
    }
  }, [encontro, quantidade]);

  function mudar(i: number, texto: string) {
    setTextos((atual) => atual.map((t, j) => (j === i ? texto : t)));
    try {
      window.localStorage.setItem(chave(i), texto);
    } catch {}
  }

  function apagar() {
    setTextos(Array(quantidade).fill(""));
    try {
      for (let i = 0; i < quantidade; i++) window.localStorage.removeItem(chave(i));
    } catch {}
  }

  return [textos, mudar, apagar] as const;
}

/**
 * O quiz semanal: 3 perguntas de leitura + 3 observações de laboratório, num
 * envio só.
 *
 * Quem o aluno é não fica guardado no navegador de propósito: ele responde nos
 * computadores do laboratório, que são compartilhados. As observações, sim —
 * elas usam a mesma chave dos rascunhos do roteiro, então o que foi escrito
 * durante a prática já chega preenchido aqui.
 */
export function FormularioQuiz({
  disciplina,
  quiz,
  prazo,
}: {
  disciplina: string;
  quiz: QuizPublico;
  /** Instante ISO, com fuso. */
  prazo: string;
}) {
  // A página é estática, gerada no deploy: se o prazo passou, só o navegador
  // sabe. Calculado depois da hidratação para não divergir do HTML do servidor.
  const [encerrado, setEncerrado] = useState(false);
  useEffect(() => setEncerrado(Date.now() > new Date(prazo).getTime()), [prazo]);
  const [atrasado, setAtrasado] = useState(false);
  const turma = useTurma(disciplina);
  const [aluno, setAluno] = useState<Identificacao>(VAZIO);
  const [respostas, setRespostas] = useState<(number | null)[]>(quiz.perguntas.map(() => null));
  const [erro, setErro] = useState<string | null>(null);
  const [correcao, setCorrecao] = useState<Correcao | null>(null);
  const [enviando, iniciar] = useTransition();
  const resultadoRef = useRef<HTMLDivElement>(null);

  const [observacoes, mudarObservacao, apagarObservacoes] = useObservacoes(
    quiz.encontro,
    quiz.observacoes.length,
  );

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!identificado(aluno)) return setErro("Diga quem você é antes de enviar.");
    const faltando = respostas.findIndex((r) => r === null);
    if (faltando >= 0) return setErro(`Responda a pergunta ${faltando + 1}.`);
    const curta = quiz.observacoes.findIndex((o, i) => observacoes[i].trim().length < o.minimo);
    if (curta >= 0) {
      return setErro(
        `A observação ${curta + 1} precisa de pelo menos ${quiz.observacoes[curta].minimo} caracteres.`,
      );
    }

    iniciar(async () => {
      const resultado = await enviarQuiz({
        disciplina,
        encontro: quiz.encontro,
        ...aluno,
        respostas: respostas as number[],
        observacoes,
      });
      if (!resultado.ok) return setErro(resultado.erro);
      setCorrecao(resultado.correcao);
      setAtrasado(resultado.atrasado);
      requestAnimationFrame(() =>
        resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    });
  }

  return (
    <form onSubmit={enviar} className="space-y-10" noValidate>
      {encerrado && !correcao && (
        <div className="rounded-2xl border border-alert/30 bg-alert-soft p-5 text-sm text-ink">
          <p className="font-medium">O prazo deste quiz terminou.</p>
          <p className="mt-1 text-ink-dim">
            Você ainda pode enviar, mas o envio fica marcado como atrasado e só entra no portfólio
            se o professor aceitar.
          </p>
        </div>
      )}

      <div ref={resultadoRef} className="scroll-mt-6">
        {correcao && (
          <Resultado correcao={correcao} atrasado={atrasado} aoApagar={apagarObservacoes} />
        )}
      </div>

      <fieldset className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        <legend className="px-1 font-mono text-xs tracking-[0.12em] text-primary uppercase">
          Identificação
        </legend>
        <CampoAluno turma={turma} valor={aluno} aoMudar={setAluno} />
      </fieldset>

      <section>
        <h2 className="mb-1 text-xl">Verificação de leitura</h2>
        <p className="mb-5 text-sm text-ink-dim">
          {acertosParaCredito(quiz.perguntas.length)} de {quiz.perguntas.length} acertos já dão
          crédito no portfólio. Não é prova: é para você conferir se a leitura ficou.
        </p>
        <ol className="space-y-5">
          {quiz.perguntas.map((p, i) => (
            <Pergunta
              key={i}
              numero={i + 1}
              enunciado={p.enunciado}
              alternativas={p.alternativas}
              marcada={respostas[i]}
              correcao={correcao?.porPergunta[i]}
              aoMarcar={(alt) =>
                setRespostas((atual) => atual.map((r, j) => (j === i ? alt : r)))
              }
            />
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-1 text-xl">Observações do laboratório</h2>
        <p className="mb-5 text-sm text-ink-dim">
          Se você rascunhou no roteiro deste encontro, o texto já está aqui. Conecte o comando ao
          conceito — não descreva só o que apareceu na tela.
        </p>
        <div className="space-y-5">
          {quiz.observacoes.map((o, i) => (
            <Observacao
              key={i}
              numero={i + 1}
              enunciado={o.enunciado}
              minimo={o.minimo}
              texto={observacoes[i]}
              aoMudar={(texto) => mudarObservacao(i, texto)}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {enviando ? "Enviando…" : correcao ? "Reenviar" : "Enviar respostas"}
        </button>
        <p role="alert" aria-live="assertive" className="text-sm text-alert">
          {erro}
        </p>
      </div>
    </form>
  );
}

function Resultado({
  correcao,
  atrasado,
  aoApagar,
}: {
  correcao: Correcao;
  atrasado: boolean;
  aoApagar: () => void;
}) {
  const [apagado, setApagado] = useState(false);

  return (
    <div
      role="status"
      className={cx(
        "rounded-2xl border p-5 sm:p-6",
        correcao.aprovado ? "border-secondary bg-secondary-soft" : "border-alert/30 bg-alert-soft",
      )}
    >
      <p className="font-mono text-xs tracking-[0.12em] text-ink-dim uppercase">Envio registrado</p>
      <p className="mt-2 text-2xl text-ink">
        {correcao.acertos} de {correcao.total} acertos
        {correcao.aprovado ? " — crédito no portfólio ✓" : " — ainda sem crédito"}
      </p>
      <p className="mt-2 text-sm text-ink-dim">
        As justificativas estão abaixo de cada pergunta. Vale o acerto do seu{" "}
        <strong>primeiro</strong> envio; se precisar completar as observações, pode reenviar — delas,
        vale a versão mais recente.
      </p>
      {atrasado && (
        <p className="mt-2 text-sm text-alert">
          Este envio chegou depois do prazo: ele fica registrado, mas só entra no portfólio se o
          professor aceitar o atraso.
        </p>
      )}
      <p className="mt-3 text-sm text-ink-dim">
        Está num computador compartilhado?{" "}
        <button
          type="button"
          onClick={() => {
            aoApagar();
            setApagado(true);
          }}
          className="text-primary underline underline-offset-2 hover:no-underline"
        >
          Apagar minhas observações deste navegador
        </button>
        {apagado && <span className="ml-2 text-secondary">apagadas.</span>}
      </p>
    </div>
  );
}

function Pergunta({
  numero,
  enunciado,
  alternativas,
  marcada,
  correcao,
  aoMarcar,
}: {
  numero: number;
  enunciado: string;
  alternativas: string[];
  marcada: number | null;
  correcao?: Correcao["porPergunta"][number];
  aoMarcar: (alternativa: number) => void;
}) {
  const nome = useId();
  const corrigida = correcao !== undefined;

  return (
    <li className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <fieldset disabled={corrigida}>
        <legend className="mb-3">
          <span className="block font-mono text-xs text-ink-faint">Pergunta {numero}</span>
          <span className="mt-1 block font-medium text-ink">{enunciado}</span>
        </legend>

        <div className="space-y-2">
          {alternativas.map((alt, i) => {
            const certa = corrigida && i === correcao.correta;
            const errada = corrigida && i === correcao.marcada && i !== correcao.correta;
            return (
              <label
                key={i}
                className={cx(
                  "flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
                  !corrigida && "cursor-pointer hover:border-primary-dim",
                  certa && "border-secondary bg-secondary-soft text-ink",
                  errada && "border-alert/40 bg-alert-soft text-ink",
                  !certa && !errada && marcada === i && "border-primary bg-primary-soft text-ink",
                  !certa && !errada && marcada !== i && "border-line text-ink-dim",
                )}
              >
                <input
                  type="radio"
                  name={nome}
                  checked={marcada === i}
                  onChange={() => aoMarcar(i)}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span>
                  {alt}
                  {certa && <span className="ml-2 font-mono text-xs text-secondary">✓ correta</span>}
                  {errada && <span className="ml-2 font-mono text-xs text-alert">✕ sua resposta</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {corrigida && (
        <p className="mt-4 rounded-lg bg-panel p-3 text-sm text-ink-dim">
          <span className="font-medium text-ink">Por quê: </span>
          {correcao.justificativa}
        </p>
      )}
    </li>
  );
}

function Observacao({
  numero,
  enunciado,
  minimo,
  texto,
  aoMudar,
}: {
  numero: number;
  enunciado: string;
  minimo: number;
  texto: string;
  aoMudar: (v: string) => void;
}) {
  const id = useId();
  const tamanho = texto.trim().length;

  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <label htmlFor={id} className="block">
        <span className="block font-mono text-xs text-ink-faint">Observação {numero}</span>
        <span className="mt-1 block font-medium text-ink">{enunciado}</span>
      </label>
      <textarea
        id={id}
        value={texto}
        onChange={(e) => aoMudar(e.target.value)}
        rows={4}
        className="mt-3 w-full resize-y rounded-lg border border-line bg-panel p-3 text-sm text-ink focus:border-primary"
      />
      <p
        className={cx(
          "mt-1 text-right font-mono text-[11.5px]",
          tamanho >= minimo ? "text-secondary" : "text-ink-faint",
        )}
      >
        {tamanho} / {minimo} caracteres
      </p>
    </div>
  );
}
