import { conteudoDa, slugsPublicados } from "@/content";
import type { Disciplina, Encontro } from "@/content/tipos";
import { paraData } from "./datas";

export type ProximaAula = { disciplina: Disciplina; encontro: Encontro };

/** Meia-noite de hoje — o encontro de hoje ainda conta como "próximo". */
function referencia(hoje: Date): Date {
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}

/** O primeiro encontro que ainda não passou. `null` quando o semestre acabou. */
export function proximoEncontroDe(slug: string, hoje = new Date()): Encontro | null {
  const hoje0 = referencia(hoje);
  return conteudoDa(slug)?.encontros.find((e) => paraData(e.data) >= hoje0) ?? null;
}

/**
 * A próxima aula de cada disciplina publicada, em ordem de data.
 *
 * É o que a home usa para responder "o que vem agora" sem o aluno precisar
 * entrar em disciplina nenhuma. Com uma disciplina só, é uma linha; quando
 * Programação Web entrar, vira uma agenda de verdade — sem mudar o código.
 */
export function proximasAulas(hoje = new Date()): ProximaAula[] {
  return slugsPublicados()
    .flatMap((slug) => {
      const conteudo = conteudoDa(slug);
      const encontro = proximoEncontroDe(slug, hoje);
      return conteudo && encontro ? [{ disciplina: conteudo.disciplina, encontro }] : [];
    })
    .sort((a, b) => a.encontro.data.localeCompare(b.encontro.data));
}
