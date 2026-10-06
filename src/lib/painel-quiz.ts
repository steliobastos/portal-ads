import "server-only";
import type { ConteudoDisciplina } from "@/content";
import {
  celulaDoQuiz,
  notaDoPortfolio,
  passouDoPrazo,
  prazoDoQuiz,
  quizzesDaEtapa,
  type CelulaPortfolio,
} from "./portfolio";
import { consolidar, type Consolidado, type EnvioQuiz } from "./envios";
import { clienteAdmin } from "./supabase/servidor";

/**
 * Leitura dos dados para o painel do professor.
 *
 * Só quem passou por `professorLogado()` pode chegar aqui — este módulo usa a
 * chave secreta e não confere sessão sozinho. Todas as páginas e rotas que o
 * usam fazem a checagem na primeira linha.
 */

type LinhaMarca = {
  encontro: number;
  matricula: string;
  observacoes_insuficientes: boolean;
  atraso_aceito: boolean;
};

/**
 * A API do Supabase devolve no máximo 1.000 linhas por consulta. Um semestre
 * inteiro de quizzes passa disso, então a leitura é feita em páginas.
 */
async function lerTudo<T>(
  consulta: (de: number, ate: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const pagina = 1000;
  const todas: T[] = [];
  for (let de = 0; ; de += pagina) {
    const { data, error } = await consulta(de, de + pagina - 1);
    if (error) throw new Error(`Falha ao ler o banco: ${error.message}`);
    todas.push(...(data ?? []));
    if (!data || data.length < pagina) return todas;
  }
}

async function enviosEMarcas(disciplina: string, encontros: number[]) {
  const supabase = clienteAdmin();
  if (!supabase || encontros.length === 0) return { envios: [], marcas: [] };

  const [envios, marcas] = await Promise.all([
    lerTudo<EnvioQuiz>((de, ate) =>
      supabase
        .from("submissoes_quiz")
        .select("id, encontro, matricula, nome, acertos, aprovado, observacoes, enviado_em, anulado_em")
        .eq("disciplina", disciplina)
        .in("encontro", encontros)
        .order("enviado_em", { ascending: true })
        .order("id", { ascending: true })
        .range(de, ate),
    ),
    lerTudo<LinhaMarca>((de, ate) =>
      supabase
        .from("avaliacoes_portfolio")
        .select("encontro, matricula, observacoes_insuficientes, atraso_aceito")
        .eq("disciplina", disciplina)
        .in("encontro", encontros)
        .range(de, ate),
    ),
  ]);
  return { envios, marcas };
}

/**
 * A situação de um aluno num quiz, consolidando todos os envios dele. A regra
 * de qual envio vale está em `envios.ts`.
 */
export type SituacaoAluno = Consolidado & {
  matricula: string;
  nome: string;
  /** Pelo primeiro envio válido; `false` se não houver nenhum. */
  atrasado: boolean;
  observacoesInsuficientes: boolean;
  atrasoAceito: boolean;
};

function agrupar<T, K>(itens: T[], chave: (item: T) => K): Map<K, T[]> {
  const mapa = new Map<K, T[]>();
  for (const item of itens) mapa.set(chave(item), [...(mapa.get(chave(item)) ?? []), item]);
  return mapa;
}

export async function situacaoDoEncontro(
  conteudo: ConteudoDisciplina,
  encontro: number,
): Promise<SituacaoAluno[]> {
  const { envios, marcas } = await enviosEMarcas(conteudo.disciplina.slug, [encontro]);
  const prazo = prazoDoQuiz(conteudo, encontro);

  return [...agrupar(envios, (e) => e.matricula).values()]
    .map((lista) => {
      const aluno = consolidar(lista);
      const matricula = lista[0].matricula;
      const marca = marcas.find((m) => m.matricula === matricula);
      return {
        ...aluno,
        matricula,
        nome: lista[lista.length - 1].nome,
        atrasado: aluno.valido ? passouDoPrazo(prazo, aluno.valido.primeiroEnvio) : false,
        observacoesInsuficientes: marca?.observacoes_insuficientes ?? false,
        atrasoAceito: marca?.atraso_aceito ?? false,
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export type LinhaPortfolio = {
  matricula: string;
  nome: string;
  celulas: CelulaPortfolio[];
  nota: number;
  descartados: number[];
  /** Quizzes com atraso ainda sem decisão do professor. */
  pendentes: number;
};

/** O portfólio de todos os alunos que enviaram ao menos um quiz da etapa. */
export async function portfolioDaEtapa(conteudo: ConteudoDisciplina, etapa: 1 | 2) {
  const regras = conteudo.regrasNota.portfolio;
  const quizzes = quizzesDaEtapa(conteudo, etapa).map((q) => ({
    encontro: q.encontro,
    prazo: prazoDoQuiz(conteudo, q.encontro),
  }));
  const { envios, marcas } = await enviosEMarcas(
    conteudo.disciplina.slug,
    quizzes.map((q) => q.encontro),
  );

  const linhas: LinhaPortfolio[] = [...agrupar(envios, (e) => e.matricula).entries()].map(
    ([matricula, doAluno]) => {
      const porEncontro = agrupar(doAluno, (e) => e.encontro);
      const celulas = quizzes.map((quiz) => {
        const valido = consolidar(porEncontro.get(quiz.encontro) ?? []).valido;
        const marca = marcas.find((m) => m.matricula === matricula && m.encontro === quiz.encontro);
        return celulaDoQuiz(
          regras,
          quiz,
          valido ?? undefined,
          marca && {
            observacoesInsuficientes: marca.observacoes_insuficientes,
            atrasoAceito: marca.atraso_aceito,
          },
        );
      });
      const { nota, descartados } = notaDoPortfolio(regras, celulas);
      return {
        matricula,
        nome: doAluno[doAluno.length - 1].nome,
        celulas,
        nota,
        descartados,
        pendentes: celulas.filter((c) => c.situacao === "atrasado").length,
      };
    },
  );

  return {
    quizzes,
    linhas: linhas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
  };
}

export type EntregaEquipe = {
  id: number;
  equipe: string;
  integrantes: { nome: string; matricula: string }[];
  enviadoEm: string;
  tamanhoBytes: number;
  atrasado: boolean;
  /** Quantas vezes esta mesma formação de equipe enviou. */
  envios: number;
};

/**
 * A entrega mais recente de cada equipe numa fase. A equipe é identificada
 * pelo conjunto de matrículas: se a formação muda, vira outra linha — e o
 * professor vê as duas.
 */
export async function entregasDaFase(
  conteudo: ConteudoDisciplina,
  etapa: 1 | 2,
  fase: "parcial" | "final",
): Promise<EntregaEquipe[]> {
  const supabase = clienteAdmin();
  const config = conteudo.regrasNota.entregas.find((e) => e.etapa === etapa && e.fase === fase);
  if (!supabase || !config) return [];

  type LinhaEntrega = {
    id: number;
    equipe: string;
    integrantes: { nome: string; matricula: string }[];
    matriculas: string[];
    tamanho_bytes: number;
    enviado_em: string;
  };
  const linhas = await lerTudo<LinhaEntrega>((de, ate) =>
    supabase
      .from("entregas_relatorio")
      .select("id, equipe, integrantes, matriculas, tamanho_bytes, enviado_em")
      .eq("disciplina", conteudo.disciplina.slug)
      .eq("etapa", etapa)
      .eq("fase", fase)
      .order("enviado_em", { ascending: true })
      .range(de, ate),
  );

  return [...agrupar(linhas, (l) => l.matriculas.join(",")).values()]
    .map((lista) => {
      const ultima = lista[lista.length - 1];
      return {
        id: ultima.id,
        equipe: ultima.equipe,
        integrantes: ultima.integrantes,
        enviadoEm: ultima.enviado_em,
        tamanhoBytes: ultima.tamanho_bytes,
        atrasado: passouDoPrazo(config.prazo, ultima.enviado_em),
        envios: lista.length,
      };
    })
    .sort((a, b) => a.equipe.localeCompare(b.equipe, "pt-BR"));
}

/** O caminho do PDF de uma entrega, para a rota de download. */
export async function arquivoDaEntrega(id: number) {
  const supabase = clienteAdmin();
  if (!supabase) return null;
  const { data } = await supabase
    .from("entregas_relatorio")
    .select("arquivo, equipe, fase, etapa")
    .eq("id", id)
    .maybeSingle();
  return data as { arquivo: string; equipe: string; fase: string; etapa: number } | null;
}
