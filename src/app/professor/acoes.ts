"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { quizDo } from "@/content";
import { clienteAdmin, clienteSessao, professorLogado } from "@/lib/supabase/servidor";

export type EstadoLogin = { erro: string } | null;

export async function entrar(_anterior: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const supabase = await clienteSessao();
  if (!supabase) return { erro: "O banco de dados ainda não está configurado." };

  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? ""),
    password: String(form.get("senha") ?? ""),
  });
  // Mensagem única para e-mail inexistente e senha errada: não confirmar a
  // quem tenta adivinhar qual e-mail tem conta.
  if (error) return { erro: "E-mail ou senha incorretos." };

  redirect("/professor");
}

export async function sair() {
  const supabase = await clienteSessao();
  await supabase?.auth.signOut();
  redirect("/professor");
}

const CAMPOS = {
  observacoes: "observacoes_insuficientes",
  atraso: "atraso_aceito",
} as const;

/**
 * Liga ou desliga uma das duas marcas do professor sobre o quiz de um aluno.
 * É uma Server Action — um POST público —, então a sessão é conferida aqui
 * dentro, e não só na página que mostra o botão.
 */
export async function marcar(form: FormData) {
  if (!(await professorLogado())) return;

  const disciplina = String(form.get("disciplina"));
  const encontro = Number(form.get("encontro"));
  const matricula = String(form.get("matricula"));
  const campo = CAMPOS[String(form.get("campo")) as keyof typeof CAMPOS];
  const valor = form.get("valor") === "true";
  if (!campo || !quizDo(disciplina, encontro) || !matricula) return;

  const supabase = clienteAdmin();
  const { error } = await supabase!
    .from("avaliacoes_portfolio")
    .upsert(
      { disciplina, encontro, matricula, [campo]: valor, atualizado_em: new Date().toISOString() },
      { onConflict: "disciplina,encontro,matricula" },
    );
  if (error) throw new Error(`Falha ao gravar a marcação: ${error.message}`);

  revalidatePath("/professor", "layout");
}
