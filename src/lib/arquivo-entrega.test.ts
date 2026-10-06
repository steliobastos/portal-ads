import { describe, expect, it } from "vitest";
import { FORMATOS, LIMITE_ENTREGA_BYTES, nomeGeradoValido, problemaNoArquivo } from "./arquivo-entrega";

const MB = 1024 * 1024;

describe("problemaNoArquivo", () => {
  it("aceita PDF", () => {
    expect(problemaNoArquivo("pdf", { nome: "raio-x.pdf", tipo: "application/pdf", tamanho: 2 * MB })).toBeNull();
  });

  it("aceita .zip com o tipo que o Windows informa", () => {
    const zip = { nome: "toolkit.zip", tipo: "application/x-zip-compressed", tamanho: MB };
    expect(problemaNoArquivo("zip", zip)).toBeNull();
  });

  it("aceita pela extensão quando o navegador não informa o tipo", () => {
    expect(problemaNoArquivo("zip", { nome: "TOOLKIT.ZIP", tipo: "", tamanho: MB })).toBeNull();
  });

  it("recusa PDF numa entrega de .zip", () => {
    expect(problemaNoArquivo("zip", { nome: "toolkit.pdf", tipo: "application/pdf", tamanho: MB })).toBe(
      "O arquivo precisa ser um .zip.",
    );
  });

  it("recusa .zip numa entrega de PDF", () => {
    expect(problemaNoArquivo("pdf", { nome: "raio-x.zip", tipo: "application/zip", tamanho: MB })).toBe(
      "O arquivo precisa ser um PDF.",
    );
  });

  it("recusa arquivo vazio", () => {
    expect(problemaNoArquivo("zip", { nome: "t.zip", tipo: "application/zip", tamanho: 0 })).toBe(
      "O arquivo está vazio.",
    );
  });

  it("recusa arquivo acima de 15 MB, com a dica de cada formato", () => {
    const grande = { tipo: "", tamanho: LIMITE_ENTREGA_BYTES + 1 };
    expect(problemaNoArquivo("pdf", { nome: "r.pdf", ...grande })).toBe(
      "O PDF passa de 15 MB. Reduza a resolução dos prints.",
    );
    expect(problemaNoArquivo("zip", { nome: "t.zip", ...grande })).toBe(
      "O .zip passa de 15 MB. Deixe de fora backups, logs e imagens geradas.",
    );
  });
});

describe("nomeGeradoValido", () => {
  it("aceita o nome que o servidor gera, com a extensão do formato", () => {
    expect(nomeGeradoValido("zip", "1791293029331-0a1b2c3d.zip")).toBe(true);
  });

  it("recusa a extensão de outro formato", () => {
    expect(nomeGeradoValido("zip", "1791293029331-0a1b2c3d.pdf")).toBe(false);
  });

  it("recusa caminho com pasta, para não sair da pasta da entrega", () => {
    expect(nomeGeradoValido("pdf", "../1791293029331-0a1b2c3d.pdf")).toBe(false);
  });
});

describe("FORMATOS", () => {
  it("cada formato declara o tipo com que o arquivo é enviado ao bucket", () => {
    expect(FORMATOS.pdf.tipoEnvio).toBe("application/pdf");
    expect(FORMATOS.zip.tipoEnvio).toBe("application/zip");
  });
});
