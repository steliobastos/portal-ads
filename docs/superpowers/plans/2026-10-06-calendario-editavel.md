# Calendário editável pelo painel — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** o professor ajusta, pela aba Calendário do painel, a data dos encontros, os prazos de quiz e de entrega e os dias sem aula, e o site inteiro reflete o ajuste em instantes, sem deploy.

**Architecture:** o código continua com o planejamento; a tabela `calendario_ajustes` guarda só os ajustes. Uma função pura (`aplicarAjustes`) devolve o `ConteudoDisciplina` com as datas vigentes, e `conteudoVigente(slug)` (servidor, com cache etiquetado `calendario`) passa a ser a porta de entrada de toda página e ação que lida com data. Salvar no painel invalida a etiqueta e regenera as páginas.

**Tech Stack:** Next.js 15 (App Router, Server Actions, `unstable_cache`, `revalidateTag`/`revalidatePath`), React 19 (`useActionState`), Supabase (Postgres via `@supabase/supabase-js`), Vitest 5, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-06-calendario-editavel-design.md`

## Global Constraints

- O planejamento continua no código; o banco guarda **só ajustes**. Sem ajustes, o conteúdo vigente é idêntico ao do código.
- Tabela `calendario_ajustes`, chave primária `(disciplina, tipo, chave)`, RLS ligada **sem políticas**.
- Tipos: `encontro` · `prazo-quiz` · `prazo-entrega` · `sem-aula`. Chave de entrega: `"<etapa>-<fase>"`.
- Precedência do prazo de quiz: ajuste do quiz › prazo especial do código › quinta-feira seguinte à data **vigente** do encontro, 23:59.
- Data do marco de avaliação é derivada da data vigente do encontro.
- Horários de Horizonte, `-03:00` fixo; prazo do painel grava `AAAA-MM-DDTHH:MM:59-03:00`; 23:59 é o padrão.
- Falha ao ler o banco: vale o planejamento do código, com log. O site nunca fica sem cronograma.
- Ao salvar: `revalidateTag("calendario")` + `revalidatePath("/", "layout")`. Páginas com data têm `revalidate = 3600`.
- Toda Server Action confere `professorLogado()`.
- Repositório público: nada de dado de aluno em código, teste ou commit. Mensagens de commit em português sem acento, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Comentários e textos de interface em português, no estilo do código vizinho.

## Review Focus

1. **Encontro adiado para depois do seguinte** — o "próximo encontro" deve ser o de data mais próxima ainda por vir, não o de menor número. (Teste na Task 3.)
2. **Campo de hora que o navegador envia com segundos** (`23:59:00`) — deve ser aceito, não recusado como inválido. (Teste na Task 2.)
3. **Valor inválido gravado direto no banco** (data `"abc"`, prazo sem fuso) — a leitura ignora o ajuste e o painel o lista como "não vale", em vez de quebrar páginas. (Teste na Task 1.)
4. **Banco fora do ar durante o build ou a leitura** — o site sai com as datas planejadas. (Verificação manual na Task 4: build sem variáveis do Supabase.)
5. **Ocultar um dia sem aula que não está no planejamento** — recusado com mensagem, não gravado como ajuste fantasma. (Teste na Task 2.)

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/ajustes-calendario.ts` (novo) | Regra pura: tipos, validade de data/prazo, `aplicarAjustes`, `ajustesOrfaos`, conversão de campos do formulário, `validarAjuste`. |
| `src/lib/ajustes-calendario.test.ts` (novo) | Testes da regra pura. |
| `src/lib/calendario.ts` (novo) | Servidor: leitura dos ajustes (direta e em cache), `conteudoVigente`, `conteudosVigentes`. |
| `src/lib/agenda.ts` | "Próximo encontro" passa a receber conteúdo, e escolhe pela data. |
| `src/lib/agenda.test.ts` (novo) | Testes do próximo encontro. |
| `supabase/migrations/20261006160000_calendario_ajustes.sql` (novo) | Tabela. |
| `scripts/copiar-banco.mjs` | Inclui a tabela nova na cópia de segurança. |
| Páginas e ações com data (Task 4) | Trocam `conteudoDa` por `await conteudoVigente`. |
| `src/app/professor/calendario/{acoes.ts,form-ajuste.tsx,page.tsx}` (novos) | Aba Calendário. |
| `src/app/professor/moldura.tsx` | Aba nova no menu do painel. |

---

### Task 1: Regra pura de precedência

**Files:**
- Create: `src/lib/ajustes-calendario.ts`
- Test: `src/lib/ajustes-calendario.test.ts`

**Interfaces:**
- Consumes: `ConteudoDisciplina` (`@/content`), `prazoDoQuiz` (`@/lib/portfolio`, só nos testes).
- Produces:
  - `type TipoAjuste = "encontro" | "prazo-quiz" | "prazo-entrega" | "sem-aula"`
  - `const TIPOS_AJUSTE: TipoAjuste[]`
  - `type AjusteCalendario = { tipo: TipoAjuste; chave: string; valor: string | null }`
  - `dataValida(iso: string): boolean`
  - `chaveDaEntrega(entrega: { etapa: number; fase: string }): string`
  - `aplicarAjustes(conteudo: ConteudoDisciplina, ajustes: AjusteCalendario[]): ConteudoDisciplina`
  - `ajustesOrfaos(conteudo: ConteudoDisciplina, ajustes: AjusteCalendario[]): AjusteCalendario[]`

- [ ] **Step 1: Escrever os testes**

`src/lib/ajustes-calendario.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { conteudoDa, type ConteudoDisciplina } from "@/content";
import { ajustesOrfaos, aplicarAjustes, dataValida, type AjusteCalendario } from "./ajustes-calendario";
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/ajustes-calendario.test.ts`
Expected: FAIL — `Cannot find module './ajustes-calendario'`.

- [ ] **Step 3: Implementar**

`src/lib/ajustes-calendario.ts`:

```ts
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

function prazoValido(valor: string | null): valor is string {
  return Boolean(valor && /^\d{4}-\d{2}-\d{2}T/.test(valor) && !Number.isNaN(Date.parse(valor)));
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
  const dataDo = new Map(encontros.map((e) => [e.numero, e.data]));

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
    // A data do marco é sempre a do encontro em que ele cai.
    avaliacoes: conteudo.avaliacoes.map((a) => ({ ...a, data: dataDo.get(a.encontro) ?? a.data })),
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: PASS, todos os testes (os 59 anteriores + os novos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ajustes-calendario.ts src/lib/ajustes-calendario.test.ts
git commit -m "Regra pura do calendario vigente: planejamento mais ajustes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Validação do que o painel envia

**Files:**
- Modify: `src/lib/ajustes-calendario.ts` (acrescentar ao fim)
- Test: `src/lib/ajustes-calendario.test.ts` (acrescentar ao fim)

**Interfaces:**
- Consumes: `dataValida`, `chaveDaEntrega`, `AjusteCalendario` (Task 1).
- Produces:
  - `prazoDeCampos(data: string, hora: string): string | null`
  - `camposDoPrazo(prazo: string): { data: string; hora: string }`
  - `type EntradaAjuste = { tipo: string; chave: string; data?: string; hora?: string; motivo?: string; ocultar?: boolean }`
  - `validarAjuste(conteudo: ConteudoDisciplina, entrada: EntradaAjuste): { ok: true; ajuste: AjusteCalendario } | { ok: false; erro: string }` — `conteudo` é sempre o **planejado** (`conteudoDa`).

- [ ] **Step 1: Escrever os testes** (acrescentar ao fim de `ajustes-calendario.test.ts`; acrescentar `camposDoPrazo, prazoDeCampos, validarAjuste` ao `import` de `./ajustes-calendario`)

```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/ajustes-calendario.test.ts`
Expected: FAIL — `prazoDeCampos is not a function` (e as demais funções novas).

- [ ] **Step 3: Implementar** (acrescentar ao fim de `src/lib/ajustes-calendario.ts`)

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ajustes-calendario.ts src/lib/ajustes-calendario.test.ts
git commit -m "Valida os ajustes de calendario enviados pelo painel

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Tabela, leitura vigente e próximo encontro

**Files:**
- Create: `supabase/migrations/20261006160000_calendario_ajustes.sql`
- Create: `src/lib/calendario.ts`
- Modify: `src/lib/agenda.ts` (arquivo inteiro)
- Create: `src/lib/agenda.test.ts`
- Modify: `scripts/copiar-banco.mjs` (lista `TABELAS`)

**Interfaces:**
- Consumes: `aplicarAjustes`, `AjusteCalendario` (Task 1); `clienteAdmin` (`@/lib/supabase/servidor`); `conteudoDa`, `slugsPublicados`, `ConteudoDisciplina` (`@/content`).
- Produces:
  - `ETIQUETA_CALENDARIO = "calendario"`
  - `lerAjustesDireto(disciplina: string): Promise<AjusteCalendario[]>` — sem cache, **lança** em erro (painel).
  - `ajustesDa(disciplina: string): Promise<AjusteCalendario[]>` — com cache, `[]` em erro (site).
  - `conteudoVigente(slug: string): Promise<ConteudoDisciplina | undefined>`
  - `conteudosVigentes(): Promise<ConteudoDisciplina[]>`
  - `proximoEncontroDe(conteudo: ConteudoDisciplina | undefined, hoje?: Date): Encontro | null`
  - `proximasAulas(conteudos: ConteudoDisciplina[], hoje?: Date): ProximaAula[]`

- [ ] **Step 1: Teste do próximo encontro**

`src/lib/agenda.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/agenda.test.ts`
Expected: FAIL — `proximoEncontroDe` ainda recebe `slug` (erro de tipo/valor) e escolhe pela ordem dos números.

- [ ] **Step 3: Reescrever `src/lib/agenda.ts`**

```ts
import type { ConteudoDisciplina } from "@/content";
import type { Disciplina, Encontro } from "@/content/tipos";
import { paraData } from "./datas";

export type ProximaAula = { disciplina: Disciplina; encontro: Encontro };

/** Meia-noite de hoje — o encontro de hoje ainda conta como "próximo". */
function referencia(hoje: Date): Date {
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}

/**
 * O encontro de data mais próxima que ainda não passou. `null` quando o
 * semestre acabou. Escolhe pela data, não pela ordem dos números: com o
 * calendário ajustável, um encontro adiado pode cair depois do seguinte.
 *
 * Recebe o conteúdo já com as datas vigentes (`conteudoVigente`).
 */
export function proximoEncontroDe(conteudo: ConteudoDisciplina | undefined, hoje = new Date()): Encontro | null {
  const hoje0 = referencia(hoje);
  const futuros = (conteudo?.encontros ?? []).filter((e) => paraData(e.data) >= hoje0);
  return futuros.sort((a, b) => a.data.localeCompare(b.data))[0] ?? null;
}

/**
 * A próxima aula de cada disciplina, em ordem de data — o "o que vem agora"
 * da home, sem o aluno precisar entrar em disciplina nenhuma.
 */
export function proximasAulas(conteudos: ConteudoDisciplina[], hoje = new Date()): ProximaAula[] {
  return conteudos
    .flatMap((conteudo) => {
      const encontro = proximoEncontroDe(conteudo, hoje);
      return encontro ? [{ disciplina: conteudo.disciplina, encontro }] : [];
    })
    .sort((a, b) => a.encontro.data.localeCompare(b.encontro.data));
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/agenda.test.ts`
Expected: PASS. (`npm run typecheck` ainda falha em `src/app/page.tsx` e `src/app/disciplinas/page.tsx` — corrigido na Task 4.)

- [ ] **Step 5: Migração**

`supabase/migrations/20261006160000_calendario_ajustes.sql`:

```sql
-- Ajustes do calendário feitos pelo professor na aba Calendário do painel.
--
-- O planejamento do semestre continua no código (src/content/so/); esta tabela
-- guarda só o que mudou. Sem linhas, o site mostra exatamente o planejamento.
--
--   tipo           chave                 valor
--   encontro       número ("9")          data AAAA-MM-DD
--   prazo-quiz     número do encontro    instante ISO com fuso
--   prazo-entrega  "<etapa>-<fase>"      instante ISO com fuso
--   sem-aula       data AAAA-MM-DD       motivo; null = ocultar dia do código
--
-- "Voltar ao planejado" apaga a linha. RLS ligada e sem políticas: só o
-- servidor do portal, com a chave secreta, lê e grava.

create table public.calendario_ajustes (
  disciplina    text        not null,
  tipo          text        not null check (tipo in ('encontro', 'prazo-quiz', 'prazo-entrega', 'sem-aula')),
  chave         text        not null,
  valor         text,
  atualizado_em timestamptz not null default now(),
  primary key (disciplina, tipo, chave)
);

alter table public.calendario_ajustes enable row level security;
```

Aplicar em produção pelo MCP do Supabase (`apply_migration`, nome `calendario_ajustes`, projeto `webcnejhnszjzsbakqhc`) e conferir:

```sql
select relname, relrowsecurity from pg_class where relname = 'calendario_ajustes';
```
Expected: uma linha, `relrowsecurity = true`.

- [ ] **Step 6: Leitura vigente**

`src/lib/calendario.ts`:

```ts
import "server-only";
import { unstable_cache } from "next/cache";
import { conteudoDa, slugsPublicados, type ConteudoDisciplina } from "@/content";
import { aplicarAjustes, type AjusteCalendario } from "./ajustes-calendario";
import { clienteAdmin } from "./supabase/servidor";

/**
 * O calendário vigente: planejamento do código + ajustes do professor
 * (tabela `calendario_ajustes`). Toda página e ação que mostra ou calcula data
 * usa `conteudoVigente` em vez de `conteudoDa`.
 *
 * A leitura fica em cache com a etiqueta `calendario`: um build de ~70 páginas
 * faz uma consulta, não setenta. Salvar na aba Calendário invalida a etiqueta.
 */

export const ETIQUETA_CALENDARIO = "calendario";

/** Leitura sem cache, que **lança** em caso de erro — para o painel. */
export async function lerAjustesDireto(disciplina: string): Promise<AjusteCalendario[]> {
  const supabase = clienteAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("calendario_ajustes")
    .select("tipo, chave, valor")
    .eq("disciplina", disciplina);
  if (error) throw new Error(`Falha ao ler o calendário: ${error.message}`);
  return (data ?? []) as AjusteCalendario[];
}

// Erro lança dentro do cache e por isso não é guardado: a próxima leitura tenta de novo.
const lerAjustesEmCache = unstable_cache(lerAjustesDireto, ["calendario-ajustes"], {
  tags: [ETIQUETA_CALENDARIO],
  revalidate: 3600,
});

/** Ajustes para o site. Com o banco fora do ar, vale o planejamento do código. */
export async function ajustesDa(disciplina: string): Promise<AjusteCalendario[]> {
  try {
    return await lerAjustesEmCache(disciplina);
  } catch (erro) {
    console.error("Calendário: usando o planejamento do código.", erro);
    return [];
  }
}

export async function conteudoVigente(slug: string): Promise<ConteudoDisciplina | undefined> {
  const conteudo = conteudoDa(slug);
  return conteudo && aplicarAjustes(conteudo, await ajustesDa(slug));
}

/** O conteúdo vigente de todas as disciplinas publicadas. */
export async function conteudosVigentes(): Promise<ConteudoDisciplina[]> {
  const todos = await Promise.all(slugsPublicados().map(conteudoVigente));
  return todos.filter((c): c is ConteudoDisciplina => Boolean(c));
}
```

- [ ] **Step 7: Cópia de segurança inclui a tabela**

Em `scripts/copiar-banco.mjs`, na lista `TABELAS`, depois de `["turma_alunos", "nome"],` acrescentar:

```js
  ["calendario_ajustes", "tipo"],
```

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/20261006160000_calendario_ajustes.sql src/lib/calendario.ts src/lib/agenda.ts src/lib/agenda.test.ts scripts/copiar-banco.mjs
git commit -m "Tabela de ajustes do calendario e leitura da versao vigente

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: O site lê a versão vigente

**Files (todas Modify):**
- `src/app/page.tsx`, `src/app/disciplinas/page.tsx`
- `src/app/[disciplina]/page.tsx`, `src/app/[disciplina]/encontros/page.tsx`, `src/app/[disciplina]/encontros/[numero]/page.tsx`, `src/app/[disciplina]/encontros/[numero]/quiz/page.tsx`, `src/app/[disciplina]/cronograma/page.tsx`, `src/app/[disciplina]/avaliacao/page.tsx`, `src/app/[disciplina]/projeto/[etapa]/page.tsx`, `src/app/[disciplina]/projeto/[etapa]/roteiro/page.tsx`
- `src/app/professor/page.tsx`, `src/app/professor/portfolio/page.tsx`, `src/app/professor/relatorios/page.tsx`, `src/app/professor/exportar/route.ts`, `src/app/professor/roteiros/page.tsx`
- `src/lib/acoes-quiz.ts`, `src/lib/acoes-entrega.ts`

**Interfaces:**
- Consumes: `conteudoVigente`, `conteudosVigentes` (Task 3); `proximoEncontroDe(conteudo)`, `proximasAulas(conteudos)` (Task 3).
- Produces: nada novo — o comportamento sem ajustes é idêntico ao atual.

- [ ] **Step 1: Retrato das páginas antes da troca**

Com `.env.local` presente (o build lê o banco; a tabela está vazia):

```bash
npm run build && (PORT=3212 npx next start -p 3212 > "$TEMP/antes.log" 2>&1 &)
until curl -s -o /dev/null http://localhost:3212/; do sleep 1; done
mkdir -p "$TEMP/retrato/antes"
for p in / /disciplinas /so /so/encontros /so/encontros/9 /so/encontros/7/quiz /so/cronograma /so/avaliacao /so/projeto/1 /so/projeto/2 /so/projeto/1/roteiro; do
  curl -s "http://localhost:3212$p" | node -e 'const h=require("fs").readFileSync(0,"utf8");console.log(h.replace(/<script[\s\S]*?<\/script>/g,"").replace(/<style[\s\S]*?<\/style>/g,"").replace(/<!--[\s\S]*?-->/g,"").replace(/<[^>]+>/g," ").replace(/\s+/g," "))' > "$TEMP/retrato/antes/$(echo "$p" | tr / _).txt"
done
```
Depois, parar o servidor da porta 3212 (`Get-NetTCPConnection -LocalPort 3212 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`).

- [ ] **Step 2: Home e lista de disciplinas**

`src/app/page.tsx`: acrescentar `import { conteudosVigentes } from "@/lib/calendario";`, trocar `export default function Home()` por `export default async function Home()` e
`const proximas = proximasAulas();` por `const proximas = proximasAulas(await conteudosVigentes());`.

`src/app/disciplinas/page.tsx`: acrescentar `import { conteudosVigentes } from "@/lib/calendario";`; tornar o componente da página `async`; antes do `return`, acrescentar

```tsx
  const vigentes = new Map((await conteudosVigentes()).map((c) => [c.disciplina.slug, c]));
```

e, dentro do `DISCIPLINAS.map`, trocar

```tsx
          const conteudo = conteudoDa(d.slug);
          const proximo = d.ativa ? proximoEncontroDe(d.slug) : null;
```

por

```tsx
          const conteudo = vigentes.get(d.slug) ?? conteudoDa(d.slug);
          const proximo = d.ativa ? proximoEncontroDe(vigentes.get(d.slug)) : null;
```

- [ ] **Step 3: Páginas da disciplina**

Em cada arquivo abaixo, acrescentar `import { conteudoVigente } from "@/lib/calendario";` e, **no corpo do componente da página** (não em `generateStaticParams` nem `generateMetadata`), trocar `const conteudo = conteudoDa(slug);` por `const conteudo = await conteudoVigente(slug);`. Remover `conteudoDa` do import de `@/content` se deixar de ser usado no arquivo.

- `src/app/[disciplina]/page.tsx`
- `src/app/[disciplina]/encontros/page.tsx`
- `src/app/[disciplina]/encontros/[numero]/page.tsx`
- `src/app/[disciplina]/cronograma/page.tsx`
- `src/app/[disciplina]/avaliacao/page.tsx`
- `src/app/[disciplina]/projeto/[etapa]/page.tsx`
- `src/app/[disciplina]/projeto/[etapa]/roteiro/page.tsx`

Nos que ainda não têm, acrescentar logo depois dos imports (reserva caso o banco esteja fora no deploy):

```ts
/** As datas vêm do calendário vigente: a página se renova sozinha a cada hora. */
export const revalidate = 3600;
```

(Já têm: `[disciplina]/page.tsx`, `encontros/page.tsx`, `cronograma/page.tsx`.)

`src/app/[disciplina]/encontros/[numero]/quiz/page.tsx`: acrescentar o mesmo `revalidate` e o import, e trocar a função `buscar` por

```ts
async function buscar(slug: string, numero: string) {
  const conteudo = await conteudoVigente(slug);
  const encontro = conteudo?.encontros.find((e) => String(e.numero) === numero);
  const quiz = encontro && quizDo(slug, encontro.numero);
  return conteudo && encontro && quiz ? { conteudo, encontro, quiz } : null;
}
```

e as duas chamadas `buscar(...)` por `await buscar(...)`.

- [ ] **Step 4: Texto do prazo especial na página de avaliação**

Um ajuste de quiz vira um prazo especial de um encontro só, e o texto "dos Encontros 7 a 7" fica errado. Em `src/app/[disciplina]/avaliacao/page.tsx`, trocar o bloco

```tsx
                {portfolio.prazosEspeciais.map((p) => (
                  <span key={p.prazo}>
                    {" "}
                    Excepcionalmente, os quizzes dos Encontros {p.encontros[0]} a{" "}
                    {p.encontros[p.encontros.length - 1]} ficam abertos até{" "}
                    {momentoCampus(p.prazo, true)}.
                  </span>
                ))}{" "}
```

por

```tsx
                {portfolio.prazosEspeciais.map((p) => (
                  <span key={`${p.encontros.join("-")}-${p.prazo}`}>
                    {" "}
                    {p.encontros.length === 1
                      ? `Excepcionalmente, o quiz do Encontro ${p.encontros[0]} fica aberto até `
                      : `Excepcionalmente, os quizzes dos Encontros ${p.encontros[0]} a ${p.encontros[p.encontros.length - 1]} ficam abertos até `}
                    {momentoCampus(p.prazo, true)}.
                  </span>
                ))}{" "}
```

- [ ] **Step 5: Painel**

Nos arquivos abaixo, acrescentar `import { conteudoVigente } from "@/lib/calendario";` e trocar a linha indicada:

- `src/app/professor/page.tsx`: `const conteudo = conteudoDa(slug)!;` → `const conteudo = (await conteudoVigente(slug))!;`
- `src/app/professor/portfolio/page.tsx`: idem.
- `src/app/professor/relatorios/page.tsx`: idem.
- `src/app/professor/exportar/route.ts`: `const conteudo = conteudoDa(disciplina);` → `const conteudo = await conteudoVigente(disciplina);`
- `src/app/professor/roteiros/page.tsx`: `const conteudo = conteudoDa(slugsPublicados()[0])!;` → `const conteudo = (await conteudoVigente(slugsPublicados()[0]))!;`

- [ ] **Step 6: Server Actions**

`src/lib/acoes-quiz.ts`: acrescentar `import { conteudoVigente } from "./calendario";` e trocar
`const conteudo = conteudoDa(envio.disciplina)!;` por `const conteudo = (await conteudoVigente(envio.disciplina))!;`
(manter `conteudoDa`/`quizDo` no import se ainda usados).

`src/lib/acoes-entrega.ts`: acrescentar `import { conteudoVigente } from "./calendario";`, trocar a função `entregaConfigurada` por

```ts
async function entregaConfigurada(dados: z.output<typeof Equipe>) {
  return (await conteudoVigente(dados.disciplina))?.regrasNota.entregas.find(
    (e) => e.etapa === dados.etapa && e.fase === dados.fase,
  );
}
```

e as duas chamadas `entregaConfigurada(lido.equipe)` por `await entregaConfigurada(lido.equipe)`. Remover `conteudoDa` do import se deixar de ser usado.

- [ ] **Step 7: Verificações**

Run: `npm run typecheck && npm run lint && npm test`
Expected: sem erros; todos os testes passam.

- [ ] **Step 8: Retrato depois — tem de ser idêntico**

Repetir o Step 1 gravando em `"$TEMP/retrato/depois"` e comparar:

```bash
diff -r "$TEMP/retrato/antes" "$TEMP/retrato/depois" && echo IDENTICO
```
Expected: `IDENTICO`. Qualquer diferença é regressão: a tabela está vazia, então nada pode mudar.

- [ ] **Step 9: Banco indisponível no build**

O Next sempre lê o `.env.local`, então ele sai do caminho durante o build:

Run: `mv .env.local .env.local.bak && npm run build; mv .env.local.bak .env.local`
Expected: build conclui (sem banco, `ajustesDa` devolve `[]`); as páginas saem com as datas planejadas. Confirmar que o `.env.local` voltou: `ls .env.local`.

- [ ] **Step 10: Commit**

```bash
git add src/app src/lib/acoes-quiz.ts src/lib/acoes-entrega.ts
git commit -m "Paginas e acoes passam a ler o calendario vigente

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Aba Calendário no painel

**Files:**
- Create: `src/app/professor/calendario/acoes.ts`
- Create: `src/app/professor/calendario/form-ajuste.tsx`
- Create: `src/app/professor/calendario/page.tsx`
- Modify: `src/app/professor/moldura.tsx` (lista `ABAS`)

**Interfaces:**
- Consumes: `validarAjuste`, `TIPOS_AJUSTE`, `TipoAjuste`, `aplicarAjustes`, `ajustesOrfaos`, `camposDoPrazo`, `chaveDaEntrega` (Tasks 1–2); `lerAjustesDireto`, `ETIQUETA_CALENDARIO` (Task 3); `prazoDoQuiz` (`@/lib/portfolio`); `dataCurta`, `momentoCampus` (`@/lib/datas`); `Moldura`, `exigirProfessor`.
- Produces: rota `/professor/calendario`; `salvarAjuste` e `removerAjuste` com assinatura `(estado: EstadoAjuste, form: FormData) => Promise<EstadoAjuste>`.

- [ ] **Step 1: Server Actions**

`src/app/professor/calendario/acoes.ts`:

```ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { conteudoDa, slugsPublicados } from "@/content";
import { TIPOS_AJUSTE, validarAjuste, type TipoAjuste } from "@/lib/ajustes-calendario";
import { ETIQUETA_CALENDARIO } from "@/lib/calendario";
import { clienteAdmin, professorLogado } from "@/lib/supabase/servidor";

/**
 * Gravação dos ajustes da aba Calendário. São Server Actions — POSTs públicos —,
 * então a sessão do professor é conferida aqui dentro. Depois de gravar, o
 * calendário em cache é descartado e todas as páginas se regeneram.
 */

export type EstadoAjuste = { erro: string } | { ok: true } | null;

function republicar() {
  revalidateTag(ETIQUETA_CALENDARIO);
  revalidatePath("/", "layout");
}

export async function salvarAjuste(_estado: EstadoAjuste, form: FormData): Promise<EstadoAjuste> {
  if (!(await professorLogado())) return { erro: "Sessão expirada. Entre de novo." };
  const disciplina = String(form.get("disciplina") ?? "");
  if (!slugsPublicados().includes(disciplina)) return { erro: "Disciplina desconhecida." };

  const lido = validarAjuste(conteudoDa(disciplina)!, {
    tipo: String(form.get("tipo") ?? ""),
    chave: String(form.get("chave") ?? ""),
    data: String(form.get("data") ?? ""),
    hora: String(form.get("hora") ?? ""),
    motivo: String(form.get("motivo") ?? ""),
    ocultar: form.get("ocultar") === "1",
  });
  if (!lido.ok) return { erro: lido.erro };

  const { error } = await clienteAdmin()!
    .from("calendario_ajustes")
    .upsert(
      { disciplina, ...lido.ajuste, atualizado_em: new Date().toISOString() },
      { onConflict: "disciplina,tipo,chave" },
    );
  if (error) return { erro: `Não foi possível gravar: ${error.message}` };

  republicar();
  return { ok: true };
}

/** "Voltar ao planejado": apaga o ajuste. */
export async function removerAjuste(_estado: EstadoAjuste, form: FormData): Promise<EstadoAjuste> {
  if (!(await professorLogado())) return { erro: "Sessão expirada. Entre de novo." };
  const disciplina = String(form.get("disciplina") ?? "");
  const tipo = String(form.get("tipo") ?? "") as TipoAjuste;
  const chave = String(form.get("chave") ?? "");
  if (!slugsPublicados().includes(disciplina) || !TIPOS_AJUSTE.includes(tipo) || !chave || chave.length > 20) {
    return { erro: "Ajuste desconhecido." };
  }

  const { error } = await clienteAdmin()!
    .from("calendario_ajustes")
    .delete()
    .eq("disciplina", disciplina)
    .eq("tipo", tipo)
    .eq("chave", chave);
  if (error) return { erro: `Não foi possível apagar: ${error.message}` };

  republicar();
  return { ok: true };
}
```

- [ ] **Step 2: Formulário de uma linha**

`src/app/professor/calendario/form-ajuste.tsx`:

```tsx
"use client";

import { useActionState, type ReactNode } from "react";
import type { EstadoAjuste } from "./acoes";

/**
 * Um ajuste = um formulário. Mostra o erro da linha e trava os campos enquanto
 * grava. Depois de gravar, a página volta do servidor com os valores novos.
 */
export function FormAjuste({
  acao,
  children,
  className,
}: {
  acao: (estado: EstadoAjuste, form: FormData) => Promise<EstadoAjuste>;
  children: ReactNode;
  className?: string;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  return (
    <form action={enviar} className={className ?? "flex flex-wrap items-center gap-2"}>
      <fieldset disabled={pendente} className="contents">
        {children}
      </fieldset>
      {estado && "erro" in estado && (
        <p role="alert" className="w-full text-xs text-alert">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 3: Página**

`src/app/professor/calendario/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Selo, cx } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import {
  ajustesOrfaos,
  aplicarAjustes,
  camposDoPrazo,
  chaveDaEntrega,
  type TipoAjuste,
} from "@/lib/ajustes-calendario";
import { lerAjustesDireto } from "@/lib/calendario";
import { dataCurta, momentoCampus } from "@/lib/datas";
import { prazoDoQuiz } from "@/lib/portfolio";
import { Moldura, exigirProfessor } from "../moldura";
import { removerAjuste, salvarAjuste } from "./acoes";
import { FormAjuste } from "./form-ajuste";

export const metadata: Metadata = {
  title: "Calendário · Área do professor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ disciplina?: string }> };

const campo = "rounded-lg border border-line bg-card px-2 py-1 font-mono text-xs text-ink";
const botao =
  "rounded-md border border-line px-2.5 py-1 text-xs text-ink-dim hover:border-primary-dim hover:text-primary";

/**
 * Datas do semestre: o planejamento vem do código, e o que se muda aqui vira um
 * ajuste em `calendario_ajustes` (ver `lib/ajustes-calendario.ts`). O site
 * inteiro passa a mostrar a data nova em instantes, sem deploy.
 */
export default async function PaginaCalendario({ searchParams }: Props) {
  const acesso = await exigirProfessor();
  if ("bloqueio" in acesso) return acesso.bloqueio;

  const slugs = slugsPublicados();
  const params = await searchParams;
  const slug = slugs.includes(params.disciplina ?? "") ? params.disciplina! : slugs[0];
  const planejado = conteudoDa(slug)!;
  const ajustes = await lerAjustesDireto(slug);
  const vigente = aplicarAjustes(planejado, ajustes);
  const orfaos = ajustesOrfaos(planejado, ajustes);
  const ajustado = (tipo: TipoAjuste, chave: string) =>
    ajustes.some((a) => a.tipo === tipo && a.chave === chave && !orfaos.includes(a));
  const ocultos = new Set(ajustes.filter((a) => a.tipo === "sem-aula" && a.valor === null).map((a) => a.chave));
  const acrescentados = vigente.semAula.filter((d) => !planejado.semAula.some((p) => p.data === d.data));

  return (
    <Moldura aba="calendario" email={acesso.email}>
      {slugs.length > 1 && (
        <nav aria-label="Disciplinas" className="mb-8 flex flex-wrap gap-1.5">
          {slugs.map((s) => (
            <Link
              key={s}
              href={`/professor/calendario?disciplina=${s}`}
              aria-current={s === slug ? "page" : undefined}
              className={cx(
                "rounded-lg border px-3 py-1.5 font-mono text-xs",
                s === slug ? "border-primary bg-primary text-white" : "border-line bg-card text-ink-dim",
              )}
            >
              {conteudoDa(s)!.disciplina.codigo}
            </Link>
          ))}
        </nav>
      )}

      <p className="mb-10 max-w-3xl rounded-xl border border-alert/30 bg-alert-soft p-4 text-sm text-ink">
        Cada alteração vale para o site inteiro em instantes, sem publicar nada. Estender um prazo
        recalcula quem está atrasado: quem enviou entre o prazo antigo e o novo deixa de aparecer
        como atrasado.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl">Encontros e quizzes</h2>
        <p className="mt-1 text-sm text-ink-dim">
          Adiar uma aula move o prazo do quiz dela para a nova quinta-feira, a menos que o prazo do
          quiz tenha sido fixado aqui.
        </p>
        <ul className="mt-5 space-y-3">
          {vigente.encontros.map((e, i) => {
            const chave = String(e.numero);
            const anterior = vigente.encontros[i - 1];
            const seguinte = vigente.encontros[i + 1];
            const foraDeOrdem =
              (anterior && e.data <= anterior.data) || (seguinte && e.data >= seguinte.data);
            const temQuiz = vigente.quizzes.some((q) => q.encontro === e.numero);
            const origem = ajustado("prazo-quiz", chave)
              ? "ajustado"
              : planejado.regrasNota.portfolio.prazosEspeciais.some((p) => p.encontros.includes(e.numero))
                ? "prazo especial"
                : "regra: quinta seguinte";

            return (
              <li key={e.numero} className="rounded-xl border border-line bg-card p-4">
                <p className="font-medium text-ink">
                  {e.numero === 0 ? "Semana 0" : `Encontro ${e.numero}`} · {e.titulo}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="w-28 text-ink-dim">Aula</span>
                  <FormAjuste acao={salvarAjuste}>
                    <Chave disciplina={slug} tipo="encontro" chave={chave} />
                    <input type="date" name="data" defaultValue={e.data} required className={campo} />
                    <button type="submit" className={botao}>
                      Salvar
                    </button>
                  </FormAjuste>
                  {ajustado("encontro", chave) && (
                    <>
                      <Selo tom="primary">ajustado</Selo>
                      <span className="text-xs text-ink-faint">
                        planejado: {dataCurta(planejado.encontros[i].data)}
                      </span>
                      <VoltarAoPlanejado disciplina={slug} tipo="encontro" chave={chave} />
                    </>
                  )}
                  {foraDeOrdem && (
                    <span className="text-xs text-alert">fora de ordem em relação aos vizinhos</span>
                  )}
                </div>
                {temQuiz && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="w-28 text-ink-dim">Prazo do quiz</span>
                    <FormAjuste acao={salvarAjuste}>
                      <Chave disciplina={slug} tipo="prazo-quiz" chave={chave} />
                      <CamposPrazo prazo={prazoDoQuiz(vigente, e.numero)} />
                      <button type="submit" className={botao}>
                        Salvar
                      </button>
                    </FormAjuste>
                    <span className="text-xs text-ink-faint">{origem}</span>
                    {ajustado("prazo-quiz", chave) && (
                      <VoltarAoPlanejado disciplina={slug} tipo="prazo-quiz" chave={chave} />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl">Prazos de entrega</h2>
        <ul className="mt-5 space-y-3">
          {vigente.regrasNota.entregas.map((en, i) => {
            const chave = chaveDaEntrega(en);
            return (
              <li key={chave} className="rounded-xl border border-line bg-card p-4">
                <p className="font-medium text-ink">
                  {en.nome} · {en.etapa}ª etapa
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <FormAjuste acao={salvarAjuste}>
                    <Chave disciplina={slug} tipo="prazo-entrega" chave={chave} />
                    <CamposPrazo prazo={en.prazo} />
                    <button type="submit" className={botao}>
                      Salvar
                    </button>
                  </FormAjuste>
                  {ajustado("prazo-entrega", chave) && (
                    <>
                      <Selo tom="primary">ajustado</Selo>
                      <span className="text-xs text-ink-faint">
                        planejado: {momentoCampus(planejado.regrasNota.entregas[i].prazo)}
                      </span>
                      <VoltarAoPlanejado disciplina={slug} tipo="prazo-entrega" chave={chave} />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl">Dias sem aula</h2>
        <ul className="mt-5 space-y-2">
          {planejado.semAula.map((d) => (
            <li key={d.data} className="flex flex-wrap items-center gap-2 text-sm">
              <span className={cx("font-mono", ocultos.has(d.data) ? "text-ink-faint line-through" : "text-ink")}>
                {dataCurta(d.data)}
              </span>
              <span className={ocultos.has(d.data) ? "text-ink-faint" : "text-ink"}>{d.motivo}</span>
              {ocultos.has(d.data) ? (
                <>
                  <Selo>oculto</Selo>
                  <VoltarAoPlanejado disciplina={slug} tipo="sem-aula" chave={d.data} rotulo="Mostrar de novo" />
                </>
              ) : (
                <FormAjuste acao={salvarAjuste}>
                  <Chave disciplina={slug} tipo="sem-aula" chave={d.data} />
                  <input type="hidden" name="ocultar" value="1" />
                  <button type="submit" className={botao}>
                    Ocultar
                  </button>
                </FormAjuste>
              )}
            </li>
          ))}
          {acrescentados.map((d) => (
            <li key={d.data} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono text-ink">{dataCurta(d.data)}</span>
              <span className="text-ink">{d.motivo}</span>
              <Selo tom="primary">acrescentado</Selo>
              <VoltarAoPlanejado disciplina={slug} tipo="sem-aula" chave={d.data} rotulo="Apagar" />
            </li>
          ))}
        </ul>
        <FormAjuste acao={salvarAjuste} className="mt-5 flex flex-wrap items-center gap-2">
          <input type="hidden" name="disciplina" value={slug} />
          <input type="hidden" name="tipo" value="sem-aula" />
          <input type="date" name="chave" required className={campo} />
          <input
            name="motivo"
            required
            maxLength={120}
            placeholder="Motivo (ex.: recesso)"
            className={cx(campo, "w-64 font-sans")}
          />
          <button type="submit" className={botao}>
            Acrescentar dia
          </button>
        </FormAjuste>
      </section>

      {orfaos.length > 0 && (
        <section>
          <h2 className="text-2xl">Ajustes que não valem</h2>
          <p className="mt-1 text-sm text-ink-dim">
            Apontam para algo que não existe mais no planejamento, ou têm valor inválido. O site os
            ignora.
          </p>
          <ul className="mt-4 space-y-2">
            {orfaos.map((a) => (
              <li key={`${a.tipo}-${a.chave}`} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-ink-dim">
                  {a.tipo} · {a.chave} · {a.valor ?? "—"}
                </span>
                <VoltarAoPlanejado disciplina={slug} tipo={a.tipo} chave={a.chave} rotulo="Apagar" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Moldura>
  );
}

function Chave({ disciplina, tipo, chave }: { disciplina: string; tipo: TipoAjuste; chave: string }) {
  return (
    <>
      <input type="hidden" name="disciplina" value={disciplina} />
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="chave" value={chave} />
    </>
  );
}

function CamposPrazo({ prazo }: { prazo: string }) {
  const { data, hora } = camposDoPrazo(prazo);
  return (
    <>
      <input type="date" name="data" defaultValue={data} required className={campo} />
      <input type="time" name="hora" defaultValue={hora} required className={campo} />
    </>
  );
}

function VoltarAoPlanejado({
  disciplina,
  tipo,
  chave,
  rotulo = "Voltar ao planejado",
}: {
  disciplina: string;
  tipo: TipoAjuste;
  chave: string;
  rotulo?: string;
}) {
  return (
    <FormAjuste acao={removerAjuste}>
      <Chave disciplina={disciplina} tipo={tipo} chave={chave} />
      <button type="submit" className={botao}>
        {rotulo}
      </button>
    </FormAjuste>
  );
}
```

- [ ] **Step 4: Aba no menu**

Em `src/app/professor/moldura.tsx`, na lista `ABAS`, depois da linha da Turma, acrescentar:

```ts
  { href: "/professor/calendario", id: "calendario", rotulo: "Calendário" },
```

- [ ] **Step 5: Verificações**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: tudo limpo; o build lista `ƒ /professor/calendario`.

- [ ] **Step 6: Teste ponta a ponta com um ajuste real (e desfeito)**

A tela exige o login do professor, então o ajuste é gravado pelo MCP do Supabase (é um INSERT/UPSERT, não um DELETE):

```sql
insert into public.calendario_ajustes (disciplina, tipo, chave, valor)
values ('so', 'sem-aula', '2099-01-01', 'Teste do calendário');
```

O cache do calendário fica gravado em `.next/cache` e sobrevive a reinícios do servidor, então a ordem importa: **primeiro** o insert, **depois** `npm run build` e `npx next start -p 3213`. Conferir que `/so/cronograma` mostra "Teste do calendário" (`curl -s http://localhost:3213/so/cronograma | grep -c "Teste do calendário"` → `1`), e parar o servidor. Depois, como DELETE pelo MCP é recusado, entregar ao professor o SQL para apagar no SQL Editor:

```sql
delete from public.calendario_ajustes where disciplina = 'so' and tipo = 'sem-aula' and chave = '2099-01-01';
```

ou apagar pelo próprio botão "Apagar" da aba Calendário, já com o deploy feito.

- [ ] **Step 7: Commit**

```bash
git add src/app/professor/calendario src/app/professor/moldura.tsx
git commit -m "Aba Calendario no painel: datas, prazos e dias sem aula

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Documentação e publicação

**Files:**
- Modify: `README.md` (seção "Portfólio, prazos e relatório" e a lista de abas do painel)
- Modify: `CLAUDE.md` (fora do git: registro da sessão)
- Modify: `docs/superpowers/specs/2026-10-06-calendario-editavel-design.md` (status)

- [ ] **Step 1: README** — na seção "Portfólio, prazos e relatório", depois do primeiro parágrafo, acrescentar:

```markdown
**As datas são editáveis pelo painel.** O planejamento do semestre continua no código
(`encontros.ts`, `avaliacao.ts`, `curso.ts`); a aba **Calendário** de `/professor` grava só os
ajustes, na tabela `calendario_ajustes`: data de encontro, prazo de quiz, prazo de entrega e dias
sem aula. `src/lib/ajustes-calendario.ts` aplica a precedência (função pura, com testes) e
`conteudoVigente(slug)`, em `src/lib/calendario.ts`, é a porta de entrada de toda página e ação
que lida com data. Salvar regenera o site em instantes, sem deploy; com o banco fora do ar, vale o
planejamento. Desenho completo em `docs/superpowers/specs/2026-10-06-calendario-editavel-design.md`.
```

e, na seção "A lista da turma", trocar

```markdown
  Tem cinco abas: envios por quiz (com as marcas do professor e o botão de desconsiderar um
  envio), portfólio consolidado por etapa, relatórios entregues, roteiros do professor e a lista
  da turma, com exportação `.csv` onde faz sentido.
```

por

```markdown
  Tem seis abas: envios por quiz (com as marcas do professor e o botão de desconsiderar um
  envio), portfólio consolidado por etapa, entregas (PDF e .zip), roteiros do professor, a lista
  da turma e o calendário do semestre, com exportação `.csv` onde faz sentido.
```

- [ ] **Step 2: Spec** — trocar a linha de status por `**Status:** implementado em 06/10/2026`.

- [ ] **Step 3: Verificação final**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: tudo limpo.

- [ ] **Step 4: Commit e push** (push só com autorização do professor)

```bash
git add README.md docs/superpowers/specs/2026-10-06-calendario-editavel-design.md docs/superpowers/plans/2026-10-06-calendario-editavel.md
git commit -m "Documenta o calendario editavel

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push origin main
```

Depois do push: conferir a verificação do GitHub Actions e, em produção, que `/professor/calendario` responde e `/so/cronograma` mostra as datas planejadas.
