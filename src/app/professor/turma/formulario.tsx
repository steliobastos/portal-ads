"use client";

import { useRef, useState, useTransition } from "react";
import { cx } from "@/components/ui";
import { importarTurma, type ResultadoImportacao } from "./acoes";

/**
 * Formulário da importação. Não usa `<form action>`: o React limpa os campos
 * depois de uma ação, e o arquivo escolhido precisa continuar no campo entre
 * "Conferir" e "Confirmar". Qualquer mudança no formulário descarta a prévia,
 * para não se confirmar uma prévia calculada sobre outro arquivo.
 */
export function FormularioTurma({
  disciplinas,
  turmaPadrao,
}: {
  disciplinas: { slug: string; nome: string }[];
  turmaPadrao: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [enviando, iniciar] = useTransition();

  function executar(acao: "conferir" | "gravar") {
    const dados = new FormData(formRef.current!);
    dados.set("acao", acao);
    iniciar(async () => setResultado(await importarTurma(dados)));
  }

  const previa = resultado?.ok && !resultado.gravado ? resultado : null;
  const campo = "rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink";

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        onChange={() => setResultado(null)}
        onSubmit={(e) => {
          e.preventDefault();
          executar("conferir");
        }}
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-panel p-5"
      >
        <label className="flex flex-col gap-1 text-xs text-ink-dim">
          Disciplina
          <select name="disciplina" className={campo} defaultValue={disciplinas[0]?.slug}>
            {disciplinas.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-dim">
          Turma
          <input name="turma" defaultValue={turmaPadrao} placeholder="ex.: 2026.2" className={cx(campo, "w-28")} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-dim">
          CSV exportado do diário
          <input name="arquivo" type="file" accept=".csv,text/csv" required className="text-sm text-ink" />
        </label>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl border border-primary px-4 py-2 text-sm text-primary hover:bg-primary-soft disabled:opacity-60"
        >
          {enviando && !previa ? "Conferindo…" : "Conferir"}
        </button>
      </form>

      {resultado && !resultado.ok && (
        <div role="alert" className="rounded-2xl border border-alert/30 bg-alert-soft p-5 text-sm text-ink">
          <p className="font-medium">{resultado.erro}</p>
          {resultado.problemas && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 font-mono text-xs">
              {resultado.problemas.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {resultado?.ok && (
        <div
          role="status"
          className={cx(
            "rounded-2xl border p-5 text-sm",
            resultado.gravado ? "border-secondary bg-secondary-soft" : "border-line bg-card",
          )}
        >
          <p className="font-medium text-ink">
            {resultado.gravado
              ? `Lista gravada: ${resultado.total} aluno(s). Os formulários do portal já mostram a lista nova.`
              : `O arquivo tem ${resultado.total} aluno(s). Nada foi gravado ainda — confira:`}
          </p>
          <ul className="mt-3 space-y-2">
            <Grupo titulo="Entram na lista" itens={resultado.novos.map((a) => a.nome)} />
            <Grupo titulo="Voltam para a lista" itens={resultado.voltam.map((a) => a.nome)} />
            <Grupo
              titulo="Mudam de nome"
              itens={resultado.renomeados.map((r) => `${r.de} → ${r.para}`)}
            />
            <Grupo
              titulo="Saem da lista (os envios continuam valendo)"
              itens={resultado.saem.map((a) => a.nome)}
              alerta
            />
            <li className="text-ink-dim">Sem mudança: {resultado.iguais}</li>
          </ul>

          {previa && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
              {previa.saem.length > previa.total / 2 && (
                <p className="w-full text-alert">
                  Mais da metade da turma sairia da lista. Confira se este é mesmo o arquivo e a
                  disciplina certos.
                </p>
              )}
              <button
                type="button"
                disabled={enviando}
                onClick={() => executar("gravar")}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {enviando ? "Gravando…" : "Confirmar importação"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Grupo({ titulo, itens, alerta }: { titulo: string; itens: string[]; alerta?: boolean }) {
  if (itens.length === 0) return null;
  return (
    <li>
      <p className={cx("font-medium", alerta ? "text-alert" : "text-ink-dim")}>
        {titulo}: {itens.length}
      </p>
      <p className="text-ink">{itens.join(" · ")}</p>
    </li>
  );
}
