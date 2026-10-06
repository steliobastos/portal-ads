import { describe, expect, it } from "vitest";
import { compararTurma, decodificarCsv, lerTurmaCsv } from "./importar-turma";

// Mesmo cabeçalho do CSV que o diário exporta; nomes fictícios.
const CABECALHO = "#;Matrícula;Nome;T. Faltas;%Freq;Situação;Nota Etapa 1";

describe("lerTurmaCsv", () => {
  it("lê matrícula e nome e ignora as outras colunas", () => {
    const r = lerTurmaCsv(`${CABECALHO}\n1;20261001;Ana Souza;2;90;Cursando;\n2;20261002;Bruno Lima;0;100;Cursando;`);
    expect(r.problemas).toEqual([]);
    expect(r.alunos).toEqual([
      { matricula: "20261001", nome: "Ana Souza" },
      { matricula: "20261002", nome: "Bruno Lima" },
    ]);
  });

  it("aceita BOM, CRLF, linha em branco e campo entre aspas", () => {
    const r = lerTurmaCsv(`﻿${CABECALHO}\r\n1;20261001;"Souza; Ana";0;100;Cursando;\r\n\r\n`);
    expect(r.alunos).toEqual([{ matricula: "20261001", nome: "Souza; Ana" }]);
  });

  it("normaliza a matrícula e os espaços do nome", () => {
    const r = lerTurmaCsv(`${CABECALHO}\n1; 2026 10ab ;  Ana   Souza ;;;;`);
    expect(r.alunos).toEqual([{ matricula: "202610AB", nome: "Ana Souza" }]);
  });

  it("recusa arquivo sem as colunas de matrícula e nome", () => {
    expect(lerTurmaCsv("a;b;c\n1;2;3").problemas[0]).toMatch(/colunas de matrícula e nome/);
  });

  it("recusa arquivo sem nenhum aluno", () => {
    expect(lerTurmaCsv(CABECALHO).problemas).toEqual(["O arquivo não tem nenhuma linha de aluno."]);
  });

  it("aponta linha fora do formato pelo número da linha", () => {
    const r = lerTurmaCsv(`${CABECALHO}\n1;20261001;Ana Souza;;;;\n2;12;B;;;;`);
    expect(r.problemas).toEqual(['Linha 3: matrícula "12", nome "B".']);
  });

  it("aponta matrícula repetida", () => {
    const r = lerTurmaCsv(`${CABECALHO}\n1;20261001;Ana Souza;;;;\n2;20261001;Ana S.;;;;`);
    expect(r.problemas).toEqual(["Linha 3: matrícula 20261001 repetida no arquivo."]);
  });
});

describe("decodificarCsv", () => {
  it("lê UTF-8", () => {
    expect(decodificarCsv(new TextEncoder().encode("Matrícula"))).toBe("Matrícula");
  });

  it("lê o arquivo salvo pelo Excel em Windows-1252, sem estragar os acentos", () => {
    // "Matrícula" com o í em Windows-1252 (0xED), que não é UTF-8 válido.
    const bytes = new Uint8Array([0x4d, 0x61, 0x74, 0x72, 0xed, 0x63, 0x75, 0x6c, 0x61]);
    expect(decodificarCsv(bytes)).toBe("Matrícula");
  });
});

describe("compararTurma", () => {
  const atual = [
    { matricula: "1", nome: "Ana Souza", ativo: true },
    { matricula: "2", nome: "Bruno Lima", ativo: true },
    { matricula: "3", nome: "Carla Dias", ativo: false },
    { matricula: "4", nome: "Davi Melo", ativo: true },
  ];
  const arquivo = [
    { matricula: "1", nome: "Ana Souza" },
    { matricula: "2", nome: "Bruno Lima Costa" },
    { matricula: "3", nome: "Carla Dias" },
    { matricula: "5", nome: "Eva Nunes" },
  ];
  const r = compararTurma(atual, arquivo);

  it("separa quem é novo", () => expect(r.novos).toEqual([{ matricula: "5", nome: "Eva Nunes" }]));

  it("separa quem mudou de nome", () =>
    expect(r.renomeados).toEqual([{ matricula: "2", de: "Bruno Lima", para: "Bruno Lima Costa" }]));

  it("separa quem estava inativo e volta", () =>
    expect(r.voltam).toEqual([{ matricula: "3", nome: "Carla Dias" }]));

  it("separa quem sai da lista (só entre os ativos)", () =>
    expect(r.saem).toEqual([{ matricula: "4", nome: "Davi Melo" }]));

  it("conta quem fica igual", () => expect(r.iguais).toBe(1));
});
