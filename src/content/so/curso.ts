import type { Avaliacao, Disciplina, Unidade } from "../tipos";

export const DISCIPLINA: Disciplina = {
  slug: "so",
  codigo: "ADS23",
  nome: "Sistemas Operacionais",
  curso: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
  campus: "IFCE — Campus Horizonte",
  professor: "José Stelio Sampaio Bastos Neto",
  periodo: "2026.2",
  cargaHoraria: "40h · 2 créditos · 30h teóricas / 10h práticas",
  encontrosInfo: "Sextas, 15:15–17:15 · Semana 0 + 17 encontros",
  ementaResumo:
    "Conceitos, arquitetura, processos, memória, entrada/saída e shell script — sempre pela pergunta que interessa a quem desenvolve: por que a aplicação trava, consome demais ou fica lenta, e como diagnosticar isso em Linux.",
  eixo:
    "Virtualização e containers (Docker) atravessam o curso: um container reúne processo, memória e E/S num artefato de uso diário.",
  ativa: true,
};

export const UNIDADES: Unidade[] = [
  {
    id: "I",
    titulo: "Visão geral e conceitos",
    calibragem:
      "Enxuta — o hardware entra só na medida em que explica gargalos de aplicação.",
  },
  {
    id: "II",
    titulo: "Arquitetura de sistemas operacionais",
    calibragem:
      "Panorama rápido de monolítico e micronúcleo; o peso vai para máquinas virtuais e containers.",
  },
  {
    id: "III",
    titulo: "Processos",
    calibragem:
      "Mantida forte, angulada para diagnóstico de produção e bugs de concorrência no código.",
  },
  {
    id: "IV",
    titulo: "Memória e entrada/saída",
    calibragem:
      "Operacional: vazamento, OOM, swap e limites em container. Sem algoritmos de substituição de página.",
  },
  {
    id: "VI",
    titulo: "Shell script",
    calibragem:
      "Elevada de status — é a competência mais empregável da ementa, e vira o capstone do semestre.",
  },
];

export const AVALIACOES: Avaliacao[] = [
  {
    nota: "N1",
    etapa: 1,
    // A data é a do prazo de envio; as equipes se formam no Encontro 6.
    data: "2026-09-25",
    encontro: 6,
    instrumento: "Raio-X parcial (seções 1 a 4), em equipe, enviado pelo portal",
  },
  {
    nota: "N2",
    etapa: 1,
    data: "2026-10-02",
    encontro: 8,
    instrumento: "Relatório Raio-X (duplas/trios) + defesa 5–6 min + container ao vivo",
  },
  {
    nota: "N1",
    etapa: 2,
    data: "2026-10-30",
    encontro: 12,
    instrumento: "Prática avaliada curta (~40 min) de memória e E/S",
  },
  {
    nota: "N2",
    etapa: 2,
    data: "2026-12-11",
    encontro: 17,
    instrumento: "Projeto final (toolkit + README) + apresentação de ~10 min",
  },
];

/** Datas sem aula dentro do período letivo. */
export const SEM_AULA = [
  { data: "2026-11-20", motivo: "Feriado nacional — Dia da Consciência Negra" },
];

export const ETAPAS = [
  { numero: 1 as const, periodo: "07/08 a 08/10", conteudo: "Onboarding + Unidades I, II e III" },
  { numero: 2 as const, periodo: "09/10 a 15/12", conteudo: "Unidades IV e VI + projeto integrador" },
];

/** Regras do contrato pedagógico que o aluno precisa saber desde o primeiro dia. */
export const REGRAS = [
  {
    titulo: "Frequência mínima de 75%",
    texto: "Exigência institucional. Como são 17 encontros, a margem é curta — controle as faltas.",
  },
  {
    titulo: "Segunda chamada",
    texto:
      "Existe para os quatro marcos de avaliação, com instrumento equivalente aplicado em data única.",
  },
  {
    titulo: "Leitura vira nota",
    texto:
      "Os quizzes semanais formam o portfólio, que vale 20% da nota de cada etapa. Nos relatórios e defesas, conecte a prática ao conceito lido — citando a seção, sem copiar o texto.",
  },
  {
    titulo: "Encontro 16 é amortecedor",
    texto:
      "Reservado para absorver conteúdo deslocado por imprevistos. Se nada atrasar, vira tempo extra de projeto.",
  },
];
