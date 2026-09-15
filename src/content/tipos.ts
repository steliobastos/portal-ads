/**
 * Tipos da camada de conteúdo do portal.
 *
 * O conteúdo vive em arquivos versionados (não no banco). O banco guarda só o que
 * é dinâmico e privado — submissões de quiz e observações de laboratório.
 */

/** Faixa de leitura do Mapa de Leituras: base 🟢, recorte 🔵, aprofundamento ⚪. */
export type FaixaLeitura = "base" | "recorte" | "aprofundamento" | "fora-do-escopo";

export type Leitura = {
  faixa: FaixaLeitura;
  /** Ex.: "LAUREANO, Cap. 1" ou "TANENBAUM, 2.3.1–2.3.2". */
  fonte: string;
  titulo: string;
  paginas?: string;
  /** Uma frase sobre por que essa leitura importa neste encontro. */
  nota?: string;
};

export type TipoMaterial = "slide" | "roteiro" | "guia" | "quiz" | "outro";

export type ArquivoMaterial = {
  tipo: TipoMaterial;
  arquivo: string;
  href: string;
};

/** Marco de avaliação que cai num encontro. */
export type Marco = {
  nota: "N1" | "N2";
  etapa: 1 | 2;
  instrumento: string;
  /** O marco faz parte do projeto integrador: a página do encontro leva ao enunciado. */
  projeto?: boolean;
};

export type Encontro = {
  /** 0 = Semana 0 (onboarding extracurricular). */
  numero: number;
  /** Pasta do material em disco — casa com a chave de MATERIAIS. */
  pasta: string;
  titulo: string;
  /** Data no formato ISO (AAAA-MM-DD) da oferta corrente. */
  data: string;
  etapa: 1 | 2;
  unidade: string;
  /** O que o aluno vai entender ao fim do encontro. */
  resumo: string;
  /** Tópicos trabalhados — usados como "chips" no cartão do encontro. */
  topicos: string[];
  /** O reforço Docker da semana, quando existe (eixo do curso). */
  docker?: string;
  marco?: Marco;
  leituras: Leitura[];
};

export type PerguntaQuiz = {
  enunciado: string;
  alternativas: string[];
  /** Índice da alternativa correta. Nunca chega ao navegador antes do envio. */
  correta: number;
  justificativa: string;
};

export type ObservacaoQuiz = {
  enunciado: string;
  /** Mínimo de caracteres — a observação é avaliada pelo professor, não corrigida. */
  minimo: number;
};

/** Instrumento semanal: verificação de leitura + observações do laboratório. */
export type Quiz = {
  encontro: number;
  leituras: { fonte: string; paginas: string }[];
  perguntas: PerguntaQuiz[];
  observacoes: ObservacaoQuiz[];
};

export type FaseEntrega = "parcial" | "final";

/** Composição da nota de uma disciplina: pesos, portfólio, entregas e rubricas. */
export type RegrasNota = {
  etapas: {
    etapa: 1 | 2;
    /** Os pesos de uma etapa somam 1. Cada componente é avaliado de 0 a 10. */
    componentes: { id: "portfolio" | "N1" | "N2"; nome: string; peso: number; detalhe: string }[];
  }[];
  portfolio: {
    /** Pontos pelo crédito na leitura (2 de 3 acertos no primeiro envio). */
    valorLeitura: number;
    /** Pontos pelas observações, salvo se o professor marcar como insuficientes. */
    valorObservacoes: number;
    /** Quantos dos piores quizzes de cada etapa não entram na nota. */
    descartaPiores: number;
    /** Prazos que fogem da regra "quinta seguinte ao encontro, 23:59". */
    prazosEspeciais: { encontros: number[]; prazo: string }[];
  };
  entregas: { etapa: 1 | 2; fase: FaseEntrega; nome: string; secoes: string; prazo: string }[];
  rubricas: { nota: string; titulo: string; criterios: { nome: string; peso: number }[] }[];
};

export type Unidade = {
  id: string;
  titulo: string;
  calibragem: string;
};

export type Avaliacao = {
  nota: "N1" | "N2";
  etapa: 1 | 2;
  data: string;
  encontro: number;
  instrumento: string;
};

export type Disciplina = {
  slug: string;
  codigo: string;
  nome: string;
  curso: string;
  campus: string;
  professor: string;
  periodo: string;
  cargaHoraria: string;
  encontrosInfo: string;
  ementaResumo: string;
  eixo: string;
  ativa: boolean;
};
