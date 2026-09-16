"use client";

import { useEffect, useId, useState } from "react";
import { carregarTurma } from "@/lib/acoes-turma";
import type { AlunoDaLista } from "@/lib/turma";

/**
 * Identificação do aluno nos formulários do portal.
 *
 * Quando a turma está importada, o aluno **escolhe o nome numa lista** — some
 * a matrícula digitada errada, que é o erro que faz um envio não cair no
 * portfólio de ninguém. A lista traz só nome e um identificador opaco; é o
 * servidor que resolve a matrícula.
 *
 * Quem não está na lista (entrou depois, matrícula nova) continua podendo
 * digitar. E, se não houver lista nenhuma, o formulário é exatamente o de
 * antes — nada deixa de funcionar por causa disso.
 */

export type Identificacao = { alunoId: string | null; nome: string; matricula: string };

export const VAZIO: Identificacao = { alunoId: null, nome: "", matricula: "" };

/** `null` enquanto carrega; `[]` quando não há turma importada. */
export function useTurma(disciplina: string) {
  const [turma, setTurma] = useState<AlunoDaLista[] | null>(null);
  useEffect(() => {
    let atual = true;
    carregarTurma(disciplina)
      .then((lista) => atual && setTurma(lista))
      .catch(() => atual && setTurma([]));
    return () => {
      atual = false;
    };
  }, [disciplina]);
  return turma;
}

const ENTRADA =
  "mt-1.5 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-primary";

export function CampoAluno({
  turma,
  valor,
  aoMudar,
  rotulo = "Seu nome",
  compacto = false,
}: {
  turma: AlunoDaLista[] | null;
  valor: Identificacao;
  aoMudar: (v: Identificacao) => void;
  rotulo?: string;
  /** Na entrega em equipe, os campos ficam lado a lado e sem texto de apoio. */
  compacto?: boolean;
}) {
  const id = useId();
  const [digitando, setDigitando] = useState(false);
  const temLista = turma !== null && turma.length > 0;

  if (temLista && !digitando) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {rotulo}
        </label>
        <select
          id={id}
          value={valor.alunoId ?? ""}
          onChange={(e) => aoMudar({ alunoId: e.target.value || null, nome: "", matricula: "" })}
          required
          className={ENTRADA}
        >
          <option value="">Selecione na lista…</option>
          {turma.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setDigitando(true);
            aoMudar(VAZIO);
          }}
          className="mt-1.5 text-xs text-ink-dim underline underline-offset-2 hover:text-primary"
        >
          Não encontrei meu nome
        </button>
      </div>
    );
  }

  return (
    <div className={compacto ? "grid gap-3 sm:grid-cols-[1fr_11rem]" : "grid gap-4 sm:grid-cols-2"}>
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {rotulo === "Seu nome" ? "Nome completo" : rotulo}
        </label>
        <input
          id={id}
          value={valor.nome}
          onChange={(e) => aoMudar({ ...valor, alunoId: null, nome: e.target.value })}
          required
          autoComplete="name"
          className={ENTRADA}
        />
        {temLista && (
          <button
            type="button"
            onClick={() => {
              setDigitando(false);
              aoMudar(VAZIO);
            }}
            className="mt-1.5 text-xs text-ink-dim underline underline-offset-2 hover:text-primary"
          >
            Voltar para a lista
          </button>
        )}
      </div>
      <div>
        <label htmlFor={`${id}-m`} className="block text-sm font-medium text-ink">
          Matrícula
        </label>
        <input
          id={`${id}-m`}
          value={valor.matricula}
          onChange={(e) => aoMudar({ ...valor, alunoId: null, matricula: e.target.value })}
          required
          inputMode="numeric"
          autoComplete="off"
          className={ENTRADA}
        />
      </div>
    </div>
  );
}

/** Se o aluno já se identificou — serve para validar antes de enviar. */
export function identificado(v: Identificacao) {
  return Boolean(v.alunoId) || (v.nome.trim().length >= 3 && v.matricula.trim().length >= 4);
}
