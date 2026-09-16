"use server";

import { conteudoDa } from "@/content";
import { listaDaTurma, type AlunoDaLista } from "./turma";

/**
 * A lista de nomes que os formulários mostram.
 *
 * Carregada pelo navegador depois que a página abre, e não embutida no HTML,
 * de propósito: as páginas do portal são geradas no deploy e ficam em cache
 * público. Assim a lista da turma não vai parar num arquivo estático nem num
 * buscador — e, se a turma mudar, não é preciso publicar o site de novo.
 *
 * Devolve `[]` (e o formulário volta a pedir nome e matrícula digitados)
 * quando a disciplina não existe, o banco não está configurado ou a turma
 * ainda não foi importada.
 */
export async function carregarTurma(disciplina: string): Promise<AlunoDaLista[]> {
  if (!conteudoDa(disciplina)) return [];
  return listaDaTurma(disciplina);
}
