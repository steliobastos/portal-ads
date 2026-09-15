import { DISCIPLINAS, DISCIPLINAS_ATIVAS, buscarDisciplina } from "./disciplinas";
import { ENCONTROS } from "./so/encontros";
import { AVALIACOES, ETAPAS, REGRAS, SEM_AULA, UNIDADES } from "./so/curso";
import { QUIZZES } from "./so/quizzes";
import { REGRAS_NOTA } from "./so/avaliacao";
import type { Avaliacao, Disciplina, Encontro, Quiz, RegrasNota, Unidade } from "./tipos";

export type ConteudoDisciplina = {
  disciplina: Disciplina;
  encontros: Encontro[];
  quizzes: Quiz[];
  regrasNota: RegrasNota;
  unidades: Unidade[];
  avaliacoes: Avaliacao[];
  etapas: typeof ETAPAS;
  semAula: typeof SEM_AULA;
  regras: typeof REGRAS;
};

/**
 * Mapa slug → conteúdo. É o único ponto do código que sabe quais disciplinas
 * existem: as rotas trabalham sempre em cima de `ConteudoDisciplina`.
 */
const CONTEUDO: Record<string, ConteudoDisciplina> = {
  so: {
    disciplina: buscarDisciplina("so")!,
    encontros: ENCONTROS,
    quizzes: QUIZZES,
    regrasNota: REGRAS_NOTA,
    unidades: UNIDADES,
    avaliacoes: AVALIACOES,
    etapas: ETAPAS,
    semAula: SEM_AULA,
    regras: REGRAS,
  },
};

export function conteudoDa(slug: string): ConteudoDisciplina | undefined {
  return CONTEUDO[slug];
}

export function quizDo(slug: string, numero: number): Quiz | undefined {
  return CONTEUDO[slug]?.quizzes.find((q) => q.encontro === numero);
}

/** Slugs que geram páginas — só disciplinas ativas e com conteúdo carregado. */
export function slugsPublicados(): string[] {
  return Object.keys(CONTEUDO).filter((s) => buscarDisciplina(s)?.ativa);
}

export { DISCIPLINAS, DISCIPLINAS_ATIVAS, buscarDisciplina };
