import { describe, expect, it } from "vitest";
import type { Quiz } from "@/content/tipos";
import { acertosParaCredito, corrigir, problemaNoEnvio, quizPublico, resumoDoEnvio } from "./quiz";

const quiz = {
  encontro: 1,
  leituras: [],
  perguntas: [
    { enunciado: "P1", alternativas: ["a", "b", "c", "d"], correta: 0, justificativa: "j1" },
    { enunciado: "P2", alternativas: ["a", "b", "c", "d"], correta: 2, justificativa: "j2" },
    { enunciado: "P3", alternativas: ["a", "b", "c", "d"], correta: 3, justificativa: "j3" },
  ],
  observacoes: [
    { rotulo: "O1", minimo: 40 },
    { rotulo: "O2", minimo: 40 },
  ],
} as unknown as Quiz;

const obs = "x".repeat(40);

describe("acertosParaCredito", () => {
  it("exige 2 de 3", () => expect(acertosParaCredito(3)).toBe(2));
  it("arredonda para cima quando 2/3 não é inteiro", () => expect(acertosParaCredito(4)).toBe(3));
});

describe("corrigir", () => {
  it("dá crédito com 2 acertos em 3", () => {
    const c = corrigir(quiz, [0, 2, 0]);
    expect(c.acertos).toBe(2);
    expect(c.aprovado).toBe(true);
  });

  it("não dá crédito com 1 acerto em 3", () => {
    const c = corrigir(quiz, [0, 1, 1]);
    expect(c.acertos).toBe(1);
    expect(c.aprovado).toBe(false);
  });

  it("devolve a alternativa correta e a justificativa de cada pergunta", () => {
    expect(corrigir(quiz, [1, 1, 1]).porPergunta[1]).toEqual({ marcada: 1, correta: 2, justificativa: "j2" });
  });
});

describe("quizPublico", () => {
  it("não entrega gabarito nem justificativa ao navegador", () => {
    const texto = JSON.stringify(quizPublico(quiz));
    expect(texto).not.toContain("correta");
    expect(texto).not.toContain("justificativa");
  });
});

describe("problemaNoEnvio", () => {
  it("aceita um envio completo", () => {
    expect(problemaNoEnvio(quiz, [0, 0, 0], [obs, obs])).toBeNull();
  });

  it("recusa pergunta sem resposta", () => {
    expect(problemaNoEnvio(quiz, [0, 0], [obs, obs])).toBe("Responda todas as perguntas.");
  });

  it("recusa alternativa que não existe", () => {
    expect(problemaNoEnvio(quiz, [0, 4, 0], [obs, obs])).toBe("Responda a pergunta 2.");
  });

  it("recusa observação abaixo do mínimo, contando sem os espaços das pontas", () => {
    expect(problemaNoEnvio(quiz, [0, 0, 0], [obs, `  ${"x".repeat(39)}  `])).toBe(
      "A observação 2 precisa de pelo menos 40 caracteres.",
    );
  });
});

describe("resumoDoEnvio", () => {
  const aprovado = corrigir(quiz, [0, 2, 3]);
  const reprovado = corrigir(quiz, [1, 1, 1]);

  it("primeiro envio aprovado dá crédito", () => {
    expect(resumoDoEnvio(aprovado, { reenvio: false, atrasado: false })).toMatchObject({
      titulo: "3 de 3 acertos — crédito no portfólio ✓",
      tom: "secondary",
    });
  });

  it("primeiro envio reprovado fica sem crédito", () => {
    expect(resumoDoEnvio(reprovado, { reenvio: false, atrasado: false })).toMatchObject({
      titulo: "0 de 3 acertos — ainda sem crédito",
      tom: "alert",
    });
  });

  it("reenvio não promete crédito, porque vale o primeiro envio", () => {
    const r = resumoDoEnvio(aprovado, { reenvio: true, atrasado: false });
    expect(r.titulo).toBe("3 de 3 acertos neste reenvio");
    expect(r.tom).toBe("neutro");
    expect(r.avisoReenvio).toBe(true);
  });

  it("avisa do atraso no primeiro envio", () => {
    expect(resumoDoEnvio(aprovado, { reenvio: false, atrasado: true }).avisoAtraso).toBe(true);
  });

  it("reenvio depois do prazo não vira atraso: o atraso é medido pelo primeiro envio", () => {
    expect(resumoDoEnvio(aprovado, { reenvio: true, atrasado: true }).avisoAtraso).toBe(false);
  });
});
