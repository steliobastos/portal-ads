import type { ConteudoDisciplina } from "@/content";

/**
 * Calendário vigente = planejamento do código + ajustes do professor.
 *
 * Funções puras, sem banco: a leitura dos ajustes fica em `calendario.ts`, e a
 * aba Calendário do painel grava. Sem ajustes, o resultado é idêntico ao
 * conteúdo do código — é o que garante que nada muda até o professor mexer.
 */

export type TipoAjuste = "encontro" | "prazo-quiz" | "prazo-entrega" | "sem-aula";
export const TIPOS_AJUSTE: TipoAjuste[] = ["encontro", "prazo-quiz", "prazo-entrega", "sem-aula"];

/**
 * Uma linha de `calendario_ajustes`. `valor` é data `AAAA-MM-DD` (encontro),
 * instante ISO com fuso (prazos) ou motivo (dia sem aula); `null` só para
 * ocultar um dia sem aula do código.
 */
export type AjusteCalendario = { tipo: TipoAjuste; chave: string; valor: string | null };

/** `AAAA-MM-DD` de um dia que existe no calendário. */
export function dataValida(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [ano, mes, dia] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

const DIA_MS = 24 * 60 * 60 * 1000;
const utc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

function diasEntre(de: string, ate: string): number {
  return Math.round((utc(ate) - utc(de)) / DIA_MS);
}

function somarDias(iso: string, dias: number): string {
  return new Date(utc(iso) + dias * DIA_MS).toISOString().slice(0, 10);
}

/**
 * Instante completo e com fuso. Sem fuso, o servidor (UTC na Vercel) leria a
 * hora como de Greenwich, e o prazo fecharia três horas antes em Horizonte.
 */
function prazoValido(valor: string | null): valor is string {
  return Boolean(
    valor &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/.test(valor) &&
      dataValida(valor.slice(0, 10)) &&
      !Number.isNaN(Date.parse(valor)),
  );
}

export function chaveDaEntrega(entrega: { etapa: number; fase: string }): string {
  return `${entrega.etapa}-${entrega.fase}`;
}

/** O ajuste aponta para algo que não existe no código, ou tem valor inválido. */
function ignorado(conteudo: ConteudoDisciplina, a: AjusteCalendario): boolean {
  switch (a.tipo) {
    case "encontro":
      return !conteudo.encontros.some((e) => String(e.numero) === a.chave) || !dataValida(a.valor ?? "");
    case "prazo-quiz":
      return !conteudo.quizzes.some((q) => String(q.encontro) === a.chave) || !prazoValido(a.valor);
    case "prazo-entrega":
      return (
        !conteudo.regrasNota.entregas.some((e) => chaveDaEntrega(e) === a.chave) || !prazoValido(a.valor)
      );
    case "sem-aula":
      return (
        !dataValida(a.chave) || (a.valor === null && !conteudo.semAula.some((d) => d.data === a.chave))
      );
    default:
      return true;
  }
}

/** Os ajustes que a leitura ignora — o painel os lista para o professor apagar. */
export function ajustesOrfaos(conteudo: ConteudoDisciplina, ajustes: AjusteCalendario[]): AjusteCalendario[] {
  return ajustes.filter((a) => ignorado(conteudo, a));
}

export function aplicarAjustes(conteudo: ConteudoDisciplina, ajustes: AjusteCalendario[]): ConteudoDisciplina {
  const validos = ajustes.filter((a) => !ignorado(conteudo, a));
  const valores = (tipo: TipoAjuste) =>
    new Map(validos.filter((a) => a.tipo === tipo).map((a) => [a.chave, a.valor]));

  const datas = valores("encontro");
  const encontros = conteudo.encontros.map((e) => {
    const data = datas.get(String(e.numero));
    return data ? { ...e, data } : e;
  });
  // Quantos dias cada encontro andou em relação ao planejado.
  const deslocamento = new Map(
    conteudo.encontros.map((e, i) => [e.numero, diasEntre(e.data, encontros[i].data)]),
  );

  // O ajuste de quiz entra à frente dos prazos especiais do código: `prazoDoQuiz`
  // usa o primeiro que encontrar, então a precedência sai de graça.
  const prazosQuiz = valores("prazo-quiz");
  const prazosAjustados = conteudo.quizzes.flatMap((q) => {
    const prazo = prazosQuiz.get(String(q.encontro));
    return prazo ? [{ encontros: [q.encontro], prazo }] : [];
  });

  const prazosEntrega = valores("prazo-entrega");

  const dias = valores("sem-aula");
  const doCodigo = conteudo.semAula
    .filter((d) => !(dias.has(d.data) && dias.get(d.data) === null))
    .map((d) => {
      const motivo = dias.get(d.data);
      return motivo ? { ...d, motivo } : d;
    });
  const acrescentados = [...dias]
    .filter(([data, motivo]) => motivo && !conteudo.semAula.some((d) => d.data === data))
    .map(([data, motivo]) => ({ data, motivo: motivo! }));

  return {
    ...conteudo,
    encontros,
    // O marco anda junto com o encontro em que cai, mantendo a distância
    // planejada: a N1 da 1ª etapa, por exemplo, fica uma semana depois do
    // Encontro 6 no código, e continua uma semana depois se ele for adiado.
    avaliacoes: conteudo.avaliacoes.map((a) => {
      const dias = deslocamento.get(a.encontro) ?? 0;
      return dias === 0 ? a : { ...a, data: somarDias(a.data, dias) };
    }),
    semAula: [...doCodigo, ...acrescentados].sort((a, b) => a.data.localeCompare(b.data)),
    regrasNota: {
      ...conteudo.regrasNota,
      portfolio: {
        ...conteudo.regrasNota.portfolio,
        prazosEspeciais: [...prazosAjustados, ...conteudo.regrasNota.portfolio.prazosEspeciais],
      },
      entregas: conteudo.regrasNota.entregas.map((e) => {
        const prazo = prazosEntrega.get(chaveDaEntrega(e));
        return prazo ? { ...e, prazo } : e;
      }),
    },
  };
}

/** Fuso do campus. Fortaleza não tem horário de verão, então o deslocamento é fixo. */
const FUSO = "-03:00";

/**
 * Data e hora do formulário → instante de Horizonte. Vale até o fim do minuto
 * (":59"), como os prazos do código ("23:59:59"). Aceita a hora com segundos,
 * que alguns navegadores enviam, e os descarta.
 */
export function prazoDeCampos(data: string, hora: string): string | null {
  const h = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.exec(hora);
  if (!dataValida(data) || !h) return null;
  return `${data}T${h[1]}:${h[2]}:59${FUSO}`;
}

/** Instante → data e hora de Horizonte, para preencher o formulário. */
export function camposDoPrazo(prazo: string): { data: string; hora: string } {
  const local = new Date(Date.parse(prazo) - 3 * 60 * 60 * 1000).toISOString();
  return { data: local.slice(0, 10), hora: local.slice(11, 16) };
}

export type EntradaAjuste = {
  tipo: string;
  chave: string;
  data?: string;
  hora?: string;
  motivo?: string;
  ocultar?: boolean;
};

type Validado = { ok: true; ajuste: AjusteCalendario } | { ok: false; erro: string };

/**
 * O que a aba Calendário enviou vira um ajuste — ou o motivo da recusa.
 * `conteudo` é sempre o planejamento do código (`conteudoDa`), nunca o vigente.
 */
export function validarAjuste(conteudo: ConteudoDisciplina, e: EntradaAjuste): Validado {
  const erro = (mensagem: string): Validado => ({ ok: false, erro: mensagem });

  switch (e.tipo) {
    case "encontro": {
      if (!conteudo.encontros.some((x) => String(x.numero) === e.chave)) return erro("Encontro desconhecido.");
      if (!dataValida(e.data ?? "")) return erro("Data inválida.");
      return { ok: true, ajuste: { tipo: "encontro", chave: e.chave, valor: e.data! } };
    }
    case "prazo-quiz":
    case "prazo-entrega": {
      const existe =
        e.tipo === "prazo-quiz"
          ? conteudo.quizzes.some((q) => String(q.encontro) === e.chave)
          : conteudo.regrasNota.entregas.some((x) => chaveDaEntrega(x) === e.chave);
      if (!existe) return erro(e.tipo === "prazo-quiz" ? "Este encontro não tem quiz." : "Entrega desconhecida.");
      const prazo = prazoDeCampos(e.data ?? "", e.hora ?? "");
      if (!prazo) return erro("Data ou hora inválida.");
      return { ok: true, ajuste: { tipo: e.tipo, chave: e.chave, valor: prazo } };
    }
    case "sem-aula": {
      if (!dataValida(e.chave)) return erro("Data inválida.");
      if (e.ocultar) {
        if (!conteudo.semAula.some((d) => d.data === e.chave)) return erro("Só dá para ocultar um dia do planejamento.");
        return { ok: true, ajuste: { tipo: "sem-aula", chave: e.chave, valor: null } };
      }
      const motivo = (e.motivo ?? "").replace(/\s+/g, " ").trim();
      if (motivo.length < 3 || motivo.length > 120) return erro("Informe o motivo (de 3 a 120 caracteres).");
      return { ok: true, ajuste: { tipo: "sem-aula", chave: e.chave, valor: motivo } };
    }
    default:
      return erro("Tipo de ajuste desconhecido.");
  }
}
