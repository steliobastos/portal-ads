"use client";

import { useEffect, useId, useState } from "react";
import type { FaseEntrega, FormatoEntrega } from "@/content/tipos";
import { confirmarEntrega, prepararEntrega } from "@/lib/acoes-entrega";
import { FORMATOS, problemaNoArquivo } from "@/lib/arquivo-entrega";
import { momentoCampus } from "@/lib/datas";
import { CampoAluno, identificado, useTurma, VAZIO, type Identificacao } from "./identificacao";
import { cx } from "./ui";

type Entrega = { fase: FaseEntrega; nome: string; secoes: string; formato: FormatoEntrega; prazo: string };
type Recibo = { protocolo: number; enviadoEm: string; atrasado: boolean; nome: string };

/**
 * Envio do arquivo de uma entrega — relatório em PDF ou toolkit em .zip,
 * conforme `avaliacao.ts`. O arquivo vai direto do navegador para o
 * armazenamento privado, por uma URL assinada que o servidor gera — ver
 * `lib/acoes-entrega.ts` para o porquê dos dois tempos.
 *
 * Nada fica guardado no navegador: os computadores do laboratório são
 * compartilhados.
 */
export function EntregaRelatorio({
  disciplina,
  etapa,
  entregas,
}: {
  disciplina: string;
  etapa: 1 | 2;
  entregas: Entrega[];
}) {
  const [fase, setFase] = useState<FaseEntrega>(entregas[0].fase);
  const [equipe, setEquipe] = useState("");
  const turma = useTurma(disciplina);
  const [integrantes, setIntegrantes] = useState<Identificacao[]>([VAZIO, VAZIO]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [etapaEnvio, setEtapaEnvio] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const idArquivo = useId();

  // Pré-seleciona a primeira entrega cujo prazo ainda não passou. Só no
  // navegador: a página é estática e não sabe que dia é hoje.
  useEffect(() => {
    const aberta = entregas.find((e) => Date.now() <= new Date(e.prazo).getTime());
    if (aberta) setFase(aberta.fase);
  }, [entregas]);

  const escolhida = entregas.find((e) => e.fase === fase)!;
  const formato = FORMATOS[escolhida.formato];
  const enviando = etapaEnvio !== null;

  function mudarIntegrante(i: number, valor: Identificacao) {
    setIntegrantes((lista) => lista.map((p, j) => (j === i ? valor : p)));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setRecibo(null);

    if (!integrantes.every(identificado)) {
      return setErro("Identifique todos os integrantes da equipe.");
    }
    if (!arquivo) return setErro(`Escolha o arquivo (${formato.nome}).`);
    const problema = problemaNoArquivo(escolhida.formato, {
      nome: arquivo.name,
      tipo: arquivo.type,
      tamanho: arquivo.size,
    });
    if (problema) return setErro(problema);

    const dados = { disciplina, etapa, fase, equipe, integrantes };
    try {
      setEtapaEnvio("Conferindo a equipe…");
      const preparo = await prepararEntrega({
        ...dados,
        nome: arquivo.name,
        tamanho: arquivo.size,
        tipo: arquivo.type,
      });
      if (!preparo.ok) return setErro(preparo.erro);

      setEtapaEnvio("Enviando o arquivo…");
      const corpo = new FormData();
      corpo.append("cacheControl", "3600");
      // O bucket confere o tipo declarado aqui, então ele vai sempre explícito.
      corpo.append("", new Blob([arquivo], { type: formato.tipoEnvio }), `entrega.${formato.extensao}`);
      const resposta = await fetch(preparo.url, {
        method: "PUT",
        body: corpo,
        headers: { "x-upsert": "false" },
      });
      if (!resposta.ok) {
        return setErro(
          `O arquivo não pôde ser enviado. Confira se é ${formato.artigo} de até 15 MB e tente de novo.`,
        );
      }

      setEtapaEnvio("Registrando a entrega…");
      const final = await confirmarEntrega({ ...dados, caminho: preparo.caminho });
      if (!final.ok) return setErro(final.erro);

      setRecibo({ ...final, nome: escolhida.nome });
    } catch {
      setErro("A conexão falhou no meio do envio. Tente de novo.");
    } finally {
      setEtapaEnvio(null);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Qual entrega</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {entregas.map((e) => (
            <label
              key={e.fase}
              className={cx(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors",
                fase === e.fase ? "border-primary bg-primary-soft" : "border-line bg-card hover:border-primary-dim",
              )}
            >
              <input
                type="radio"
                name="fase"
                checked={fase === e.fase}
                onChange={() => setFase(e.fase)}
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span>
                <span className="block font-medium text-ink">{e.nome}</span>
                <span className="block text-ink-dim">
                  {e.secoes} · até {momentoCampus(e.prazo, true)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Campo rotulo="Nome da equipe" valor={equipe} aoMudar={setEquipe} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Integrantes (2 ou 3)</legend>
        <div className="space-y-3">
          {integrantes.map((p, i) => (
            <div key={i} className="rounded-xl border border-line bg-panel p-3">
              <CampoAluno
                turma={turma}
                valor={p}
                aoMudar={(v) => mudarIntegrante(i, v)}
                rotulo={`Integrante ${i + 1}`}
                compacto
              />
              {i === 2 && (
                <button
                  type="button"
                  onClick={() => setIntegrantes((l) => l.slice(0, 2))}
                  className="mt-2 text-sm text-alert hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
        {integrantes.length < 3 && (
          <button
            type="button"
            onClick={() => setIntegrantes((l) => [...l, VAZIO])}
            className="mt-2 text-sm text-primary hover:underline"
          >
            + Adicionar terceiro integrante
          </button>
        )}
      </fieldset>

      <div>
        <label htmlFor={idArquivo} className="block text-sm font-medium text-ink">
          Arquivo {formato.nome} (até 15 MB)
        </label>
        <input
          id={idArquivo}
          type="file"
          accept={[...formato.tiposAceitos, `.${formato.extensao}`].join(",")}
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="mt-1.5 block w-full text-sm text-ink-dim file:mr-3 file:rounded-lg file:border file:border-line file:bg-card file:px-3 file:py-2 file:text-sm file:text-ink"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {etapaEnvio ?? `Enviar ${escolhida.nome}`}
        </button>
        <p role="alert" aria-live="assertive" className="text-sm text-alert">
          {erro}
        </p>
      </div>

      {recibo && (
        <div role="status" className="rounded-2xl border border-secondary bg-secondary-soft p-5">
          <p className="font-mono text-xs tracking-[0.12em] text-ink-dim uppercase">Entrega registrada</p>
          <p className="mt-2 text-xl text-ink">
            {recibo.nome} · protocolo nº {recibo.protocolo}
          </p>
          <p className="mt-1 text-sm text-ink-dim">
            Recebido em {momentoCampus(recibo.enviadoEm, true)}. Anote o protocolo. Se precisar
            corrigir algo, é só enviar de novo: vale o envio mais recente.
          </p>
          {recibo.atrasado && (
            <p className="mt-2 text-sm text-alert">
              Esta entrega chegou depois do prazo e ficou marcada como atrasada.
            </p>
          )}
        </div>
      )}
    </form>
  );
}

function Campo({
  rotulo,
  valor,
  aoMudar,
  ...props
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {rotulo}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-primary"
        {...props}
      />
    </div>
  );
}
