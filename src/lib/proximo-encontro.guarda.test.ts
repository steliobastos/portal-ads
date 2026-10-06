import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * "Qual é o próximo encontro" tem um dono só: `proximoEncontroDe`, em
 * `lib/agenda.ts`, que escolhe pela data. Uma página que procure o primeiro
 * encontro futuro pela ordem dos números erra quando um encontro é adiado
 * para depois do seguinte — foi o que a revisão do calendário editável achou
 * em três páginas.
 */
function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? arquivos(caminho) : /\.tsx?$/.test(nome) ? [caminho] : [];
  });
}

describe("próximo encontro", () => {
  it("nenhuma página procura o próximo encontro por conta própria", () => {
    const suspeitos = arquivos(join(process.cwd(), "src", "app")).filter((f) =>
      /encontros\.find\(\(e\) => (paraData\(e\.data\) >=|situacao\(e\.data\) === "futuro")/.test(
        readFileSync(f, "utf8"),
      ),
    );
    expect(suspeitos).toEqual([]);
  });
});

describe("calendário vigente", () => {
  it("toda página que mostra data lê o calendário vigente", () => {
    const semVigente = arquivos(join(process.cwd(), "src", "app")).filter((f) => {
      const s = readFileSync(f, "utf8");
      // Lê o vigente quem chama conteudoVigente(s) ou aplica os ajustes ela mesma (a aba Calendário).
      const mostraData = /\b(dataCurta|dataExtensa|diaEMes|momentoCampus)\(/.test(s);
      const leVigente = /\b(conteudoVigente|conteudosVigentes|aplicarAjustes)\(/.test(s);
      return mostraData && /\bconteudoDa\(/.test(s) && !leVigente;
    });
    expect(semVigente).toEqual([]);
  });
});
