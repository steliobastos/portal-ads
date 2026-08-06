import type { Disciplina } from "./tipos";
import { DISCIPLINA as SO } from "./so/curso";

/**
 * Registro multi-disciplina.
 *
 * O portal nasce servindo Sistemas Operacionais, mas nenhuma rota assume
 * "disciplina única": adicionar Programação Web I, por exemplo, é acrescentar
 * uma entrada aqui e uma pasta em `src/content/`.
 */
export const DISCIPLINAS: Disciplina[] = [
  SO,
  {
    slug: "pweb1",
    codigo: "ADS—",
    nome: "Programação Web I",
    curso: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
    campus: "IFCE — Campus Horizonte",
    professor: "José Stelio Sampaio Bastos Neto",
    periodo: "a definir",
    cargaHoraria: "a definir",
    encontrosInfo: "a definir",
    ementaResumo: "Disciplina ainda não ofertada — o material será publicado aqui.",
    eixo: "",
    ativa: false,
  },
];

export function buscarDisciplina(slug: string): Disciplina | undefined {
  return DISCIPLINAS.find((d) => d.slug === slug);
}

export const DISCIPLINAS_ATIVAS = DISCIPLINAS.filter((d) => d.ativa);
