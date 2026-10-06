import { describe, expect, it } from "vitest";
import { consolidar, type EnvioQuiz } from "./envios";

let proximoId = 1;
function envio(dados: Partial<EnvioQuiz>): EnvioQuiz {
  return {
    id: proximoId++,
    encontro: 3,
    matricula: "2026001",
    nome: "Ana Souza",
    acertos: 3,
    aprovado: true,
    observacoes: ["obs"],
    enviado_em: "2026-09-26T10:00:00-03:00",
    anulado_em: null,
    ...dados,
  };
}

describe("consolidar", () => {
  it("vale o acerto do primeiro envio e as observações do último", () => {
    const r = consolidar([
      envio({ acertos: 1, aprovado: false, observacoes: ["curta"], enviado_em: "2026-09-26T10:00:00-03:00" }),
      envio({ acertos: 3, aprovado: true, observacoes: ["completa"], enviado_em: "2026-09-27T10:00:00-03:00" }),
    ]);
    expect(r.valido).toMatchObject({
      acertos: 1,
      aprovado: false,
      observacoes: ["completa"],
      primeiroEnvio: "2026-09-26T10:00:00-03:00",
      ultimoEnvio: "2026-09-27T10:00:00-03:00",
    });
  });

  it("ignora o envio desconsiderado: o seguinte passa a ser o primeiro", () => {
    const r = consolidar([
      envio({ acertos: 0, aprovado: false, anulado_em: "2026-10-06T10:00:00-03:00" }),
      envio({ acertos: 2, aprovado: true, enviado_em: "2026-09-27T10:00:00-03:00" }),
    ]);
    expect(r.valido).toMatchObject({ acertos: 2, aprovado: true, primeiroEnvio: "2026-09-27T10:00:00-03:00" });
    expect(r.desconsiderados).toBe(1);
  });

  it("sem nenhum envio válido, não há situação para contar", () => {
    const r = consolidar([envio({ anulado_em: "2026-10-06T10:00:00-03:00" })]);
    expect(r.valido).toBeNull();
  });

  it("guarda o histórico completo, em ordem, marcando os desconsiderados", () => {
    const a = envio({ acertos: 0, anulado_em: "2026-10-06T10:00:00-03:00" });
    const b = envio({ acertos: 2 });
    expect(consolidar([a, b]).historico).toEqual([
      { id: a.id, enviadoEm: a.enviado_em, acertos: 0, anulado: true },
      { id: b.id, enviadoEm: b.enviado_em, acertos: 2, anulado: false },
    ]);
  });

  it("aponta nomes diferentes na mesma matrícula, inclusive em envio desconsiderado", () => {
    const r = consolidar([
      envio({ nome: "Bruno Lima", anulado_em: "2026-10-06T10:00:00-03:00" }),
      envio({ nome: "Ana Souza" }),
    ]);
    expect(r.nomesDivergentes).toEqual(["Bruno Lima", "Ana Souza"]);
  });
});
