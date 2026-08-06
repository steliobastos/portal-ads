import { readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Quais encontros já têm roteiro em MDX.
 *
 * Lido do disco, não de uma lista escrita à mão — a mesma decisão do índice de
 * materiais: arquivo que não existe simplesmente não gera rota.
 *
 * Convive de propósito com os HTMLs de `public/material/`: a migração é
 * gradual, encontro a encontro. Existindo o `.mdx`, o portal mostra o roteiro
 * nativo; não existindo, continua oferecendo o HTML avulso. Assim nenhum
 * encontro fica sem material em nenhum momento da migração.
 */
export async function encontrosComRoteiro(disciplina: string): Promise<number[]> {
  try {
    const dir = join(process.cwd(), "src", "content", disciplina, "roteiros");
    const arquivos = await readdir(dir);
    return arquivos
      .filter((a) => a.endsWith(".mdx"))
      .map((a) => Number(a.replace(/\.mdx$/, "")))
      .filter(Number.isInteger)
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/** Se este encontro já tem roteiro nativo — decide qual card a página mostra. */
export async function temRoteiro(disciplina: string, numero: number): Promise<boolean> {
  return (await encontrosComRoteiro(disciplina)).includes(numero);
}
