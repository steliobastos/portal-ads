"use server";

import { z } from "zod";
import { conteudoDa, quizDo } from "@/content";
import { clienteAdmin } from "@/lib/supabase/servidor";
import { passouDoPrazo, prazoDoQuiz } from "./portfolio";
import { corrigir, problemaNoEnvio, type Correcao } from "./quiz";
import { identificar } from "./turma";

/**
 * Envio do quiz semanal.
 *
 * Uma Server Action é, no fim das contas, um endpoint POST público: qualquer
 * pessoa pode chamá-la sem passar pelo formulário. Por isso nada do que chega
 * é confiado — o formato é validado com Zod, o quiz é buscado no servidor e a
 * correção é feita aqui, nunca recebida pronta do navegador.
 */

const Envio = z.object({
  disciplina: z.string().max(20),
  encontro: z.number().int().min(0).max(99),
  /** Preenchido quando o aluno se escolheu na lista da turma. */
  alunoId: z.string().max(64).nullish(),
  respostas: z.array(z.number().int()).max(20),
  observacoes: z.array(z.string().max(5000, "Observação longa demais.")).max(20),
});

/**
 * Quem enviou. Validado **depois** de resolver a lista da turma: quando o
 * aluno se escolheu na lista, nome e matrícula vêm do banco, e o que o
 * navegador mandou nesses dois campos é ignorado.
 */
const Aluno = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo.").max(120),
  matricula: z
    .string()
    .transform((m) => m.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]{4,20}$/, "Matrícula inválida: use só letras e números.")),
});

export type ResultadoEnvio =
  | { ok: true; correcao: Correcao; atrasado: boolean }
  | { ok: false; erro: string };

export async function enviarQuiz(
  dados: z.input<typeof Envio> & Partial<z.input<typeof Aluno>>,
): Promise<ResultadoEnvio> {
  const lido = Envio.safeParse(dados);
  if (!lido.success) return { ok: false, erro: lido.error.issues[0].message };

  const identidade = await identificar(lido.data.disciplina, {
    alunoId: lido.data.alunoId,
    nome: dados.nome ?? "",
    matricula: dados.matricula ?? "",
  });
  if (!identidade) {
    return { ok: false, erro: "Esse nome não está mais na lista da turma. Recarregue a página." };
  }
  const aluno = Aluno.safeParse(identidade);
  if (!aluno.success) return { ok: false, erro: aluno.error.issues[0].message };

  const envio = { ...lido.data, ...aluno.data };

  const quiz = quizDo(envio.disciplina, envio.encontro);
  if (!quiz) return { ok: false, erro: "Este quiz não existe." };

  const problema = problemaNoEnvio(quiz, envio.respostas, envio.observacoes);
  if (problema) return { ok: false, erro: problema };

  const supabase = clienteAdmin();
  if (!supabase) {
    return {
      ok: false,
      erro: "O envio de quizzes ainda não está ativo. Guarde suas respostas e avise o professor.",
    };
  }

  const correcao = corrigir(quiz, envio.respostas);
  const { error } = await supabase.from("submissoes_quiz").insert({
    disciplina: envio.disciplina,
    encontro: envio.encontro,
    matricula: envio.matricula,
    nome: envio.nome,
    respostas: envio.respostas,
    acertos: correcao.acertos,
    aprovado: correcao.aprovado,
    observacoes: envio.observacoes.map((o) => o.trim()),
  });

  if (error) {
    console.error("Falha ao gravar envio de quiz:", error.message);
    return {
      ok: false,
      erro: "Não foi possível gravar agora. Suas respostas continuam na tela — tente de novo em instantes.",
    };
  }

  // Envio atrasado é aceito e gravado; o painel mostra a marca e o professor
  // decide se conta. Aqui só se avisa o aluno.
  const conteudo = conteudoDa(envio.disciplina)!;
  return { ok: true, correcao, atrasado: passouDoPrazo(prazoDoQuiz(conteudo, envio.encontro)) };
}
