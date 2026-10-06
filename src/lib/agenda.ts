import type { ConteudoDisciplina } from "@/content";
import type { Disciplina, Encontro } from "@/content/tipos";
import { paraData } from "./datas";

export type ProximaAula = { disciplina: Disciplina; encontro: Encontro };

/** Meia-noite de hoje — o encontro de hoje ainda conta como "próximo". */
function referencia(hoje: Date): Date {
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}

/**
 * O encontro de data mais próxima que ainda não passou. `null` quando o
 * semestre acabou. Escolhe pela data, não pela ordem dos números: com o
 * calendário ajustável, um encontro adiado pode cair depois do seguinte.
 *
 * Recebe o conteúdo já com as datas vigentes (`conteudoVigente`).
 */
export function proximoEncontroDe(conteudo: ConteudoDisciplina | undefined, hoje = new Date()): Encontro | null {
  const hoje0 = referencia(hoje);
  const futuros = (conteudo?.encontros ?? []).filter((e) => paraData(e.data) >= hoje0);
  return futuros.sort((a, b) => a.data.localeCompare(b.data))[0] ?? null;
}

/**
 * A próxima aula de cada disciplina, em ordem de data — o "o que vem agora"
 * da home, sem o aluno precisar entrar em disciplina nenhuma.
 */
export function proximasAulas(conteudos: ConteudoDisciplina[], hoje = new Date()): ProximaAula[] {
  return conteudos
    .flatMap((conteudo) => {
      const encontro = proximoEncontroDe(conteudo, hoje);
      return encontro ? [{ disciplina: conteudo.disciplina, encontro }] : [];
    })
    .sort((a, b) => a.encontro.data.localeCompare(b.encontro.data));
}
