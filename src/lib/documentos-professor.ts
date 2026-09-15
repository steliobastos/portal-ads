import "server-only";
import { clienteAdmin } from "./supabase/servidor";

/**
 * O material do professor publicado por `npm run professor:publicar`.
 *
 * Vive num bucket privado, não no repositório (que é público). Só as páginas de
 * `/professor`, depois de conferir a sessão, chamam este módulo.
 */

const BUCKET = "professor";

export type Documento = {
  /** Caminho no bucket, espelho de `curso/` — ex.: "aula6/Roteiro-Professor_Encontro-06.md". */
  caminho: string;
  /** Número do encontro, deduzido da pasta `aulaN`; `null` para material transversal. */
  encontro: number | null;
  titulo: string;
  atualizadoEm: string | null;
};

const TITULOS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Roteiro-Professor_Encontro-\d+$/, () => "Roteiro do professor"],
  [/^Checklist-Professor_Semana-0$/, () => "Checklist do professor"],
  [/^Rubrica_(N\d)_Etapa(\d)$/, (m) => `Rubrica · ${m[1]} da ${m[2]}ª etapa`],
  [/^Enunciado_Projeto_Integrador_Etapa(\d)$/, (m) => `Enunciado do projeto · ${m[1]}ª etapa`],
  [/^Mapa_de_Leituras.*$/, () => "Mapa de Leituras"],
];

function tituloDe(nomeArquivo: string): string {
  const base = nomeArquivo.replace(/\.md$/i, "");
  for (const [padrao, titulo] of TITULOS) {
    const m = base.match(padrao);
    if (m) return titulo(m);
  }
  return base.replace(/[_-]+/g, " ");
}

export async function listarDocumentos(): Promise<Documento[]> {
  const supabase = clienteAdmin();
  if (!supabase) return [];

  const documentos: Documento[] = [];
  async function percorrer(prefixo: string) {
    const { data, error } = await supabase!.storage.from(BUCKET).list(prefixo, { limit: 1000 });
    if (error) throw new Error(`Falha ao listar o material do professor: ${error.message}`);
    for (const item of data) {
      const caminho = prefixo ? `${prefixo}/${item.name}` : item.name;
      if (item.id === null) {
        await percorrer(caminho);
      } else if (item.name.toLowerCase().endsWith(".md")) {
        const pasta = prefixo.match(/^aula(\d+)$/);
        documentos.push({
          caminho,
          encontro: pasta ? Number(pasta[1]) : null,
          titulo: tituloDe(item.name),
          atualizadoEm: item.updated_at ?? null,
        });
      }
    }
  }
  await percorrer("");

  // Roteiro primeiro dentro de cada encontro: é o que o professor abre na véspera.
  const peso = (d: Documento) => (d.titulo.startsWith("Roteiro") || d.titulo.startsWith("Checklist") ? 0 : 1);
  return documentos.sort(
    (a, b) =>
      (a.encontro ?? -1) - (b.encontro ?? -1) || peso(a) - peso(b) || a.titulo.localeCompare(b.titulo),
  );
}

/** Aceita só caminhos no formato que o script de publicação gera. */
export function caminhoValido(caminho: string): boolean {
  return /^(aula\d+\/)?[\w.-]+\.md$/.test(caminho) && !caminho.includes("..");
}

export async function lerDocumento(caminho: string): Promise<string | null> {
  const supabase = clienteAdmin();
  if (!supabase || !caminhoValido(caminho)) return null;
  const { data, error } = await supabase.storage.from(BUCKET).download(caminho);
  if (error || !data) return null;
  return data.text();
}
