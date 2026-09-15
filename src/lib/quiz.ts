import type { Quiz } from "@/content/tipos";

/**
 * Regras do quiz semanal — funções puras, sem banco nem React, para poderem ser
 * testadas isoladamente (Fase 4).
 */

/** Critério binário decidido para o portfólio: 2 de 3 acertos = crédito. */
export function acertosParaCredito(totalPerguntas: number): number {
  return Math.ceil((totalPerguntas * 2) / 3);
}

/**
 * O quiz como o navegador pode vê-lo: sem gabarito e sem justificativa.
 *
 * O conteúdo está num repositório público, então isso não é segredo de
 * verdade — é a arquitetura certa mesmo assim. A página não entrega a resposta
 * junto com a pergunta, e a correção acontece só no servidor, que é quem grava
 * a nota.
 */
export function quizPublico(quiz: Quiz) {
  return {
    encontro: quiz.encontro,
    leituras: quiz.leituras,
    perguntas: quiz.perguntas.map(({ enunciado, alternativas }) => ({ enunciado, alternativas })),
    observacoes: quiz.observacoes,
  };
}

export type QuizPublico = ReturnType<typeof quizPublico>;

export type Correcao = {
  acertos: number;
  total: number;
  aprovado: boolean;
  porPergunta: { marcada: number; correta: number; justificativa: string }[];
};

export function corrigir(quiz: Quiz, respostas: number[]): Correcao {
  const porPergunta = quiz.perguntas.map((p, i) => ({
    marcada: respostas[i],
    correta: p.correta,
    justificativa: p.justificativa,
  }));
  const acertos = porPergunta.filter((p) => p.marcada === p.correta).length;
  const total = quiz.perguntas.length;
  return { acertos, total, aprovado: acertos >= acertosParaCredito(total), porPergunta };
}

/** Por que um envio não pode ser aceito, ou `null` se está completo. */
export function problemaNoEnvio(
  quiz: Quiz,
  respostas: number[],
  observacoes: string[],
): string | null {
  if (respostas.length !== quiz.perguntas.length) return "Responda todas as perguntas.";
  for (const [i, r] of respostas.entries()) {
    if (!Number.isInteger(r) || r < 0 || r >= quiz.perguntas[i].alternativas.length) {
      return `Responda a pergunta ${i + 1}.`;
    }
  }
  if (observacoes.length !== quiz.observacoes.length) return "Preencha todas as observações.";
  for (const [i, o] of quiz.observacoes.entries()) {
    if (observacoes[i].trim().length < o.minimo) {
      return `A observação ${i + 1} precisa de pelo menos ${o.minimo} caracteres.`;
    }
  }
  return null;
}
