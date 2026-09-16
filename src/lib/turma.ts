import "server-only";
import { clienteAdmin } from "./supabase/servidor";

/**
 * A lista de alunos da turma (tabela `turma_alunos`).
 *
 * O formulário do aluno recebe só `{ id, nome }`: a matrícula nunca chega ao
 * navegador. Quando um envio volta com um `id`, é aqui que ele vira o par
 * nome + matrícula oficial — então nome e matrícula gravados no envio são
 * sempre os do diário, não o que alguém digitou.
 *
 * Tudo aqui funciona com a lista vazia: se o banco não estiver configurado ou
 * a turma ainda não tiver sido importada, os formulários voltam a pedir nome e
 * matrícula digitados.
 */

export type AlunoDaLista = { id: string; nome: string };
export type AlunoDaTurma = AlunoDaLista & { matricula: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Os alunos ativos da turma, em ordem alfabética. Só id e nome. */
export async function listaDaTurma(disciplina: string): Promise<AlunoDaLista[]> {
  const supabase = clienteAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("turma_alunos")
    .select("id, nome")
    .eq("disciplina", disciplina)
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("Falha ao ler a turma:", error.message);
    return [];
  }
  return (data ?? []) as AlunoDaLista[];
}

/** Um aluno da lista, pelo identificador que o formulário devolveu. */
export async function alunoDaTurma(disciplina: string, id: string): Promise<AlunoDaTurma | null> {
  const supabase = clienteAdmin();
  // O id vem do navegador: sem o formato certo, nem consulta o banco (o
  // Postgres recusaria a comparação com uuid e a consulta viraria erro).
  if (!supabase || !UUID.test(id)) return null;

  const { data } = await supabase
    .from("turma_alunos")
    .select("id, nome, matricula")
    .eq("disciplina", disciplina)
    .eq("id", id)
    .maybeSingle();

  return (data as AlunoDaTurma | null) ?? null;
}

/**
 * Troca o identificador escolhido na lista pelo nome e matrícula oficiais.
 *
 * Sem `alunoId`, devolve o que foi digitado — é o caminho de quem não está na
 * lista (matrícula nova, aluno que entrou depois) e o de quando não há lista.
 * `null` significa "identificador desconhecido": a lista mudou desde que a
 * página abriu.
 */
export async function identificar(
  disciplina: string,
  dados: { alunoId?: string | null; nome: string; matricula: string },
): Promise<{ nome: string; matricula: string } | null> {
  if (!dados.alunoId) return { nome: dados.nome, matricula: dados.matricula };
  const aluno = await alunoDaTurma(disciplina, dados.alunoId);
  return aluno && { nome: aluno.nome, matricula: aluno.matricula };
}

/** A turma inteira, com matrícula — para o painel do professor. */
export async function turmaCompleta(disciplina: string): Promise<AlunoDaTurma[]> {
  const supabase = clienteAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("turma_alunos")
    .select("id, nome, matricula")
    .eq("disciplina", disciplina)
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("Falha ao ler a turma:", error.message);
    return [];
  }
  return (data ?? []) as AlunoDaTurma[];
}
