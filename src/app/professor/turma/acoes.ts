"use server";

import { revalidatePath } from "next/cache";
import { slugsPublicados } from "@/content";
import { compararTurma, decodificarCsv, lerTurmaCsv } from "@/lib/importar-turma";
import { clienteAdmin, professorLogado } from "@/lib/supabase/servidor";
import { turmaParaPainel } from "@/lib/turma";

/**
 * Importação da turma pelo painel, em dois tempos: `conferir` só calcula o que
 * vai mudar; `gravar` aplica. Os dois leem o arquivo de novo — o servidor nunca
 * grava a partir da prévia que o navegador mostrou.
 *
 * É uma Server Action, ou seja, um POST público: a sessão do professor é
 * conferida aqui dentro, e não só na página.
 */

const LIMITE_BYTES = 200 * 1024;

export type ResultadoImportacao =
  | { ok: false; erro: string; problemas?: string[] }
  | {
      ok: true;
      gravado: boolean;
      total: number;
      novos: { matricula: string; nome: string }[];
      renomeados: { matricula: string; de: string; para: string }[];
      voltam: { matricula: string; nome: string }[];
      saem: { matricula: string; nome: string }[];
      iguais: number;
    };

export async function importarTurma(form: FormData): Promise<ResultadoImportacao> {
  if (!(await professorLogado())) return { ok: false, erro: "Sessão expirada. Entre de novo." };

  const disciplina = String(form.get("disciplina") ?? "");
  const turma = String(form.get("turma") ?? "").trim().slice(0, 40);
  const arquivo = form.get("arquivo");
  const gravar = form.get("acao") === "gravar";

  if (!slugsPublicados().includes(disciplina)) return { ok: false, erro: "Disciplina desconhecida." };
  if (!(arquivo instanceof File) || arquivo.size === 0) return { ok: false, erro: "Escolha o arquivo CSV." };
  if (arquivo.size > LIMITE_BYTES) return { ok: false, erro: "Arquivo grande demais para uma lista de turma." };

  const { alunos, problemas } = lerTurmaCsv(decodificarCsv(new Uint8Array(await arquivo.arrayBuffer())));
  if (problemas.length) {
    return { ok: false, erro: "O arquivo tem linhas fora do formato — nada foi gravado.", problemas };
  }

  const atual = await turmaParaPainel(disciplina);
  const mudancas = compararTurma(atual, alunos);
  if (!gravar) return { ok: true, gravado: false, total: alunos.length, ...mudancas };

  const supabase = clienteAdmin()!;
  const agora = new Date().toISOString();
  const { error } = await supabase.from("turma_alunos").upsert(
    alunos.map((a) => ({ disciplina, ...a, turma, ativo: true, atualizado_em: agora })),
    { onConflict: "disciplina,matricula" },
  );
  if (error) return { ok: false, erro: `Falha ao gravar: ${error.message}` };

  // Quem saiu do diário sai da lista — sem apagar: os envios continuam valendo.
  if (mudancas.saem.length) {
    const { error: erroBaixa } = await supabase
      .from("turma_alunos")
      .update({ ativo: false, atualizado_em: agora })
      .eq("disciplina", disciplina)
      .in("matricula", mudancas.saem.map((a) => a.matricula));
    if (erroBaixa) {
      return { ok: false, erro: `Alunos gravados, mas não consegui tirar da lista quem saiu: ${erroBaixa.message}` };
    }
  }

  revalidatePath("/professor/turma");
  return { ok: true, gravado: true, total: alunos.length, ...mudancas };
}
