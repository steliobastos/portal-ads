import type { FormatoEntrega } from "@/content/tipos";

/**
 * Que arquivo cada entrega aceita — funções puras, usadas igualmente pelo
 * formulário (para avisar antes de enviar) e pelo servidor (que não confia no
 * formulário). O bucket `relatorios` repete as duas regras por conta própria:
 * só aceita os tipos abaixo e até 15 MB.
 */

export const LIMITE_ENTREGA_BYTES = 15 * 1024 * 1024;

export const FORMATOS = {
  pdf: {
    extensao: "pdf",
    nome: "PDF",
    artigo: "um PDF",
    /** O tipo com que o arquivo vai ao bucket — sempre explícito. */
    tipoEnvio: "application/pdf",
    tiposAceitos: ["application/pdf"],
    dicaTamanho: "Reduza a resolução dos prints.",
  },
  zip: {
    extensao: "zip",
    nome: ".zip",
    artigo: "um .zip",
    tipoEnvio: "application/zip",
    // O Windows informa .zip como x-zip-compressed.
    tiposAceitos: ["application/zip", "application/x-zip-compressed"],
    dicaTamanho: "Deixe de fora backups, logs e imagens geradas.",
  },
} as const satisfies Record<FormatoEntrega, unknown>;

/** Por que o arquivo não serve para a entrega, ou `null` se serve. */
export function problemaNoArquivo(
  formato: FormatoEntrega,
  arquivo: { nome: string; tipo: string; tamanho: number },
): string | null {
  const f = FORMATOS[formato];
  // Alguns navegadores entregam o tipo vazio: vale também a extensão.
  const tipoCerto =
    (f.tiposAceitos as readonly string[]).includes(arquivo.tipo) ||
    arquivo.nome.toLowerCase().endsWith(`.${f.extensao}`);
  if (!tipoCerto) return `O arquivo precisa ser ${f.artigo}.`;
  if (!(arquivo.tamanho > 0)) return "O arquivo está vazio.";
  if (arquivo.tamanho > LIMITE_ENTREGA_BYTES) return `O ${f.nome} passa de 15 MB. ${f.dicaTamanho}`;
  return null;
}

/**
 * O nome de arquivo que o servidor gera ao preparar uma entrega. Quando o
 * caminho volta do navegador para confirmar, só é aceito se tiver exatamente
 * essa forma — sem pasta, sem outra extensão.
 */
export function nomeGeradoValido(formato: FormatoEntrega, nome: string): boolean {
  return new RegExp(`^\\d+-[0-9a-f]{8}\\.${FORMATOS[formato].extensao}$`).test(nome);
}
