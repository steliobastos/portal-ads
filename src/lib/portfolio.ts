import type { ConteudoDisciplina } from "@/content";

/**
 * O portfólio de quizzes — funções puras, sem banco, para poderem ser testadas
 * isoladamente (Fase 4). As regras vêm de `regrasNota.portfolio`.
 */

/** Fuso do campus. Fortaleza não tem horário de verão, então o deslocamento é fixo. */
const FUSO = "-03:00";

/**
 * Até quando o quiz de um encontro recebe envio no prazo: a quinta-feira
 * seguinte, 23:59 — a véspera do próximo encontro —, salvo prazo especial.
 */
export function prazoDoQuiz(conteudo: ConteudoDisciplina, encontro: number): string {
  const especial = conteudo.regrasNota.portfolio.prazosEspeciais.find((p) =>
    p.encontros.includes(encontro),
  );
  if (especial) return especial.prazo;

  const data = conteudo.encontros.find((e) => e.numero === encontro)!.data;
  const [ano, mes, dia] = data.split("-").map(Number);
  const quinta = new Date(Date.UTC(ano, mes - 1, dia + 6));
  return `${quinta.toISOString().slice(0, 10)}T23:59:59${FUSO}`;
}

export function passouDoPrazo(prazo: string, momento: string | Date = new Date()): boolean {
  return new Date(momento).getTime() > new Date(prazo).getTime();
}

/** Os quizzes que compõem o portfólio de uma etapa, na ordem dos encontros. */
export function quizzesDaEtapa(conteudo: ConteudoDisciplina, etapa: 1 | 2) {
  return conteudo.quizzes.filter(
    (q) => conteudo.encontros.find((e) => e.numero === q.encontro)?.etapa === etapa,
  );
}

export type SituacaoQuiz = "sem-envio" | "no-prazo" | "atrasado" | "atraso-aceito";

export type CelulaPortfolio = {
  encontro: number;
  situacao: SituacaoQuiz;
  leitura: number;
  observacoes: number;
  pontos: number;
};

/**
 * Quanto um quiz vale para um aluno.
 *
 * O atraso é medido pelo **primeiro** envio, o mesmo que define o acerto: é a
 * verificação de leitura que tem data. Reenvio só para completar observações
 * não transforma um quiz entregue no prazo em atrasado.
 */
export function celulaDoQuiz(
  regras: ConteudoDisciplina["regrasNota"]["portfolio"],
  quiz: { encontro: number; prazo: string },
  envio?: { primeiroEnvio: string; aprovado: boolean },
  marca?: { observacoesInsuficientes: boolean; atrasoAceito: boolean },
): CelulaPortfolio {
  if (!envio) {
    return { encontro: quiz.encontro, situacao: "sem-envio", leitura: 0, observacoes: 0, pontos: 0 };
  }

  const atrasado = passouDoPrazo(quiz.prazo, envio.primeiroEnvio);
  const situacao: SituacaoQuiz = !atrasado
    ? "no-prazo"
    : marca?.atrasoAceito
      ? "atraso-aceito"
      : "atrasado";

  // Atraso ainda não aceito vale zero — e aparece destacado no painel, para o
  // professor decidir. Não é descartado em silêncio.
  if (situacao === "atrasado") {
    return { encontro: quiz.encontro, situacao, leitura: 0, observacoes: 0, pontos: 0 };
  }

  const leitura = envio.aprovado ? regras.valorLeitura : 0;
  const observacoes = marca?.observacoesInsuficientes ? 0 : regras.valorObservacoes;
  return { encontro: quiz.encontro, situacao, leitura, observacoes, pontos: leitura + observacoes };
}

/**
 * Nota de 0 a 10: média dos quizzes que contam, depois de descartar os piores.
 * `descartados` diz quais encontros saíram, para o painel mostrar.
 */
export function notaDoPortfolio(
  regras: ConteudoDisciplina["regrasNota"]["portfolio"],
  celulas: CelulaPortfolio[],
) {
  const valorMaximo = regras.valorLeitura + regras.valorObservacoes;
  const contam = Math.max(celulas.length - regras.descartaPiores, 1);

  // Em empate, descarta o encontro mais antigo — só para o resultado ser estável.
  const ordenadas = [...celulas].sort((a, b) => a.pontos - b.pontos || a.encontro - b.encontro);
  const descartados = ordenadas.slice(0, celulas.length - contam).map((c) => c.encontro);
  const soma = ordenadas.slice(celulas.length - contam).reduce((s, c) => s + c.pontos, 0);

  const nota = Math.round(((soma / (contam * valorMaximo)) * 10 + Number.EPSILON) * 10) / 10;
  return { nota, descartados };
}
