import { describe, expect, it } from "vitest";
import type { ConteudoDisciplina } from "@/content";
import { celulaDoQuiz, notaDoPortfolio, passouDoPrazo, prazoDoQuiz, type CelulaPortfolio } from "./portfolio";

// Regras e calendário próprios do teste: as datas reais do cronograma mudam,
// e o teste não pode quebrar por isso.
const regras = {
  valorLeitura: 0.5,
  valorObservacoes: 0.5,
  descartaPiores: 1,
  prazosEspeciais: [{ encontros: [1, 2], prazo: "2026-09-24T23:59:59-03:00" }],
};

const conteudo = {
  encontros: [
    { numero: 1, data: "2026-08-14" },
    { numero: 2, data: "2026-08-21" },
    { numero: 3, data: "2026-09-25" },
    { numero: 4, data: "2026-12-25" },
  ],
  regrasNota: { portfolio: regras },
} as unknown as ConteudoDisciplina;

describe("prazoDoQuiz", () => {
  it("fecha na quinta-feira seguinte ao encontro, 23:59 de Horizonte", () => {
    expect(prazoDoQuiz(conteudo, 3)).toBe("2026-10-01T23:59:59-03:00");
  });

  it("atravessa a virada do ano", () => {
    expect(prazoDoQuiz(conteudo, 4)).toBe("2026-12-31T23:59:59-03:00");
  });

  it("usa o prazo especial quando o encontro tem um", () => {
    expect(prazoDoQuiz(conteudo, 2)).toBe("2026-09-24T23:59:59-03:00");
  });
});

describe("passouDoPrazo", () => {
  const prazo = "2026-10-01T23:59:59-03:00";
  it("23:59 de Horizonte ainda está no prazo", () => {
    expect(passouDoPrazo(prazo, "2026-10-02T02:59:00Z")).toBe(false);
  });
  it("meia-noite de Horizonte já passou", () => {
    expect(passouDoPrazo(prazo, "2026-10-02T03:00:00Z")).toBe(true);
  });
});

describe("celulaDoQuiz", () => {
  const quiz = { encontro: 3, prazo: "2026-10-01T23:59:59-03:00" };
  const noPrazo = "2026-09-30T12:00:00-03:00";
  const atrasado = "2026-10-03T12:00:00-03:00";

  it("sem envio vale zero", () => {
    expect(celulaDoQuiz(regras, quiz).pontos).toBe(0);
  });

  it("no prazo e aprovado vale leitura + observações", () => {
    const c = celulaDoQuiz(regras, quiz, { primeiroEnvio: noPrazo, aprovado: true });
    expect(c).toMatchObject({ situacao: "no-prazo", leitura: 0.5, observacoes: 0.5, pontos: 1 });
  });

  it("reprovado na leitura ainda vale as observações", () => {
    expect(celulaDoQuiz(regras, quiz, { primeiroEnvio: noPrazo, aprovado: false }).pontos).toBe(0.5);
  });

  it("observações marcadas como insuficientes valem zero", () => {
    const marca = { observacoesInsuficientes: true, atrasoAceito: false };
    expect(celulaDoQuiz(regras, quiz, { primeiroEnvio: noPrazo, aprovado: true }, marca).pontos).toBe(0.5);
  });

  it("atraso não aceito vale zero", () => {
    const c = celulaDoQuiz(regras, quiz, { primeiroEnvio: atrasado, aprovado: true });
    expect(c).toMatchObject({ situacao: "atrasado", pontos: 0 });
  });

  it("atraso aceito pelo professor vale normalmente", () => {
    const marca = { observacoesInsuficientes: false, atrasoAceito: true };
    const c = celulaDoQuiz(regras, quiz, { primeiroEnvio: atrasado, aprovado: true }, marca);
    expect(c).toMatchObject({ situacao: "atraso-aceito", pontos: 1 });
  });
});

describe("notaDoPortfolio", () => {
  const celula = (encontro: number, pontos: number) => ({ encontro, pontos }) as CelulaPortfolio;

  it("descarta o pior quiz e dá a média em 0–10", () => {
    const r = notaDoPortfolio(regras, [celula(1, 1), celula(2, 0), celula(3, 0.5), celula(4, 1)]);
    expect(r.descartados).toEqual([2]);
    expect(r.nota).toBe(8.3);
  });

  it("em empate, descarta o encontro mais antigo", () => {
    expect(notaDoPortfolio(regras, [celula(1, 0), celula(2, 0), celula(3, 1)]).descartados).toEqual([1]);
  });

  it("com um quiz só, não descarta nada", () => {
    expect(notaDoPortfolio(regras, [celula(1, 1)])).toEqual({ nota: 10, descartados: [] });
  });
});
