import { describe, expect, it } from "vitest";
import { conteudoDa, type ConteudoDisciplina } from "@/content";
import {
  ajustesOrfaos,
  aplicarAjustes,
  camposDoPrazo,
  dataValida,
  prazoDeCampos,
  validarAjuste,
  type AjusteCalendario,
} from "./ajustes-calendario";
import { prazoDoQuiz } from "./portfolio";

// Conteúdo mínimo e fictício: o teste não pode depender do cronograma real.
const base = {
  encontros: [
    { numero: 1, data: "2026-08-14" },
    { numero: 2, data: "2026-08-21" },
    { numero: 3, data: "2026-08-28" },
  ],
  quizzes: [{ encontro: 1 }, { encontro: 2 }],
  avaliacoes: [{ nota: "N1", etapa: 1, encontro: 2, data: "2026-08-21", instrumento: "Prova" }],
  semAula: [{ data: "2026-11-20", motivo: "Feriado" }],
  regrasNota: {
    portfolio: {
      valorLeitura: 0.5,
      valorObservacoes: 0.5,
      descartaPiores: 1,
      prazosEspeciais: [{ encontros: [1], prazo: "2026-09-24T23:59:59-03:00" }],
    },
    entregas: [
      { etapa: 1, fase: "parcial", nome: "P", secoes: "s", formato: "pdf", prazo: "2026-09-25T23:59:59-03:00" },
    ],
  },
} as unknown as ConteudoDisciplina;

const ajuste = (tipo: AjusteCalendario["tipo"], chave: string, valor: string | null): AjusteCalendario => ({
  tipo,
  chave,
  valor,
});

describe("dataValida", () => {
  it("aceita data que existe", () => expect(dataValida("2026-02-28")).toBe(true));
  it("recusa dia que não existe", () => expect(dataValida("2026-02-30")).toBe(false));
  it("recusa outro formato", () => expect(dataValida("28/02/2026")).toBe(false));
});

describe("aplicarAjustes", () => {
  it("sem ajustes, devolve exatamente o conteúdo do código", () => {
    const so = conteudoDa("so")!;
    expect(aplicarAjustes(so, [])).toEqual(so);
  });

  it("muda a data do encontro e a do marco de avaliação daquele encontro", () => {
    const r = aplicarAjustes(base, [ajuste("encontro", "2", "2026-08-28")]);
    expect(r.encontros[1].data).toBe("2026-08-28");
    expect(r.avaliacoes[0].data).toBe("2026-08-28");
  });

  it("marco que cai depois do encontro anda junto, mantendo a distância planejada", () => {
    const comMarcoDepois = {
      ...base,
      avaliacoes: [{ nota: "N1", etapa: 1, encontro: 2, data: "2026-08-28", instrumento: "Entrega" }],
    } as unknown as ConteudoDisciplina;
    const r = aplicarAjustes(comMarcoDepois, [ajuste("encontro", "2", "2026-09-04")]);
    expect(r.avaliacoes[0].data).toBe("2026-09-11");
  });

  it("adiar a aula move o prazo do quiz para a nova quinta-feira", () => {
    const r = aplicarAjustes(base, [ajuste("encontro", "2", "2026-09-04")]);
    expect(prazoDoQuiz(r, 2)).toBe("2026-09-10T23:59:59-03:00");
  });

  it("prazo de quiz ajustado vence o prazo especial do código", () => {
    const r = aplicarAjustes(base, [ajuste("prazo-quiz", "1", "2026-10-01T23:59:59-03:00")]);
    expect(prazoDoQuiz(r, 1)).toBe("2026-10-01T23:59:59-03:00");
  });

  it("prazo de quiz ajustado vence a regra da quinta, mesmo com a aula adiada", () => {
    const r = aplicarAjustes(base, [
      ajuste("encontro", "2", "2026-09-04"),
      ajuste("prazo-quiz", "2", "2026-09-30T23:59:59-03:00"),
    ]);
    expect(prazoDoQuiz(r, 2)).toBe("2026-09-30T23:59:59-03:00");
  });

  it("ajuste de entrega substitui o prazo do código", () => {
    const r = aplicarAjustes(base, [ajuste("prazo-entrega", "1-parcial", "2026-09-28T23:59:59-03:00")]);
    expect(r.regrasNota.entregas[0].prazo).toBe("2026-09-28T23:59:59-03:00");
  });

  it("acrescenta dia sem aula, em ordem de data", () => {
    const r = aplicarAjustes(base, [ajuste("sem-aula", "2026-11-02", "Recesso")]);
    expect(r.semAula).toEqual([
      { data: "2026-11-02", motivo: "Recesso" },
      { data: "2026-11-20", motivo: "Feriado" },
    ]);
  });

  it("oculta um dia sem aula do código", () => {
    expect(aplicarAjustes(base, [ajuste("sem-aula", "2026-11-20", null)]).semAula).toEqual([]);
  });

  it("ignora ajuste que aponta para o que não existe no código", () => {
    const r = aplicarAjustes(base, [
      ajuste("encontro", "99", "2026-09-04"),
      ajuste("prazo-quiz", "3", "2026-09-30T23:59:59-03:00"),
      ajuste("prazo-entrega", "2-final", "2026-12-10T23:59:59-03:00"),
    ]);
    expect(r).toEqual(aplicarAjustes(base, []));
  });

  it("ignora valor inválido gravado direto no banco", () => {
    const r = aplicarAjustes(base, [
      ajuste("encontro", "2", "abc"),
      ajuste("prazo-quiz", "2", "2026-09-30"),
      ajuste("sem-aula", "2026-13-01", "Recesso"),
    ]);
    expect(r).toEqual(aplicarAjustes(base, []));
  });

  it("ignora prazo sem fuso ou em dia que não existe", () => {
    const r = aplicarAjustes(base, [
      ajuste("prazo-quiz", "2", "2026-09-30T23:59:59"),
      ajuste("prazo-entrega", "1-parcial", "2026-02-30T23:59:59-03:00"),
    ]);
    expect(r).toEqual(aplicarAjustes(base, []));
  });

  it("não altera o conteúdo recebido", () => {
    const antes = JSON.stringify(base);
    aplicarAjustes(base, [ajuste("encontro", "2", "2026-09-04"), ajuste("sem-aula", "2026-11-02", "Recesso")]);
    expect(JSON.stringify(base)).toBe(antes);
  });
});

describe("ajustesOrfaos", () => {
  it("lista os ajustes que a leitura ignora", () => {
    const orfaos = [ajuste("encontro", "99", "2026-09-04"), ajuste("encontro", "2", "abc")];
    const validos = [ajuste("encontro", "1", "2026-08-15"), ajuste("sem-aula", "2026-11-20", null)];
    expect(ajustesOrfaos(base, [...validos, ...orfaos])).toEqual(orfaos);
  });

  it("ocultar um dia que não está no código é órfão", () => {
    expect(ajustesOrfaos(base, [ajuste("sem-aula", "2026-11-02", null)])).toHaveLength(1);
  });
});

describe("prazoDeCampos", () => {
  it("monta o instante de Horizonte até o fim do minuto", () => {
    expect(prazoDeCampos("2026-10-15", "23:59")).toBe("2026-10-15T23:59:59-03:00");
  });
  it("aceita hora com segundos, como alguns navegadores enviam", () => {
    expect(prazoDeCampos("2026-10-15", "23:59:00")).toBe("2026-10-15T23:59:59-03:00");
  });
  it("recusa hora inválida", () => expect(prazoDeCampos("2026-10-15", "24:00")).toBeNull());
  it("recusa data inválida", () => expect(prazoDeCampos("2026-02-30", "23:59")).toBeNull());
});

describe("camposDoPrazo", () => {
  it("devolve data e hora de Horizonte", () => {
    expect(camposDoPrazo("2026-10-15T23:59:59-03:00")).toEqual({ data: "2026-10-15", hora: "23:59" });
  });
  it("converte instante em UTC para Horizonte", () => {
    expect(camposDoPrazo("2026-10-16T02:59:59Z")).toEqual({ data: "2026-10-15", hora: "23:59" });
  });
});

describe("validarAjuste", () => {
  it("aceita nova data de encontro", () => {
    expect(validarAjuste(base, { tipo: "encontro", chave: "2", data: "2026-09-04" })).toEqual({
      ok: true,
      ajuste: { tipo: "encontro", chave: "2", valor: "2026-09-04" },
    });
  });

  it("recusa encontro que não existe", () => {
    expect(validarAjuste(base, { tipo: "encontro", chave: "9", data: "2026-09-04" })).toEqual({
      ok: false,
      erro: "Encontro desconhecido.",
    });
  });

  it("recusa data inválida", () => {
    expect(validarAjuste(base, { tipo: "encontro", chave: "2", data: "" })).toEqual({
      ok: false,
      erro: "Data inválida.",
    });
  });

  it("aceita prazo de quiz e de entrega", () => {
    expect(validarAjuste(base, { tipo: "prazo-quiz", chave: "1", data: "2026-10-01", hora: "23:59" })).toEqual({
      ok: true,
      ajuste: { tipo: "prazo-quiz", chave: "1", valor: "2026-10-01T23:59:59-03:00" },
    });
    expect(
      validarAjuste(base, { tipo: "prazo-entrega", chave: "1-parcial", data: "2026-09-28", hora: "18:00" }),
    ).toEqual({
      ok: true,
      ajuste: { tipo: "prazo-entrega", chave: "1-parcial", valor: "2026-09-28T18:00:59-03:00" },
    });
  });

  it("recusa prazo de quiz para encontro sem quiz", () => {
    expect(validarAjuste(base, { tipo: "prazo-quiz", chave: "3", data: "2026-10-01", hora: "23:59" })).toEqual({
      ok: false,
      erro: "Este encontro não tem quiz.",
    });
  });

  it("acrescenta dia sem aula com motivo", () => {
    expect(validarAjuste(base, { tipo: "sem-aula", chave: "2026-11-02", motivo: "  Recesso  escolar " })).toEqual({
      ok: true,
      ajuste: { tipo: "sem-aula", chave: "2026-11-02", valor: "Recesso escolar" },
    });
  });

  it("recusa dia sem aula sem motivo", () => {
    expect(validarAjuste(base, { tipo: "sem-aula", chave: "2026-11-02", motivo: "" })).toEqual({
      ok: false,
      erro: "Informe o motivo (de 3 a 120 caracteres).",
    });
  });

  it("oculta dia sem aula do código", () => {
    expect(validarAjuste(base, { tipo: "sem-aula", chave: "2026-11-20", ocultar: true })).toEqual({
      ok: true,
      ajuste: { tipo: "sem-aula", chave: "2026-11-20", valor: null },
    });
  });

  it("recusa ocultar dia que não está no planejamento", () => {
    expect(validarAjuste(base, { tipo: "sem-aula", chave: "2026-11-02", ocultar: true })).toEqual({
      ok: false,
      erro: "Só dá para ocultar um dia do planejamento.",
    });
  });

  it("recusa tipo desconhecido", () => {
    expect(validarAjuste(base, { tipo: "feriado", chave: "x" })).toEqual({
      ok: false,
      erro: "Tipo de ajuste desconhecido.",
    });
  });
});
