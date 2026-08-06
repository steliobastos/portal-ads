/**
 * Injeta um botão "voltar ao portal" em cada HTML de material.
 *
 * Por que isto existe: os arquivos em `public/material/` são documentos avulsos,
 * escritos antes do portal e sem nenhuma navegação dele. Aberto a partir de um
 * encontro, o aluno entrava no material e ficava sem caminho de volta.
 *
 * O botão é `position:fixed` no canto inferior direito — o único canto livre nos
 * 44 arquivos. Os elementos fixos que já existem ocupam o topo (barra do slide),
 * a base ao centro (navegação do slide), a base à esquerda e a borda direita na
 * altura do meio (bolinhas de slide). Ficar fora do fluxo do documento também
 * evita brigar com as barras `sticky` dos roteiros e quizzes.
 *
 * O bloco é delimitado por marcadores, então rodar de novo substitui em vez de
 * duplicar. Some quando o material virar MDX dentro do portal (Fase 2).
 *
 * Uso: npm run material:voltar
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const RAIZ = join(process.cwd(), "public", "material");

const INICIO = "<!-- portal:voltar:inicio -->";
const FIM = "<!-- portal:voltar:fim -->";

function bloco(href, rotulo) {
  return `${INICIO}
<!-- Gerado por scripts/injetar-volta-ao-portal.mjs — não edite à mão. -->
<a class="portal-voltar" href="${href}">← ${rotulo}</a>
<style>
  .portal-voltar{
    position:fixed;bottom:20px;right:18px;z-index:999;
    display:inline-flex;align-items:center;
    padding:9px 15px;border-radius:999px;
    background:#0e4a50;color:#fff;text-decoration:none;
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    font-size:12px;letter-spacing:.02em;
    box-shadow:0 2px 14px rgba(0,0,0,.20);
  }
  .portal-voltar:hover,.portal-voltar:focus-visible{background:#1b878f;color:#fff;}
  @media print{.portal-voltar{display:none;}}
</style>
${FIM}`;
}

/** `aula0` → Semana 0; `aula7` → Encontro 7. */
function rotuloDo(pasta) {
  const numero = Number(pasta.replace(/^aula/, ""));
  if (!Number.isInteger(numero)) return null;
  return { numero, rotulo: numero === 0 ? "Voltar à Semana 0" : `Voltar ao Encontro ${numero}` };
}

async function main() {
  let injetados = 0;
  let atualizados = 0;

  for (const disciplina of await readdir(RAIZ, { withFileTypes: true })) {
    if (!disciplina.isDirectory()) continue;

    const dirDisciplina = join(RAIZ, disciplina.name);
    for (const pasta of await readdir(dirDisciplina, { withFileTypes: true })) {
      if (!pasta.isDirectory()) continue;

      const info = rotuloDo(pasta.name);
      if (!info) {
        console.warn(`  ignorado: ${disciplina.name}/${pasta.name} — nome fora do padrão aulaN`);
        continue;
      }

      const href = `/${disciplina.name}/encontros/${info.numero}`;
      const dir = join(dirDisciplina, pasta.name);

      for (const arquivo of await readdir(dir)) {
        if (!arquivo.endsWith(".html")) continue;

        const caminho = join(dir, arquivo);
        const original = await readFile(caminho, "utf8");
        const novo = bloco(href, info.rotulo);

        let resultado;
        if (original.includes(INICIO)) {
          // Já injetado antes: troca o bloco, sem duplicar.
          const inicio = original.indexOf(INICIO);
          const fim = original.indexOf(FIM) + FIM.length;
          resultado = original.slice(0, inicio) + novo + original.slice(fim);
          if (resultado !== original) atualizados++;
        } else {
          const corpo = original.match(/<body[^>]*>/i);
          if (!corpo) {
            console.warn(`  sem <body>: ${disciplina.name}/${pasta.name}/${arquivo}`);
            continue;
          }
          const pos = corpo.index + corpo[0].length;
          resultado = `${original.slice(0, pos)}\n${novo}\n${original.slice(pos)}`;
          injetados++;
        }

        if (resultado !== original) await writeFile(caminho, resultado, "utf8");
      }
    }
  }

  console.log(`Botão "voltar ao portal": ${injetados} injetados, ${atualizados} atualizados.`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
