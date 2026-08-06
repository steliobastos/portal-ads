import type { MDXComponents } from "mdx/types";
import { COMPONENTES } from "@/components/mdx";

/**
 * Convenção do Next: todo MDX importado no App Router passa por aqui para
 * saber quais componentes usar. É o que faz `<Passo>` e `<Terminal>` existirem
 * dentro dos arquivos `.mdx` sem que eles precisem importar nada.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ...COMPONENTES };
}
