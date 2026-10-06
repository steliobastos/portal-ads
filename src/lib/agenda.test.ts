import { describe, expect, it } from "vitest";
import type { ConteudoDisciplina } from "@/content";
import { proximasAulas, proximoEncontroDe } from "./agenda";

const conteudo = (slug: string, datas: string[]) =>
  ({
    disciplina: { slug },
    encontros: datas.map((data, i) => ({ numero: i + 1, data })),
  }) as unknown as ConteudoDisciplina;

const hoje = new Date(2026, 9, 10, 15, 0); // 10/10/2026, 15h

describe("proximoEncontroDe", () => {
  it("o encontro de hoje ainda é o próximo", () => {
    expect(proximoEncontroDe(conteudo("so", ["2026-10-03", "2026-10-10"]), hoje)?.numero).toBe(2);
  });

  it("com um encontro adiado para depois do seguinte, escolhe a data mais próxima", () => {
    // Encontro 1 adiado para 23/10; o 2 continua em 16/10.
    expect(proximoEncontroDe(conteudo("so", ["2026-10-23", "2026-10-16"]), hoje)?.numero).toBe(2);
  });

  it("depois do último encontro, não há próximo", () => {
    expect(proximoEncontroDe(conteudo("so", ["2026-10-03"]), hoje)).toBeNull();
  });
});

describe("proximasAulas", () => {
  it("ordena as disciplinas pela data da próxima aula", () => {
    const r = proximasAulas([conteudo("a", ["2026-10-20"]), conteudo("b", ["2026-10-12"])], hoje);
    expect(r.map((p) => p.disciplina.slug)).toEqual(["b", "a"]);
  });
});
