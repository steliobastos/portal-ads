import { MATERIAIS } from "@/content/materiais.gerado";
import type { ArquivoMaterial, TipoMaterial } from "@/content/tipos";
import { cx } from "./ui";

const ROTULOS: Record<TipoMaterial, { nome: string; explicacao: string; icone: string }> = {
  slide: {
    nome: "Slides do encontro",
    explicacao: "A apresentação usada em aula — reveja quando quiser.",
    icone: "▤",
  },
  roteiro: {
    nome: "Roteiro de laboratório",
    explicacao: "Os comandos passo a passo, com dicas para quando travar.",
    icone: "⌘",
  },
  guia: {
    nome: "Guia do encontro",
    explicacao: "O que fazer no dia, checklist e critérios.",
    icone: "◈",
  },
  quiz: {
    nome: "Quiz da semana",
    explicacao: "Verificação de leitura + suas observações de laboratório.",
    icone: "✓",
  },
  outro: { nome: "Material de apoio", explicacao: "", icone: "•" },
};

export function materiaisDo(disciplina: string, pasta: string): ArquivoMaterial[] {
  return MATERIAIS[`${disciplina}/${pasta}`] ?? [];
}

export function ListaMateriais({
  arquivos,
  compacto = false,
}: {
  arquivos: ArquivoMaterial[];
  compacto?: boolean;
}) {
  if (arquivos.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        O material deste encontro será publicado antes da aula.
      </p>
    );
  }

  return (
    <ul className={cx("grid gap-3", !compacto && "sm:grid-cols-2")}>
      {arquivos.map((a) => {
        const r = ROTULOS[a.tipo];
        return (
          <li key={a.href}>
            <a
              href={a.href}
              className="group flex h-full items-start gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-primary-dim"
            >
              <span
                aria-hidden
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft font-mono text-primary"
              >
                {r.icone}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-ink group-hover:text-primary">
                  {r.nome}
                </span>
                {!compacto && r.explicacao && (
                  <span className="mt-0.5 block text-sm text-ink-dim">{r.explicacao}</span>
                )}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
