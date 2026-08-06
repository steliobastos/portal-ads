/**
 * Avisos do portal — o que mudou e o que o aluno precisa saber agora.
 *
 * Esta lista é editada à mão pelo professor: acrescentar um aviso é acrescentar
 * um objeto no topo e dar `git push`. Deliberadamente não vive no banco — aviso
 * é conteúdo público e versionado, não dado privado de aluno.
 *
 * Mantenha em ordem decrescente de data (o mais recente primeiro).
 */

export type Aviso = {
  /** ISO (AAAA-MM-DD) — a data em que o aviso passa a valer. */
  data: string;
  titulo: string;
  texto: string;
  /** Etiqueta curta: "Material", "Calendário", "Avaliação", "Portal". */
  etiqueta: string;
  /** Slug da disciplina, quando o aviso é de uma só. */
  disciplina?: string;
  /** Para onde o aviso leva, se houver algo para abrir. */
  href?: string;
  /** Avisos marcados aparecem em destaque na home até a data passar. */
  fixado?: boolean;
};

export const AVISOS: Aviso[] = [
  {
    data: "2026-08-06",
    titulo: "O portal entrou no ar",
    texto:
      "Todo o material da disciplina passa a ficar aqui: slides, roteiros de laboratório e quizzes, encontro por encontro, junto com o cronograma e o mapa de leituras. O endereço é o mesmo o semestre inteiro — pode salvar.",
    etiqueta: "Portal",
    href: "/so/encontros",
    fixado: true,
  },
  {
    data: "2026-08-06",
    titulo: "Material dos 17 encontros já publicado",
    texto:
      "Não é preciso esperar a semana da aula: o material de todos os encontros já está disponível. Quem quiser adiantar leitura ou laboratório, pode.",
    etiqueta: "Material",
    disciplina: "so",
    href: "/so/encontros",
  },
  {
    data: "2026-08-04",
    titulo: "Semana 0 — monte o ambiente antes da primeira aula",
    texto:
      "O roteiro de onboarding cria a máquina virtual com Ubuntu 24.04 e instala o Docker. Quem chegar ao Encontro 1 com o ambiente de pé não perde a aula com instalação.",
    etiqueta: "Calendário",
    disciplina: "so",
    href: "/so/encontros/0",
  },
];

/** Avisos em ordem cronológica decrescente, os mais recentes primeiro. */
export function avisosRecentes(quantidade?: number): Aviso[] {
  const ordenados = [...AVISOS].sort((a, b) => b.data.localeCompare(a.data));
  return quantidade ? ordenados.slice(0, quantidade) : ordenados;
}
