#!/usr/bin/env node
/**
 * Importa a lista de alunos de uma turma, a partir do CSV do diário.
 *
 *   npm run turma:importar -- curso/turmas/so-2026-2.csv --disciplina so --turma 2026.2
 *
 * O CSV é o que o diário exporta: separado por `;`, com uma coluna de
 * matrícula e uma de nome (os demais campos — faltas, frequência, notas — são
 * ignorados de propósito: nota é assunto do diário, não do portal).
 *
 * A lista vive só no banco. Nome e matrícula de aluno são dado pessoal e este
 * repositório é público — por isso nada disso entra em `src/content/`.
 *
 * O que o script faz:
 * - cadastra quem é novo;
 * - atualiza o nome de quem já existe (casamento por matrícula);
 * - marca como inativo quem saiu da lista, **sem apagar** — os envios que essa
 *   pessoa já fez continuam no painel.
 *
 * Nada é gravado se o arquivo não tiver as duas colunas: é melhor falhar do
 * que importar uma turma pela metade.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const opcoes = {};
let arquivo = null;
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) opcoes[args[i].slice(2)] = args[++i] ?? "";
  else arquivo ??= args[i];
}

const disciplina = opcoes.disciplina ?? "so";
const turma = opcoes.turma ?? "";

if (!arquivo) {
  console.error("Uso: npm run turma:importar -- <arquivo.csv> [--disciplina so] [--turma 2026.2]");
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const secreta = process.env.SUPABASE_SECRET_KEY;
if (!url || !secreta) {
  console.error("Faltam SUPABASE_URL e SUPABASE_SECRET_KEY (rode com `npm run turma:importar`).");
  process.exit(1);
}

/** CSV simples, com suporte a campo entre aspas. */
function lerCsv(texto) {
  // Planilha costuma salvar com marca de ordem de bytes (BOM) na frente.
  const limpo = texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;
  const linhas = limpo.split(/\r?\n/).filter((l) => l.trim());
  return linhas.map((linha) => {
    const campos = [];
    let atual = "";
    let aspas = false;
    for (const c of linha) {
      if (c === '"') aspas = !aspas;
      else if (c === ";" && !aspas) {
        campos.push(atual);
        atual = "";
      } else atual += c;
    }
    campos.push(atual);
    return campos.map((c) => c.trim());
  });
}

function semAcento(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

const linhas = lerCsv(readFileSync(arquivo, "utf8"));
if (linhas.length < 2) {
  console.error(`✖ ${arquivo}: não há linhas de aluno.`);
  process.exit(1);
}

const cabecalho = linhas[0].map(semAcento);
const colMatricula = cabecalho.findIndex((c) => c.includes("matricula"));
const colNome = cabecalho.findIndex((c) => c === "nome" || c.includes("nome do aluno"));
if (colMatricula < 0 || colNome < 0) {
  console.error(`✖ ${arquivo}: não achei as colunas de matrícula e nome no cabeçalho.`);
  console.error(`  Cabeçalho lido: ${linhas[0].join(" | ")}`);
  process.exit(1);
}

const alunos = [];
const problemas = [];
for (const [i, linha] of linhas.slice(1).entries()) {
  const matricula = (linha[colMatricula] ?? "").replace(/\s+/g, "").toUpperCase();
  const nome = (linha[colNome] ?? "").replace(/\s+/g, " ").trim();
  if (!matricula && !nome) continue;
  if (!/^[A-Z0-9]{4,20}$/.test(matricula) || nome.length < 3) {
    problemas.push(`linha ${i + 2}: matrícula "${matricula}" / nome "${nome}"`);
    continue;
  }
  if (alunos.some((a) => a.matricula === matricula)) {
    problemas.push(`linha ${i + 2}: matrícula ${matricula} repetida no arquivo`);
    continue;
  }
  alunos.push({ disciplina, matricula, nome, turma, ativo: true, atualizado_em: new Date().toISOString() });
}

if (problemas.length) {
  console.error(`✖ ${problemas.length} linha(s) fora do formato — nada foi gravado:`);
  for (const p of problemas) console.error(`  ${p}`);
  process.exit(1);
}
if (alunos.length === 0) {
  console.error("✖ Nenhum aluno válido no arquivo — nada foi gravado.");
  process.exit(1);
}

const supabase = createClient(url, secreta, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: antes, error: erroLeitura } = await supabase
  .from("turma_alunos")
  .select("matricula, nome, ativo")
  .eq("disciplina", disciplina);
if (erroLeitura) {
  console.error(`✖ Não consegui ler a turma atual: ${erroLeitura.message}`);
  process.exit(1);
}

const { error } = await supabase
  .from("turma_alunos")
  .upsert(alunos, { onConflict: "disciplina,matricula" });
if (error) {
  console.error(`✖ Falha ao gravar: ${error.message}`);
  process.exit(1);
}

// Quem estava na tabela e não veio no CSV sai da lista — sem apagar.
const noArquivo = new Set(alunos.map((a) => a.matricula));
const sairam = (antes ?? []).filter((a) => a.ativo && !noArquivo.has(a.matricula));
if (sairam.length) {
  const { error: erroBaixa } = await supabase
    .from("turma_alunos")
    .update({ ativo: false, atualizado_em: new Date().toISOString() })
    .eq("disciplina", disciplina)
    .in("matricula", sairam.map((a) => a.matricula));
  if (erroBaixa) {
    console.error(`✖ Alunos gravados, mas não consegui inativar quem saiu: ${erroBaixa.message}`);
    process.exit(1);
  }
}

const existentes = new Set((antes ?? []).map((a) => a.matricula));
const novos = alunos.filter((a) => !existentes.has(a.matricula));
console.log(`✔ Turma de ${disciplina}: ${alunos.length} aluno(s) na lista.`);
if (novos.length) console.log(`  ${novos.length} novo(s): ${novos.map((a) => a.nome).join(", ")}`);
if (sairam.length) console.log(`  ${sairam.length} inativado(s): ${sairam.map((a) => a.nome).join(", ")}`);
console.log("  Os formulários do portal já mostram a lista — não precisa publicar o site.");
