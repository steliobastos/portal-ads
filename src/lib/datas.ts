/**
 * Utilitários de data.
 *
 * As datas do conteúdo são strings ISO (AAAA-MM-DD) sem fuso. Elas são
 * interpretadas como data local — nunca via `new Date("2026-08-14")`, que o
 * JavaScript trata como UTC e, a oeste de Greenwich, devolve o dia anterior.
 */

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** "14/08" — formato curto usado em tabelas e cartões. */
export function dataCurta(iso: string): string {
  const d = paraData(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "14" e "ago" — as duas metades do selo de data usado nos cartões da home. */
export function diaEMes(iso: string): { dia: string; mes: string } {
  const d = paraData(iso);
  return {
    dia: String(d.getDate()).padStart(2, "0"),
    mes: MESES[d.getMonth()].slice(0, 3),
  };
}

/** "14 de agosto de 2026" — formato por extenso. */
export function dataExtensa(iso: string): string {
  const d = paraData(iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * "24/09 às 23:59", no horário do campus, para instantes com fuso (prazos,
 * envios). O servidor da Vercel roda em UTC e o navegador pode estar em
 * qualquer lugar: o fuso é fixado, não herdado de quem renderiza.
 */
export function momentoCampus(iso: string, comDiaDaSemana = false): string {
  const d = new Date(iso);
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    weekday: comDiaDaSemana ? "long" : undefined,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const v = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  const semana = comDiaDaSemana ? `${v("weekday")}, ` : "";
  return `${semana}${v("day")}/${v("month")} às ${v("hour")}:${v("minute")}`;
}

/** Tamanho máximo do PDF de relatório — o mesmo configurado no bucket do Supabase. */
export const LIMITE_PDF_BYTES = 15 * 1024 * 1024;

export type SituacaoEncontro = "concluido" | "proximo" | "futuro";

/**
 * Situação de um encontro em relação a hoje. O "próximo" é o primeiro encontro
 * que ainda não passou — é ele que o portal destaca na capa da disciplina.
 */
export function situacao(iso: string, hoje = new Date()): Exclude<SituacaoEncontro, "proximo"> {
  const d = paraData(iso);
  const referencia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return d < referencia ? "concluido" : "futuro";
}
