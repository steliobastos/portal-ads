/**
 * Extrai o `QUIZ_DATA` dos quizzes em HTML avulso e gera
 * `src/content/<disciplina>/quizzes.ts`, o conteúdo do quiz nativo.
 *
 * Migração de uma vez só (Fase 3): depois dela, o `.ts` gerado passa a ser a
 * fonte e se edita à mão. Os HTMLs gravavam com `window.storage`, API que só
 * existe dentro dos artefatos do Claude — publicados no portal, não salvavam
 * nada. Por isso saem de `public/material/` assim que a extração é conferida.
 *
 * Mesmo princípio do conversor de roteiros: nunca descartar em silêncio. Todo
 * quiz fora do formato esperado interrompe o script com a razão.
 *
 * Uso: node scripts/extrair-quizzes.mjs [disciplina]   (padrão: so)
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

const disciplina = process.argv[2] ?? "so";
const RAIZ = process.cwd();
const BASE = join(RAIZ, "public", "material", disciplina);
const SAIDA = join(RAIZ, "src", "content", disciplina, "quizzes.ts");

const problemas = [];
const quizzes = [];

for (const pasta of readdirSync(BASE)) {
  const dir = join(BASE, pasta);
  if (!statSync(dir).isDirectory()) continue;

  for (const arquivo of readdirSync(dir).filter((a) => a.startsWith("Quiz_"))) {
    const html = readFileSync(join(dir, arquivo), "utf8");
    const bloco = html.match(/(?:const|var) QUIZ_DATA = (\{[\s\S]*?\n\s*\});/);
    if (!bloco) {
      problemas.push(`${pasta}/${arquivo}: bloco QUIZ_DATA não encontrado`);
      continue;
    }

    // O bloco é um literal de objeto JavaScript (não JSON): avaliado isolado.
    const dados = normalizar(runInNewContext(`(${bloco[1]})`, {}), disciplina);
    const erro = validar(dados);
    if (erro) {
      problemas.push(`${pasta}/${arquivo}: ${erro}`);
      continue;
    }

    quizzes.push({
      encontro: dados.encontro,
      leituras: dados.leitura.map((l) => ({ fonte: l.fonte, paginas: l.paginas })),
      perguntas: dados.perguntas.map((p) => ({
        enunciado: p.texto,
        alternativas: p.opcoes,
        correta: p.correta,
        justificativa: p.justificativa,
      })),
      observacoes: dados.observacoes.map((o) => ({ enunciado: o.label, minimo: o.min })),
    });
  }
}

/**
 * O quiz do Encontro 1 é anterior à padronização do motor: nomeia os campos de
 * outro jeito (`enunciado`/`alternativas`, leitura com `ref` à parte) e não tem
 * enunciado nas observações — só `{ quantidade, minCaracteres }`. Os enunciados
 * vêm dos rascunhos do roteiro do mesmo encontro, que são as mesmas perguntas.
 */
function normalizar(d, disciplina) {
  const leitura = d.leitura?.map((l) => ({
    fonte: l.ref ? `${l.fonte}, ${l.ref}` : l.fonte,
    paginas: l.ref && !/^p\./.test(l.paginas) ? `p. ${l.paginas}` : l.paginas,
  }));
  const perguntas = d.perguntas?.map((p) => ({
    texto: p.texto ?? p.enunciado,
    opcoes: p.opcoes ?? p.alternativas,
    correta: p.correta,
    justificativa: p.justificativa,
  }));

  let observacoes = d.observacoes;
  if (observacoes && !Array.isArray(observacoes)) {
    const enunciados = rascunhosDoRoteiro(disciplina, d.encontro);
    if (enunciados.length !== observacoes.quantidade) {
      throw new Error(
        `Encontro ${d.encontro}: ${observacoes.quantidade} observações no quiz, ` +
          `${enunciados.length} rascunhos no roteiro`,
      );
    }
    observacoes = enunciados.map((label) => ({ label, min: observacoes.minCaracteres }));
  }

  return { encontro: d.encontro, leitura, perguntas, observacoes };
}

function rascunhosDoRoteiro(disciplina, encontro) {
  const mdx = readFileSync(
    join(RAIZ, "src", "content", disciplina, "roteiros", `${encontro}.mdx`),
    "utf8",
  );
  return [...mdx.matchAll(/<Rascunho[^>]*>\s*([\s\S]*?)\s*<\/Rascunho>/g)].map((m) => {
    const texto = m[1].replace(/\s+/g, " ").trim();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });
}

function validar(d) {
  if (!Number.isInteger(d?.encontro)) return "encontro ausente";
  if (!Array.isArray(d.leitura)) return "leitura ausente";
  if (!Array.isArray(d.perguntas) || d.perguntas.length === 0) return "sem perguntas";
  for (const [i, p] of d.perguntas.entries()) {
    if (typeof p.texto !== "string") return `pergunta ${i + 1} sem texto`;
    if (!Array.isArray(p.opcoes) || p.opcoes.length < 2) return `pergunta ${i + 1} sem alternativas`;
    if (!Number.isInteger(p.correta) || p.correta < 0 || p.correta >= p.opcoes.length)
      return `pergunta ${i + 1} com gabarito fora das alternativas`;
    if (typeof p.justificativa !== "string") return `pergunta ${i + 1} sem justificativa`;
  }
  if (!Array.isArray(d.observacoes)) return "observações ausentes";
  for (const [i, o] of d.observacoes.entries()) {
    if (typeof o.label !== "string" || !Number.isInteger(o.min))
      return `observação ${i + 1} fora do formato`;
  }
  return null;
}

if (problemas.length > 0) {
  console.error("Extração interrompida — nada foi gravado:\n  " + problemas.join("\n  "));
  process.exit(1);
}

quizzes.sort((a, b) => a.encontro - b.encontro);

const cabecalho = `import type { Quiz } from "../tipos";

/**
 * Quizzes semanais de ${disciplina.toUpperCase()}: verificação de leitura + observações de laboratório.
 *
 * Extraídos uma única vez dos quizzes em HTML avulso (scripts/extrair-quizzes.mjs).
 * A partir daqui, este arquivo é a fonte — edite à mão.
 *
 * ⚠️ Não reordene alternativas de um quiz que já recebeu respostas: o banco
 * guarda o índice marcado. O número de acertos fica gravado no momento do
 * envio, então a nota não muda; o que ficaria errado é a leitura das respostas.
 */
export const QUIZZES: Quiz[] = `;

writeFileSync(SAIDA, cabecalho + JSON.stringify(quizzes, null, 2) + ";\n", "utf8");
console.log(
  `Extraídos ${quizzes.length} quizzes (encontros ${quizzes.map((q) => q.encontro).join(", ")}) → ${SAIDA}`,
);
