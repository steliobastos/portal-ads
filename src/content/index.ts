import { DISCIPLINAS, DISCIPLINAS_ATIVAS, buscarDisciplina } from "./disciplinas";
import { ENCONTROS } from "./so/encontros";
import { AVALIACOES, ETAPAS, REGRAS, SEM_AULA, UNIDADES } from "./so/curso";
import type { Avaliacao, Disciplina, Encontro, Unidade } from "./tipos";

export type ConteudoDisciplina = {
  disciplina: Disciplina;
  encontros: Encontro[];
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

/** Slugs que geram páginas — só disciplinas ativas e com conteúdo carregado. */
export function slugsPublicados(): string[] {
  return Object.keys(CONTEUDO).filter((s) => buscarDisciplina(s)?.ativa);
}

export { DISCIPLINAS, DISCIPLINAS_ATIVAS, buscarDisciplina };
