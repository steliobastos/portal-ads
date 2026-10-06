"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { conteudoDa, slugsPublicados } from "@/content";
import { TIPOS_AJUSTE, validarAjuste, type TipoAjuste } from "@/lib/ajustes-calendario";
import { ETIQUETA_CALENDARIO } from "@/lib/calendario";
import { clienteAdmin, professorLogado } from "@/lib/supabase/servidor";

/**
 * Gravação dos ajustes da aba Calendário. São Server Actions — POSTs públicos —,
 * então a sessão do professor é conferida aqui dentro. Depois de gravar, o
 * calendário em cache é descartado e todas as páginas se regeneram.
 */

export type EstadoAjuste = { erro: string } | { ok: true } | null;

function republicar() {
  revalidateTag(ETIQUETA_CALENDARIO);
  revalidatePath("/", "layout");
}

export async function salvarAjuste(_estado: EstadoAjuste, form: FormData): Promise<EstadoAjuste> {
  if (!(await professorLogado())) return { erro: "Sessão expirada. Entre de novo." };
  const disciplina = String(form.get("disciplina") ?? "");
  if (!slugsPublicados().includes(disciplina)) return { erro: "Disciplina desconhecida." };

  const lido = validarAjuste(conteudoDa(disciplina)!, {
    tipo: String(form.get("tipo") ?? ""),
    chave: String(form.get("chave") ?? ""),
    data: String(form.get("data") ?? ""),
    hora: String(form.get("hora") ?? ""),
    motivo: String(form.get("motivo") ?? ""),
    ocultar: form.get("ocultar") === "1",
  });
  if (!lido.ok) return { erro: lido.erro };

  const { error } = await clienteAdmin()!
    .from("calendario_ajustes")
    .upsert(
      { disciplina, ...lido.ajuste, atualizado_em: new Date().toISOString() },
      { onConflict: "disciplina,tipo,chave" },
    );
  if (error) return { erro: `Não foi possível gravar: ${error.message}` };

  republicar();
  return { ok: true };
}

/** "Voltar ao planejado": apaga o ajuste. */
export async function removerAjuste(_estado: EstadoAjuste, form: FormData): Promise<EstadoAjuste> {
  if (!(await professorLogado())) return { erro: "Sessão expirada. Entre de novo." };
  const disciplina = String(form.get("disciplina") ?? "");
  const tipo = String(form.get("tipo") ?? "") as TipoAjuste;
  const chave = String(form.get("chave") ?? "");
  if (!slugsPublicados().includes(disciplina) || !TIPOS_AJUSTE.includes(tipo) || !chave || chave.length > 20) {
    return { erro: "Ajuste desconhecido." };
  }

  const { error } = await clienteAdmin()!
    .from("calendario_ajustes")
    .delete()
    .eq("disciplina", disciplina)
    .eq("tipo", tipo)
    .eq("chave", chave);
  if (error) return { erro: `Não foi possível apagar: ${error.message}` };

  republicar();
  return { ok: true };
}
