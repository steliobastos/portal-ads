import "server-only";
import { unstable_cache } from "next/cache";
import { conteudoDa, slugsPublicados, type ConteudoDisciplina } from "@/content";
import { aplicarAjustes, type AjusteCalendario } from "./ajustes-calendario";
import { clienteAdmin } from "./supabase/servidor";

/**
 * O calendário vigente: planejamento do código + ajustes do professor
 * (tabela `calendario_ajustes`). Toda página e ação que mostra ou calcula data
 * usa `conteudoVigente` em vez de `conteudoDa`.
 *
 * A leitura fica em cache com a etiqueta `calendario`: um build de ~70 páginas
 * faz uma consulta, não setenta. Salvar na aba Calendário invalida a etiqueta.
 */

export const ETIQUETA_CALENDARIO = "calendario";

/** Leitura sem cache, que **lança** em caso de erro — para o painel. */
export async function lerAjustesDireto(disciplina: string): Promise<AjusteCalendario[]> {
  const supabase = clienteAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("calendario_ajustes")
    .select("tipo, chave, valor")
    .eq("disciplina", disciplina);
  if (error) throw new Error(`Falha ao ler o calendário: ${error.message}`);
  return (data ?? []) as AjusteCalendario[];
}

// Erro lança dentro do cache e por isso não é guardado: a próxima leitura tenta de novo.
const lerAjustesEmCache = unstable_cache(lerAjustesDireto, ["calendario-ajustes"], {
  tags: [ETIQUETA_CALENDARIO],
  revalidate: 3600,
});

/** Ajustes para o site. Com o banco fora do ar, vale o planejamento do código. */
export async function ajustesDa(disciplina: string): Promise<AjusteCalendario[]> {
  try {
    return await lerAjustesEmCache(disciplina);
  } catch (erro) {
    console.error("Calendário: usando o planejamento do código.", erro);
    return [];
  }
}

export async function conteudoVigente(slug: string): Promise<ConteudoDisciplina | undefined> {
  const conteudo = conteudoDa(slug);
  return conteudo && aplicarAjustes(conteudo, await ajustesDa(slug));
}

/** O conteúdo vigente de todas as disciplinas publicadas. */
export async function conteudosVigentes(): Promise<ConteudoDisciplina[]> {
  const todos = await Promise.all(slugsPublicados().map(conteudoVigente));
  return todos.filter((c): c is ConteudoDisciplina => Boolean(c));
}
