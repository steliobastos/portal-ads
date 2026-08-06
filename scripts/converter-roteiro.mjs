/**
 * Converte um roteiro de laboratório em HTML para MDX (Fase 2).
 *
 * Ferramenta de migração, não parte do site. Existe porque converter 18 arquivos
 * de ~460 linhas à mão convida a erro de omissão — e omissão em material
 * didático é pior que erro visível: ninguém nota que um passo sumiu.
 *
 * Princípio de projeto: **nunca descartar em silêncio**. Todo bloco que o
 * conversor não reconhece é relatado com o trecho correspondente, para ser
 * tratado à mão. Preferir ruído a perda.
 *
 * Uso: node scripts/converter-roteiro.mjs <entrada.html> <numero> [saida.mdx]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "node-html-parser";

const naoReconhecidos = [];

function relatar(o, contexto) {
  const amostra = (o.outerHTML ?? String(o)).replace(/\s+/g, " ").slice(0, 110);
  naoReconhecidos.push(`${contexto}: ${amostra}`);
}

// ── texto ────────────────────────────────────────────────────────────────────

const ENTIDADES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
  "&apos;": "'", "&nbsp;": " ", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…",
  "&times;": "×", "&rarr;": "→", "&larr;": "←", "&check;": "✓",
};

function decodificar(s) {
  return s
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTIDADES[e.toLowerCase()] ?? e)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

/**
 * Escapa o que o MDX interpretaria como sintaxe. `<` abriria um elemento e
 * `{` uma expressão JavaScript — ambos aparecem em texto técnico (`/proc/<pid>`,
 * `${VAR}`) e quebrariam a compilação.
 */
function escapar(s) {
  return s.replace(/([<>{}])/g, "\\$1");
}

/** Converte o conteúdo inline de um nó em Markdown. */
function inline(no) {
  if (no.nodeType === 3) return escapar(decodificar(no.rawText));
  if (no.nodeType !== 1) return "";

  const filhos = () => no.childNodes.map(inline).join("");
  const tag = no.rawTagName?.toLowerCase();

  switch (tag) {
    case "code": {
      // `.text`, e não `.structuredText`: este normaliza espaços, e espaço é
      // significativo em comando e em saída de terminal.
      const texto = decodificar(no.text);
      // Crase dentro do código exige delimitador maior.
      const cerca = texto.includes("`") ? "``" : "`";
      const folga = texto.startsWith("`") || texto.endsWith("`") ? " " : "";
      return `${cerca}${folga}${texto}${folga}${cerca}`;
    }
    case "b":
    case "strong": {
      const dentro = filhos().trim();
      return dentro ? `**${dentro}**` : "";
    }
    case "i":
    case "em": {
      const dentro = filhos().trim();
      return dentro ? `*${dentro}*` : "";
    }
    case "br":
      return "\n";
    case "a":
      return `[${filhos()}](${no.getAttribute("href")})`;
    // Contêineres cujo conteúdo já é tratado pelo chamador: atravessa sem ruído.
    case "span":
    case "small":
    case "p":
    case "div":
    case "label":
    case "li":
    case "summary":
    case "h1":
    case "h2":
    case "h3":
    case "h4":
      return filhos();
    default:
      if (tag) relatar(no, "inline");
      return filhos();
  }
}

/** Texto inline já normalizado: sem quebras acidentais e sem espaço duplo. */
function texto(no) {
  return inline(no).replace(/[ \t]*\n[ \t]*/g, " ").replace(/\s{2,}/g, " ").trim();
}

/**
 * Escapa conteúdo que vai dentro de um template literal do MDX.
 *
 * Não é hipótese: a saída de `lsblk` desenha a árvore de partições com crase
 * (`` `-sda2 ``), que fecharia o literal e quebraria a compilação. `${` e a
 * própria barra invertida têm o mesmo problema.
 */
function literal(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

/** Valor de atributo JSX, escolhendo a aspa que não conflita com o conteúdo. */
function atributo(s) {
  const limpo = decodificar(s).replace(/\s+/g, " ").trim();
  return limpo.includes('"') ? `'${limpo}'` : `"${limpo}"`;
}

// ── blocos ───────────────────────────────────────────────────────────────────

const temClasse = (no, c) => no.classList?.contains(c);

/**
 * "O que esperar" nem sempre veio com a classe `obs-note`: nos roteiros mais
 * antigos é um `<p>` com estilo embutido, reconhecível pelo negrito inicial.
 */
function ehObsNote(no) {
  if (temClasse(no, "obs-note")) return true;
  if (no.rawTagName?.toLowerCase() !== "p") return false;
  return /^\s*<b>\s*O que esperar/i.test(no.innerHTML ?? "");
}

/** Caixa em teal identificada só pelo estilo embutido (roteiros 13 e 14). */
function ehDestaque(no) {
  return (no.getAttribute?.("style") ?? "").includes("primary-soft");
}

/** Texto de um bloco de terminal, com as linhas de comando prefixadas por `$`. */
function sessaoTerminal(corpo) {
  let saida = "";
  for (const filho of corpo.childNodes) {
    if (filho.nodeType === 3) {
      saida += decodificar(filho.rawText);
    } else if (temClasse(filho, "prompt")) {
      saida += "$";
    } else {
      // `.text` preserva o alinhamento em colunas da saída; `.structuredText`
      // colapsaria os espaços e destruiria a leitura da tabela.
      saida += decodificar(filho.text);
    }
  }
  return saida.replace(/^\n+/, "").replace(/\s+$/, "");
}

/** Conteúdo em bloco (parágrafos) de um contêiner, para dentro de um componente. */
function paragrafos(no, indent = "  ") {
  const partes = [];

  // Sem filho de bloco, o conteúdo é uma frase só — tratar nó a nó quebraria
  // "Normal — `ps aux` mostra tudo" em três parágrafos.
  const temBloco = no.childNodes.some(
    (n) => n.nodeType === 1 && ["p", "div", "ul", "ol"].includes(n.rawTagName?.toLowerCase()),
  );
  if (!temBloco) {
    const t = texto(no);
    return t ? t.split("\n").map((l) => indent + l).join("\n") : "";
  }

  for (const filho of no.childNodes) {
    if (filho.nodeType === 3) {
      const t = texto(filho);
      if (t) partes.push(t);
      continue;
    }
    if (filho.nodeType !== 1) continue;
    const tag = filho.rawTagName?.toLowerCase();
    if (tag === "p" || tag === "div") {
      const t = texto(filho);
      if (t) partes.push(t);
    } else if (tag === "ul" || tag === "ol") {
      const itens = filho.querySelectorAll("li").map((li) => `- ${texto(li)}`);
      partes.push(itens.join("\n"));
    } else {
      const t = texto(filho);
      if (t) partes.push(t);
    }
  }
  return partes.map((p) => p.split("\n").map((l) => indent + l).join("\n")).join("\n\n");
}

function converterCmdCard(card) {
  const titulo = card.querySelector(".cmd-title");
  const passo = titulo?.querySelector(".step-badge")?.text.trim() ?? "";

  /*
   * O título nem sempre é um único `<code>`: há passos que são instrução em
   * prosa ("Desligue e ligue a VM, cronometrando com o celular") e passos com
   * vários comandos encadeados. Pegar só o primeiro `<code>` perdia os dois
   * casos — usa-se o texto inteiro, menos o número do passo.
   */
  const cmd = titulo
    ? decodificar(titulo.text).replace(/^\s*\d+\s*/, "").replace(/\s+/g, " ").trim()
    : "";

  const linhas = [`<Comando passo={${passo || 0}} cmd=${atributo(cmd)}>`, ""];

  for (const bloco of card.childNodes.filter((n) => n.nodeType === 1)) {
    if (temClasse(bloco, "cmd-title")) continue;

    if (temClasse(bloco, "explain-grid")) {
      linhas.push("  <Explica>");
      for (const caixa of bloco.querySelectorAll(".explain-box")) {
        const rotulo = caixa.querySelector(".lbl")?.text.trim() ?? "";
        const corpo = caixa.childNodes
          .filter((n) => n.nodeType === 1 && !temClasse(n, "lbl"))
          .map((n) => texto(n))
          .filter(Boolean)
          .join("\n\n");
        linhas.push(`    <Caixa titulo=${atributo(rotulo)}>`, "");
        linhas.push(corpo.split("\n").map((l) => (l ? `    ${l}` : l)).join("\n"));
        linhas.push("", "    </Caixa>");
      }
      linhas.push("  </Explica>", "");
    } else if (temClasse(bloco, "terminal-mini")) {
      const corpo = bloco.querySelector(".body");
      if (corpo) linhas.push("  <Terminal>{`" + literal(sessaoTerminal(corpo)) + "`}</Terminal>", "");
    } else if (ehObsNote(bloco)) {
      // O rótulo "O que esperar:" vira o próprio componente.
      const t = texto(bloco).replace(/^\*\*O que esperar:?\*\*\s*/i, "");
      linhas.push("  <Esperar>", `    ${t}`, "  </Esperar>", "");
    } else if (temClasse(bloco, "warn-box")) {
      linhas.push(`  <Aviso titulo="Importante">`, "", paragrafos(bloco, "  "), "", "  </Aviso>", "");
    } else if (temClasse(bloco, "tip") || bloco.rawTagName?.toLowerCase() === "details") {
      const resumo = bloco.querySelector("summary")?.text.trim() ?? "Dica";
      const corpo = bloco.querySelector(".tip-body") ?? bloco;
      linhas.push(`  <Dica titulo=${atributo(resumo)}>`, "");
      linhas.push(paragrafos(corpo, "  "));
      linhas.push("", "  </Dica>", "");
    } else if (temClasse(bloco, "filebox")) {
      const nome = bloco.querySelector(".fname")?.text.trim() ?? "arquivo";
      const corpo = bloco.querySelector(".fbody");
      const conteudo = literal(decodificar(corpo?.text ?? "").trim());
      linhas.push(`  <Arquivo nome=${atributo(nome)}>{\`${conteudo}\`}</Arquivo>`, "");
    } else {
      relatar(bloco, "dentro de cmd-card");
    }
  }

  linhas.push("</Comando>", "");
  return linhas;
}

function converterRascunho(caixa, encontro) {
  const rotulo = caixa.querySelector("label");
  const id = caixa.querySelector("textarea")?.getAttribute("id") ?? "";
  const numero = Number((id.match(/(\d+)/) ?? [])[1] ?? 0);
  let pergunta = texto(rotulo ?? caixa).replace(/^Rascunho da observação \d+\s*[—–-]\s*/i, "");
  return [
    `<Rascunho encontro={${encontro}} numero={${numero}}>`,
    `  ${pergunta}`,
    `</Rascunho>`,
    "",
  ];
}

function converterBloco(no, encontro) {
  const linhas = [];

  if (temClasse(no, "block-num")) return linhas; // consumido pelo <Passo>

  if (no.rawTagName?.toLowerCase() === "p" && temClasse(no, "intro")) {
    linhas.push(`<Intro>${texto(no)}</Intro>`, "");
  } else if (temClasse(no, "cmd-card")) {
    linhas.push(...converterCmdCard(no));
  } else if (temClasse(no, "draft-box")) {
    linhas.push(...converterRascunho(no, encontro));
  } else if (temClasse(no, "obs-card")) {
    // Formato antigo do rascunho de observação (roteiro do Encontro 2):
    // título em <h3> em vez de <label>, pergunta em <p class="qtext">.
    const titulo = no.querySelector("h3")?.text ?? "";
    const numero = Number((titulo.match(/(\d+)/) ?? [])[1] ?? 0);
    // O h3 traz um assunto ("Observação 3 — /proc como janela virtual") que não
    // se repete na pergunta; preservá-lo evita perder informação.
    const assunto = decodificar(titulo).replace(/^\s*Observação\s*\d+\s*[—–-]\s*/i, "").trim();
    const pergunta = [assunto ? `**${assunto}.**` : "", texto(no.querySelector(".qtext") ?? no)]
      .filter(Boolean)
      .join(" ");
    linhas.push(
      `<Rascunho encontro={${encontro}} numero={${numero}}>`,
      `  ${pergunta}`,
      "</Rascunho>",
      "",
    );
  } else if (temClasse(no, "example-pair") || temClasse(no, "good-bad")) {
    linhas.push("<Exemplos>");
    for (const cx of no.querySelectorAll(".example-box, .gb-card")) {
      const tipo = cx.classList.contains("good") ? "forte" : "fraca";
      const corpo = cx.childNodes
        .filter((n) => n.nodeType === 1 && !temClasse(n, "lbl") && !temClasse(n, "gb-lbl"))
        .map((n) => texto(n))
        .filter(Boolean)
        .join("\n\n");
      linhas.push(`  <Exemplo tipo="${tipo}">`, "", `  ${corpo}`, "", "  </Exemplo>");
    }
    linhas.push("</Exemplos>", "");
  } else if (temClasse(no, "theory-link") || temClasse(no, "connect-box")) {
    // `paragrafos`, e não map sobre os filhos-elemento: no `connect-box` o
    // texto fica solto ao lado de um `<b>`, e percorrer só elementos o perderia.
    no.querySelector(".lbl")?.remove();
    const corpo = paragrafos(no, "").replace(/^\*\*Conectando com a teoria:?\*\*\s*/i, "");
    linhas.push("<Teoria>", "", corpo, "", "</Teoria>", "");
  } else if (temClasse(no, "checklist")) {
    // Dois formatos convivem: `ul > li` no padrão dominante e `div.check-item`
    // com `<label>` no roteiro do Encontro 2, anterior à padronização.
    const itens = no.querySelectorAll("li, .check-item");
    linhas.push(`<Checklist encontro={${encontro}}>`);
    itens.forEach((item, i) => {
      const rotulo = item.querySelector("span, label") ?? item;
      linhas.push(`  <Item id="item-${i + 1}">${texto(rotulo)}</Item>`);
    });
    linhas.push("</Checklist>", "");
  } else if (temClasse(no, "n1-card") || temClasse(no, "warn-box") || ehDestaque(no)) {
    const rotulo = no.querySelector(".lbl, .kicker, h3, h4");
    const titulo = rotulo?.text.trim() || (ehDestaque(no) ? no.childNodes.find((n) => n.nodeType === 1)?.text.trim() : "") || "Atenção";
    // Remove o próprio rótulo do corpo e preserva listas via `paragrafos`.
    if (rotulo) rotulo.remove();
    else if (ehDestaque(no)) no.childNodes.find((n) => n.nodeType === 1)?.remove();
    const componente = ehDestaque(no) ? "Destaque" : "Aviso";
    linhas.push(`<${componente} titulo=${atributo(titulo)}>`, "", paragrafos(no, ""), "", `</${componente}>`, "");
  } else if (temClasse(no, "footer-cta")) {
    linhas.push(paragrafos(no, ""), "");
  } else if (["h2", "h3"].includes(no.rawTagName?.toLowerCase())) {
    const t = texto(no);
    // Os títulos de checklist e exemplos já vêm dos próprios componentes.
    if (!/checklist final|observação (forte|fraca)/i.test(t)) linhas.push(`## ${t}`, "");
  } else if (no.rawTagName?.toLowerCase() === "p") {
    const t = texto(no);
    if (t) linhas.push(t, "");
  } else {
    relatar(no, "bloco");
  }

  return linhas;
}

// ── documento ────────────────────────────────────────────────────────────────

function converter(html, encontro) {
  const raiz = parse(html);
  const wrap = raiz.querySelector(".wrap") ?? raiz.querySelector("body");
  const saida = [];

  const hero = wrap.querySelector(".hero");
  if (hero) {
    /*
     * A duração fica no olho do cabeçalho no padrão dominante, mas no roteiro
     * do Encontro 2 ela vive num chip "DURAÇÃO". Sem procurar nos dois, aquele
     * arquivo herdava um valor inventado — e contradizia o próprio chip ao lado.
     */
    const eyebrow = hero.querySelector(".eyebrow")?.text ?? "";
    const chipDuracao =
      hero.querySelectorAll(".meta-chip").find((c) => /dura[çc][ãa]o/i.test(c.text))?.text ?? "";
    const duracao = (`${eyebrow} ${chipDuracao}`.match(/~?\s*\d+\s*min/i) ?? [""])[0].trim();
    if (!duracao) relatar(hero, "duração não encontrada no cabeçalho");
    const titulo = hero.querySelector("h1")?.text.trim() ?? "";
    const chamada = hero.querySelectorAll("p").map((p) => texto(p)).filter(Boolean).join("\n\n");

    saida.push(`<Abertura duracao=${atributo(duracao)} titulo=${atributo(titulo)}>`, "", chamada, "", "</Abertura>", "");

    // `part-chip` no padrão dominante; `meta-chip` (DURAÇÃO, PRÉ-REQUISITO,
    // ENTREGA) no roteiro do Encontro 2. Ambos são a mesma faixa de contexto.
    const chips = hero.querySelectorAll(".part-chip, .meta-chip");
    if (chips.length) {
      saida.push("<Partes>");
      for (const chip of chips) {
        const negrito = chip.querySelector("b");
        // Em `part-chip` o rótulo está em negrito e o resto é texto; em
        // `meta-chip` é o contrário — o rótulo é o texto solto.
        const rotulo = temClasse(chip, "meta-chip")
          ? decodificar(chip.childNodes.filter((n) => n.nodeType === 3).map((n) => n.rawText).join("")).trim()
          : (negrito?.text.trim() ?? "");
        const resto = temClasse(chip, "meta-chip")
          ? texto(negrito ?? chip)
          : texto(chip).replace(/^\*\*.*?\*\*\s*·?\s*/, "");
        saida.push(`  <Parte rotulo=${atributo(rotulo)}>${resto}</Parte>`);
      }
      saida.push("</Partes>", "");
    }
  }

  for (const no of wrap.childNodes.filter((n) => n.nodeType === 1)) {
    if (no === hero) continue;

    if (temClasse(no, "part-divider")) {
      saida.push(`<Divisor>${texto(no.querySelector(".label") ?? no)}</Divisor>`, "");
      continue;
    }

    if (no.rawTagName?.toLowerCase() === "section" && temClasse(no, "block")) {
      const num = no.querySelector(".block-num")?.text.trim() ?? "";
      const m = num.match(/PASSO\s+(\d+)\s+DE\s+(\d+)/i);
      const titulo = no.querySelector("h2")?.text.trim() ?? "";

      const corpo = [];
      for (const filho of no.childNodes.filter((n) => n.nodeType === 1)) {
        if (filho.querySelector && filho === no.querySelector("h2")) continue;
        if (temClasse(filho, "block-num")) continue;
        if (filho.rawTagName?.toLowerCase() === "h2") continue;
        corpo.push(...converterBloco(filho, encontro));
      }

      if (m) {
        saida.push(`<Passo numero={${m[1]}} de={${m[2]}} titulo=${atributo(titulo)}>`, "");
        saida.push(...corpo);
        saida.push("</Passo>", "");
      } else if (titulo && !/checklist final|observação (forte|fraca)/i.test(titulo)) {
        // Seção sem numeração, mas com nome próprio ("Registro no portfólio").
        const sobre = num ? ` sobretitulo=${atributo(num)}` : "";
        saida.push(`<Secao${sobre} titulo=${atributo(titulo)}>`, "");
        saida.push(...corpo);
        saida.push("</Secao>", "");
      } else {
        // Blocos cujo próprio componente já traz o título (exemplos, checklist).
        saida.push(...corpo);
      }
      continue;
    }

    saida.push(...converterBloco(no, encontro));
  }

  return saida.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

// ── execução ─────────────────────────────────────────────────────────────────

const [entrada, numeroBruto, saidaArquivo] = process.argv.slice(2);
if (!entrada || !numeroBruto) {
  console.error("uso: node scripts/converter-roteiro.mjs <entrada.html> <numero> [saida.mdx]");
  process.exit(1);
}

const encontro = Number(numeroBruto);
const mdx = converter(readFileSync(entrada, "utf8"), encontro);
const destino = saidaArquivo ?? `src/content/so/roteiros/${encontro}.mdx`;
writeFileSync(destino, mdx, "utf8");

console.log(`${entrada} → ${destino} (${mdx.split("\n").length} linhas)`);
if (naoReconhecidos.length) {
  console.log(`\n⚠️  ${naoReconhecidos.length} bloco(s) NÃO reconhecido(s) — tratar à mão:`);
  for (const item of naoReconhecidos) console.log(`   • ${item}`);
}
