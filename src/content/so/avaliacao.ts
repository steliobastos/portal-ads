import type { RegrasNota } from "../tipos";

/**
 * Como a nota de SO é composta — decidido pelo professor em 15/09/2026.
 *
 * Fonte única: a página de avaliação, a página do quiz, o formulário de entrega
 * do relatório e o painel do professor leem daqui. Mudar um peso ou um prazo é
 * mudar este arquivo, e tudo acompanha.
 *
 * Datas com horário levam o fuso do campus (-03:00, sem horário de verão): o
 * servidor da Vercel roda em UTC, e "23:59" sem fuso seria 20:59 em Horizonte.
 */
export const REGRAS_NOTA: RegrasNota = {
  etapas: [
    {
      etapa: 1,
      componentes: [
        { id: "portfolio", nome: "Portfólio de quizzes", peso: 0.2, detalhe: "Quizzes dos Encontros 1 a 7" },
        { id: "N1", nome: "Raio-X parcial", peso: 0.2, detalhe: "Seções 1 a 4, em equipe" },
        {
          id: "N2",
          nome: "Raio-X final + defesa + container",
          peso: 0.6,
          detalhe: "Seções 1 a 7, defesa de 5–6 min e container ao vivo",
        },
      ],
    },
    {
      etapa: 2,
      componentes: [
        { id: "portfolio", nome: "Portfólio de quizzes", peso: 0.2, detalhe: "Quizzes dos Encontros 9 a 14" },
        { id: "N1", nome: "Prática avaliada", peso: 0.3, detalhe: "~40 min de memória e E/S" },
        { id: "N2", nome: "Projeto final", peso: 0.5, detalhe: "Toolkit, README e apresentação" },
      ],
    },
  ],

  portfolio: {
    valorLeitura: 0.5,
    valorObservacoes: 0.5,
    descartaPiores: 1,
    // A regra geral é "fecha na quinta seguinte, 23:59". Os quizzes 1 a 6 não
    // gravavam nada até a Fase 3 — os alunos anotaram as respostas à parte —,
    // então ganham um prazo único para serem completados.
    prazosEspeciais: [
      { encontros: [1, 2, 3, 4, 5, 6], prazo: "2026-09-24T23:59:59-03:00" },
    ],
  },

  entregas: [
    {
      etapa: 1,
      fase: "parcial",
      nome: "Raio-X parcial",
      secoes: "seções 1 a 4",
      prazo: "2026-09-24T23:59:59-03:00",
    },
    {
      etapa: 1,
      fase: "final",
      nome: "Raio-X final",
      secoes: "seções 1 a 7",
      prazo: "2026-10-01T23:59:59-03:00",
    },
  ],

  rubricas: [
    {
      nota: "N1 · 1ª etapa",
      titulo: "Raio-X parcial",
      criterios: [
        { nome: "Cobertura: seções 1 a 4 presentes e completas", peso: 4 },
        { nome: "Evidência: comando + saída real da VM da equipe", peso: 3 },
        { nome: "Conexão prática ↔ conceito, com fonte citada", peso: 3 },
      ],
    },
    {
      nota: "N2 · 1ª etapa",
      titulo: "Raio-X final",
      criterios: [
        { nome: "Relatório Raio-X", peso: 4 },
        { nome: "Defesa oral (5–6 min)", peso: 3 },
        { nome: "Container ao vivo", peso: 2 },
        { nome: "Trabalho em equipe", peso: 1 },
      ],
    },
    {
      nota: "N2 · 2ª etapa",
      titulo: "Projeto final",
      criterios: [
        { nome: "Toolkit (os três scripts)", peso: 3.5 },
        { nome: "Demonstração ao vivo", peso: 2.5 },
        { nome: "README", peso: 2 },
        { nome: "Apresentação (~10 min)", peso: 1.5 },
        { nome: "Trabalho em equipe", peso: 0.5 },
      ],
    },
  ],
};
