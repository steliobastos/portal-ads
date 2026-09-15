import type { ComponentType } from "react";

/**
 * Carregamento dos roteiros em MDX.
 *
 * O caminho do `import()` é relativo e com prefixo fixo de propósito: assim o
 * empacotador cria um módulo de contexto para a pasta inteira e resolve
 * `${numero}.mdx` em tempo de build. Roteiro novo é um arquivo novo na pasta —
 * nenhum nome de arquivo escrito à mão no código, a mesma regra do índice de
 * materiais.
 *
 * O mapa tem uma linha por disciplina. Isso é aceitável: disciplina nova é uma
 * decisão consciente, ao contrário de um nome de arquivo.
 */
type ModuloRoteiro = { default: ComponentType };

const CARREGADORES: Record<string, (numero: number) => Promise<ModuloRoteiro>> = {
  so: (numero) => import(`./so/roteiros/${numero}.mdx`),
};

/** Enunciados do projeto integrador, um `.mdx` por etapa — mesma mecânica dos roteiros. */
const CARREGADORES_PROJETO: Record<string, (etapa: number) => Promise<ModuloRoteiro>> = {
  so: (etapa) => import(`./so/projetos/${etapa}.mdx`),
};

export async function carregarProjeto(
  disciplina: string,
  etapa: number,
): Promise<ComponentType | null> {
  try {
    return (await CARREGADORES_PROJETO[disciplina]?.(etapa))?.default ?? null;
  } catch {
    return null;
  }
}

/** O componente do roteiro, ou `null` quando o encontro ainda não foi migrado. */
export async function carregarRoteiro(
  disciplina: string,
  numero: number,
): Promise<ComponentType | null> {
  const carregar = CARREGADORES[disciplina];
  if (!carregar) return null;

  try {
    const modulo = await carregar(numero);
    return modulo.default;
  } catch {
    return null;
  }
}
