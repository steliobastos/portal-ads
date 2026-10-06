/**
 * Qual envio de quiz vale — função pura, sem banco, para poder ser testada.
 *
 * Regra: vale o acerto do **primeiro** envio (reenviar depois de ver as
 * justificativas não melhora a nota) e as observações do **último** (o aluno
 * pode voltar para completá-las).
 *
 * Envio que o professor desconsiderou no painel (`anulado_em` preenchido)
 * continua guardado e aparece no histórico, mas não conta: se era o primeiro,
 * o seguinte passa a ser o primeiro. Serve para envio de teste e para envio
 * feito por outra pessoa no nome do aluno.
 */

/** Uma linha de `submissoes_quiz`, como o painel a lê. */
export type EnvioQuiz = {
  id: number;
  encontro: number;
  matricula: string;
  nome: string;
  acertos: number;
  aprovado: boolean;
  observacoes: string[];
  enviado_em: string;
  anulado_em: string | null;
};

export type Consolidado = {
  /** A situação que conta, ou `null` se todos os envios foram desconsiderados. */
  valido: {
    acertos: number;
    aprovado: boolean;
    observacoes: string[];
    primeiroEnvio: string;
    ultimoEnvio: string;
  } | null;
  desconsiderados: number;
  historico: { id: number; enviadoEm: string; acertos: number; anulado: boolean }[];
  /** Envios com nomes diferentes na mesma matrícula — vale conferir. */
  nomesDivergentes: string[];
};

/** Os envios de um aluno num quiz, em ordem cronológica. */
export function consolidar(envios: EnvioQuiz[]): Consolidado {
  const validos = envios.filter((e) => !e.anulado_em);
  const primeiro = validos[0];
  const ultimo = validos[validos.length - 1];
  const nomes = [...new Set(envios.map((e) => e.nome.trim()))];

  return {
    valido: primeiro
      ? {
          acertos: primeiro.acertos,
          aprovado: primeiro.aprovado,
          observacoes: ultimo.observacoes,
          primeiroEnvio: primeiro.enviado_em,
          ultimoEnvio: ultimo.enviado_em,
        }
      : null,
    desconsiderados: envios.length - validos.length,
    historico: envios.map((e) => ({
      id: e.id,
      enviadoEm: e.enviado_em,
      acertos: e.acertos,
      anulado: Boolean(e.anulado_em),
    })),
    nomesDivergentes: nomes.length > 1 ? nomes : [],
  };
}
