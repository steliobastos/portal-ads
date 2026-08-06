/**
 * Indexa os arquivos de material que vivem em `public/material/<disciplina>/<pasta>/`
 * e gera um módulo TypeScript tipado com a lista real de arquivos em disco.
 *
 * Motivo: os nomes dos arquivos são escritos à mão nos materiais da disciplina.
 * Gerar o índice a partir do disco evita link quebrado por erro de digitação —
 * se o arquivo não existe, ele simplesmente não aparece no site.
 *
 * Uso: npm run material:indexar
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const BASE = join(RAIZ, "public", "material");
const SAIDA = join(RAIZ, "src", "content", "materiais.gerado.ts");

/** Deduz o tipo do material a partir do nome do arquivo. */
function classificar(arquivo) {
  if (arquivo.startsWith("Quiz_")) return "quiz";
  if (arquivo.startsWith("Roteiro-Aluno_")) return "roteiro";
  if (arquivo.startsWith("Guia-Aluno_")) return "guia";
  if (arquivo.startsWith("Encontro-")) return "slide";
  return "outro";
}

const indice = {};

for (const disciplina of readdirSync(BASE)) {
  if (!statSync(join(BASE, disciplina)).isDirectory()) continue;

  for (const pasta of readdirSync(join(BASE, disciplina))) {
    const dir = join(BASE, disciplina, pasta);
    if (!statSync(dir).isDirectory()) continue;

    const arquivos = readdirSync(dir)
      .filter((a) => a.toLowerCase().endsWith(".html"))
      .map((arquivo) => ({
        tipo: classificar(arquivo),
        arquivo,
        href: `/material/${disciplina}/${pasta}/${arquivo}`,
      }))
      // ordem de uso em aula: slide → roteiro/guia → quiz
      .sort((a, b) => {
        const ordem = { slide: 0, roteiro: 1, guia: 1, quiz: 2, outro: 3 };
        return ordem[a.tipo] - ordem[b.tipo];
      });

    if (arquivos.length > 0) indice[`${disciplina}/${pasta}`] = arquivos;
  }
}

const cabecalho = `// ARQUIVO GERADO — não edite à mão.
// Origem: public/material/**  ·  Regenerar: npm run material:indexar

import type { ArquivoMaterial } from "./tipos";

/** Chave: "<disciplina>/<pasta>" — ex.: "so/aula7". */
export const MATERIAIS: Record<string, ArquivoMaterial[]> = `;

writeFileSync(SAIDA, cabecalho + JSON.stringify(indice, null, 2) + ";\n", "utf8");

const total = Object.values(indice).reduce((s, a) => s + a.length, 0);
console.log(`Indexados ${total} arquivos em ${Object.keys(indice).length} pastas → ${SAIDA}`);
