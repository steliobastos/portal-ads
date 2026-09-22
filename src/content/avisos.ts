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
    data: "2026-09-22",
    titulo: "Raio-X: roteiro passo a passo para a entrega parcial",
    texto:
      "Se a sua equipe não sabe por onde começar, o roteiro mostra o caminho: três sessões de trabalho, como capturar as evidências sem retrabalho, o molde de uma evidência bem escrita e o que conferir antes de enviar. A parcial é só das seções 1 a 4.",
    etiqueta: "Avaliação",
    disciplina: "so",
    href: "/so/projeto/1/roteiro",
    fixado: true,
  },
  {
    data: "2026-09-15",
    titulo: "Raio-X: o enunciado do projeto da 1ª etapa está no ar",
    texto:
      "As equipes se formam no Encontro 6. A entrega parcial (seções 1 a 4) vale como N1 e é enviada em PDF pelo portal até sexta, 25/09, às 23:59. Os prazos, os critérios e o formulário de envio estão na página do projeto.",
    etiqueta: "Avaliação",
    disciplina: "so",
    href: "/so/projeto/1",
    fixado: true,
  },
  {
    data: "2026-09-15",
    titulo: "Quizzes funcionando — os dos Encontros 1 a 6 ficam abertos até 24/09",
    texto:
      "Os quizzes agora gravam as respostas de verdade, dentro do portal. Quem anotou as respostas dos primeiros encontros pode enviá-las até 24/09, às 23:59. Os quizzes formam o portfólio, que vale 20% da nota de cada etapa.",
    etiqueta: "Portal",
    disciplina: "so",
    href: "/so/avaliacao#portfolio",
  },
  {
    data: "2026-08-06",
    titulo: "O portal entrou no ar",
    texto:
      "Todo o material da disciplina passa a ficar aqui: slides, roteiros de laboratório e quizzes, encontro por encontro, junto com o cronograma e o mapa de leituras. O endereço é o mesmo o semestre inteiro — pode salvar.",
    etiqueta: "Portal",
    href: "/so/encontros",
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
    // Sem a data no texto de propósito: ela vive em `so/encontros.ts` e aparece
    // no cartão do encontro. Repetida aqui, sairia do ar na primeira remarcação.
    data: "2026-08-06",
    titulo: "Semana 0 — monte o ambiente antes da primeira aula",
    texto:
      "O onboarding é o próximo encontro. O roteiro cria a máquina virtual com Ubuntu 24.04 e instala o Docker. Quem chegar ao Encontro 1 com o ambiente de pé não perde a aula com instalação.",
    etiqueta: "Calendário",
    disciplina: "so",
    href: "/so/encontros/0",
    fixado: true,
  },
];

/** Avisos em ordem cronológica decrescente, os mais recentes primeiro. */
export function avisosRecentes(quantidade?: number): Aviso[] {
  const ordenados = [...AVISOS].sort((a, b) => b.data.localeCompare(a.data));
  return quantidade ? ordenados.slice(0, quantidade) : ordenados;
}
