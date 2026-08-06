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
