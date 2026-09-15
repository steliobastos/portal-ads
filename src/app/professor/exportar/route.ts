import { conteudoDa, quizDo } from "@/content";
import { momentoCampus } from "@/lib/datas";
import { portfolioDaEtapa, situacaoDoEncontro } from "@/lib/painel-quiz";
import { professorLogado } from "@/lib/supabase/servidor";

/**
 * Planilhas do painel: os envios de um quiz (`?encontro=N`) ou o portfólio de
 * uma etapa (`?tipo=portfolio&etapa=N`).
 *
 * Separador `;` e BOM no início: é o que o Excel em português espera para abrir
 * o arquivo com colunas e acentos certos com dois cliques. O Google Planilhas
 * entende os dois. Números com vírgula decimal, pelo mesmo motivo.
 */
export async function GET(request: Request) {
  if (!(await professorLogado())) return new Response("Não autorizado", { status: 401 });

  const url = new URL(request.url);
  const disciplina = url.searchParams.get("disciplina") ?? "";
  const conteudo = conteudoDa(disciplina);
  if (!conteudo) return new Response("Disciplina não encontrada", { status: 404 });

  if (url.searchParams.get("tipo") === "portfolio") {
    const etapa = url.searchParams.get("etapa") === "2" ? 2 : 1;
    const { quizzes, linhas } = await portfolioDaEtapa(conteudo, etapa);
    const cabecalho = [
      "matricula",
      "nome",
      ...quizzes.map((q) => `E${q.encontro}`),
      "descartado",
      "atrasos pendentes",
      "nota portfolio",
    ];
    const corpo = linhas.map((l) => [
      l.matricula,
      l.nome,
      ...l.celulas.map((c) => (c.situacao === "atrasado" ? "atrasado" : decimal(c.pontos))),
      l.descartados.map((e) => `E${e}`).join(" "),
      String(l.pendentes),
      decimal(l.nota),
    ]);
    return planilha(`portfolio-${disciplina}-etapa-${etapa}.csv`, [cabecalho, ...corpo]);
  }

  const encontro = Number(url.searchParams.get("encontro"));
  const quiz = quizDo(disciplina, encontro);
  if (!quiz) return new Response("Quiz não encontrado", { status: 404 });

  const alunos = await situacaoDoEncontro(conteudo, encontro);
  const cabecalho = [
    "matricula",
    "nome",
    `acertos (de ${quiz.perguntas.length})`,
    "credito leitura",
    "atrasado",
    "atraso aceito",
    "observacoes insuficientes",
    "envios",
    "primeiro envio",
    "ultimo envio",
    ...quiz.observacoes.map((_, i) => `observacao ${i + 1}`),
  ];
  const corpo = alunos.map((a) => [
    a.matricula,
    a.nome,
    String(a.acertos),
    simNao(a.aprovado),
    simNao(a.atrasado),
    a.atrasado ? simNao(a.atrasoAceito) : "",
    simNao(a.observacoesInsuficientes),
    String(a.envios),
    momentoCampus(a.primeiroEnvio),
    momentoCampus(a.ultimoEnvio),
    ...a.observacoes,
  ]);
  return planilha(
    `quiz-${disciplina}-encontro-${String(encontro).padStart(2, "0")}.csv`,
    [cabecalho, ...corpo],
  );
}

const simNao = (v: boolean) => (v ? "sim" : "nao");
const decimal = (n: number) => n.toFixed(1).replace(".", ",");

function planilha(nome: string, linhas: string[][]) {
  const csv = linhas.map((l) => l.map(celula).join(";")).join("\r\n");
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Aspas em toda célula, aspas internas dobradas. E um apóstrofo antes de
 * `= + - @`: texto livre de aluno começando assim viraria fórmula ao abrir a
 * planilha (injeção de fórmula em CSV).
 */
function celula(valor: string): string {
  const seguro = /^[=+\-@]/.test(valor) ? `'${valor}` : valor;
  return `"${seguro.replace(/"/g, '""')}"`;
}
