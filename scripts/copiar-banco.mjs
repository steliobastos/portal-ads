#!/usr/bin/env node
/**
 * Copia o banco do portal e os relatórios em PDF para o computador do professor.
 *
 *   npm run banco:copiar
 *
 * O plano gratuito do Supabase não oferece backup para baixar: sem esta cópia,
 * envios de quiz, marcações do portfólio e relatórios existem num lugar só.
 *
 * Cria `curso/backups/<data-hora>/` com:
 * - `<tabela>.json` — cópia fiel, linha a linha, para restaurar se preciso;
 * - `<tabela>.csv` — a mesma tabela para abrir no Excel (separador `;`, BOM);
 * - `relatorios/` — os PDFs entregues, na mesma estrutura de pastas do bucket;
 * - `resumo.txt` — quantas linhas e arquivos foram copiados, para conferir.
 *
 * `curso/` está no `.gitignore`: nada disso vai para o repositório público.
 * O script só lê — não altera nada no banco.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

/** Tabela e a coluna que dá a ordem das linhas na cópia. */
const TABELAS = [
  ["submissoes_quiz", "id"],
  ["entregas_relatorio", "id"],
  ["avaliacoes_portfolio", "atualizado_em"],
  ["turma_alunos", "nome"],
  ["calendario_ajustes", "tipo"],
];
const BUCKET = "relatorios";
const POR_PAGINA = 1000;

const url = process.env.SUPABASE_URL;
const secreta = process.env.SUPABASE_SECRET_KEY;
if (!url || !secreta) {
  console.error("Faltam SUPABASE_URL e SUPABASE_SECRET_KEY. Rode com: npm run banco:copiar");
  process.exit(1);
}
const supabase = createClient(url, secreta, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Data e hora de Horizonte no nome da pasta, para as cópias ficarem em ordem.
const agora = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
const pasta = join(process.cwd(), "curso", "backups", `${agora.slice(0, 10)}_${agora.slice(11, 16).replace(":", "h")}`);
mkdirSync(pasta, { recursive: true });

async function lerTabela(tabela, ordem) {
  const linhas = [];
  for (let de = 0; ; de += POR_PAGINA) {
    const { data, error } = await supabase
      .from(tabela)
      .select("*")
      .order(ordem)
      .range(de, de + POR_PAGINA - 1);
    if (error) throw new Error(`${tabela}: ${error.message}`);
    linhas.push(...data);
    if (data.length < POR_PAGINA) return linhas;
  }
}

/**
 * Uma célula do CSV. Lista e objeto viram JSON. Texto que começa com `=`, `+`,
 * `-` ou `@` ganha um apóstrofo na frente: as observações são texto livre de
 * aluno, e o Excel executaria uma fórmula escrita ali. (O `.json` guarda o
 * valor original.)
 */
function celula(valor) {
  if (valor === null || valor === undefined) return "";
  let texto = typeof valor === "object" ? JSON.stringify(valor) : String(valor);
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`;
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function paraCsv(linhas) {
  if (linhas.length === 0) return "﻿";
  const colunas = Object.keys(linhas[0]);
  const corpo = linhas.map((l) => colunas.map((c) => celula(l[c])).join(";"));
  return `﻿${[colunas.join(";"), ...corpo].join("\r\n")}\r\n`;
}

/** Todos os arquivos do bucket, descendo pelas pastas. */
async function listarArquivos(prefixo = "") {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefixo, { limit: 1000 });
  if (error) throw new Error(`bucket ${BUCKET}: ${error.message}`);
  const arquivos = [];
  for (const item of data) {
    const caminho = prefixo ? `${prefixo}/${item.name}` : item.name;
    // Pasta não tem `id` na listagem do Storage.
    if (item.id === null) arquivos.push(...(await listarArquivos(caminho)));
    else arquivos.push(caminho);
  }
  return arquivos;
}

const resumo = [`Cópia do banco do portal — ${agora.slice(0, 16).replace("T", " ")} (horário de Horizonte)`, ""];

try {
  for (const [tabela, ordem] of TABELAS) {
    const linhas = await lerTabela(tabela, ordem);
    writeFileSync(join(pasta, `${tabela}.json`), JSON.stringify(linhas, null, 2));
    writeFileSync(join(pasta, `${tabela}.csv`), paraCsv(linhas));
    resumo.push(`${tabela}: ${linhas.length} linha(s)`);
    console.log(`✔ ${tabela}: ${linhas.length} linha(s)`);
  }

  const arquivos = await listarArquivos();
  for (const caminho of arquivos) {
    const { data, error } = await supabase.storage.from(BUCKET).download(caminho);
    if (error) throw new Error(`${caminho}: ${error.message}`);
    const destino = join(pasta, BUCKET, ...caminho.split("/"));
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, Buffer.from(await data.arrayBuffer()));
  }
  resumo.push(`${BUCKET}: ${arquivos.length} PDF(s)`);
  console.log(`✔ ${BUCKET}: ${arquivos.length} PDF(s)`);
} catch (erro) {
  // Cópia pela metade engana: o resumo registra que ela falhou.
  resumo.push("", `✖ CÓPIA INCOMPLETA: ${erro.message}`);
  writeFileSync(join(pasta, "resumo.txt"), `${resumo.join("\r\n")}\r\n`);
  console.error(`✖ Cópia incompleta: ${erro.message}`);
  process.exit(1);
}

writeFileSync(join(pasta, "resumo.txt"), `${resumo.join("\r\n")}\r\n`);
console.log(`\nCópia salva em ${pasta}`);
