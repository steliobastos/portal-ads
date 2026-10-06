# Calendário editável pelo painel — desenho

**Data:** 06/10/2026 · **Status:** implementado em 06/10/2026

## Problema

As datas do semestre vivem no código: a data de cada encontro (`src/content/so/encontros.ts`), os
prazos especiais de quiz e os prazos de entrega (`src/content/so/avaliacao.ts`), os dias sem aula e
as datas dos marcos de avaliação (`src/content/so/curso.ts`). Delas saem o "próximo encontro", o
cronograma, o prazo de cada quiz (quinta-feira seguinte ao encontro, 23:59), a marca de atraso e o
portfólio.

Quando o cronograma muda — aula adiada, prazo estendido, paralisação — cada ajuste exige editar o
código e publicar o site. O professor quer fazer esses ajustes **sozinho, pelo painel**, e ver o site
atualizado em instantes, sem deploy.

## Decisões

- **Quem edita:** o professor, numa aba do painel `/professor`.
- **O que edita:** data de cada encontro, prazo de cada quiz, prazo de cada entrega e dias sem aula.
- **Abordagem (A):** o código continua guardando o **planejamento**; o banco guarda só os
  **ajustes**. O site junta os dois. Rejeitada a alternativa (B), mover todas as datas para o banco:
  o cronograma passaria a depender do banco (que já pausou uma vez no semestre) e o build também.
- **Atraso recalculado:** a marca de atraso é sempre calculada a partir do prazo vigente. Estender um
  prazo tira a marca de quem enviou entre o prazo antigo e o novo. É o comportamento desejado.

## 1. Dados e regra de precedência

### Tabela `calendario_ajustes`

| coluna | tipo | |
|---|---|---|
| `disciplina` | `text` | slug, ex.: `so` |
| `tipo` | `text` | `encontro` · `prazo-quiz` · `prazo-entrega` · `sem-aula` |
| `chave` | `text` | ver abaixo |
| `valor` | `text` | ver abaixo; `null` só em `sem-aula` (dia do código oculto) |
| `atualizado_em` | `timestamptz` | `default now()` |

Chave primária `(disciplina, tipo, chave)`: ajustar de novo a mesma coisa substitui o ajuste.
"Voltar ao planejado" apaga a linha. RLS ligada e sem políticas, como as demais tabelas: só o
servidor, com a chave secreta, lê e grava.

| tipo | chave | valor |
|---|---|---|
| `encontro` | número do encontro (`"9"`) | data `AAAA-MM-DD` |
| `prazo-quiz` | número do encontro do quiz (`"7"`) | instante ISO com fuso (`2026-10-15T23:59:59-03:00`) |
| `prazo-entrega` | `"<etapa>-<fase>"` (`"1-final"`) | instante ISO com fuso |
| `sem-aula` | data `AAAA-MM-DD` | motivo; `null` = ocultar um dia que está no código |

### Regra de precedência (função pura `aplicarAjustes`)

Recebe o conteúdo do código e a lista de ajustes; devolve um `ConteudoDisciplina` no **mesmo
formato**, com as datas vigentes.

- **Data do encontro:** ajuste, se houver; senão, a do código.
- **Data do marco de avaliação** (`avaliacoes[].data`): passa a ser **derivada** da data vigente do
  encontro em que cai (`avaliacoes[].encontro`), em vez de duplicada.
- **Prazo do quiz:** ajuste do quiz › prazo especial do código (`prazosEspeciais`) › regra
  "quinta-feira seguinte à data **vigente** do encontro, 23:59". Adiar a aula move o prazo do quiz
  junto, a menos que o prazo do quiz tenha sido fixado.
  Implementação: o ajuste de quiz entra em `regrasNota.portfolio.prazosEspeciais` à frente dos do
  código, de modo que `prazoDoQuiz` continua igual.
- **Prazo de entrega:** ajuste › `regrasNota.entregas[].prazo`.
- **Dias sem aula:** os do código, menos os ocultados, mais os acrescentados, em ordem de data.
- **Ajuste órfão** (encontro, quiz ou entrega que não existe no código): ignorado na leitura.

Sem nenhum ajuste, o resultado é idêntico ao conteúdo do código.

## 2. Fluxo de leitura

- **Porta de entrada única:** `conteudoVigente(slug): Promise<ConteudoDisciplina>`, só no servidor.
  Lê os ajustes da disciplina e aplica `aplicarAjustes`. `conteudoDa(slug)` continua existindo para o
  que não envolve data.
- **Quem passa a usar `conteudoVigente`:**
  - páginas: início, `/disciplinas`, visão geral da disciplina, lista de encontros, página do
    encontro, quiz, cronograma, avaliação, enunciado do projeto, roteiro do projeto;
  - Server Actions que calculam atraso: envio de quiz, preparo e confirmação de entrega;
  - painel: quizzes, portfólio, relatórios, exportação `.csv`.
  - `lib/agenda.ts` (próximo encontro) passa a receber o conteúdo vigente em vez de buscá-lo sozinho.
- **Cache:** a leitura dos ajustes fica em `unstable_cache` com a etiqueta `calendario`, para que um
  build de ~70 páginas faça uma consulta, não setenta.
- **Atualização sem deploy:** ao salvar no painel, `revalidateTag("calendario")` e
  `revalidatePath("/", "layout")`. A próxima visita a qualquer página já vê a data nova.
- **Reserva:** as páginas que mostram data ganham `revalidate = 3600`. Se o banco estiver fora no
  deploy, o site sai com o planejamento e se corrige sozinho quando o banco voltar.
- **Falha na leitura:** vale o planejamento do código; o erro vai para o log. O site nunca fica sem
  cronograma.

## 3. Tela: aba Calendário

Rota `/professor/calendario`, nova aba depois de "Turma". Página dinâmica, protegida por
`exigirProfessor()`. Lembrete fixo no topo: estender um prazo recalcula quem está atrasado.

1. **Encontros e quizzes** — uma linha por encontro:
   - número e título;
   - data da aula (campo de data com a vigente; a planejada aparece ao lado quando difere);
   - prazo do quiz, quando há quiz: data e hora, com a origem ("regra: quinta seguinte",
     "prazo especial", "ajustado");
   - selo "ajustado" e botão "Voltar ao planejado" onde houver ajuste;
   - aviso (não bloqueio) se a data deixar os encontros fora de ordem.
2. **Prazos de entrega** — uma linha por entrega de `avaliacao.ts`: data e hora, selo e "voltar ao
   planejado".
3. **Dias sem aula** — lista (código + acrescentados); formulário para acrescentar (data + motivo);
   ocultar/mostrar dia do código; apagar dia acrescentado.
4. **Ajustes órfãos**, se houver — listados com botão para apagar.

Cada linha é um formulário próprio com "Salvar": mudar uma coisa não arrisca as outras. Horários
sempre de Horizonte (`-03:00`, sem horário de verão); prazo vem com 23:59 preenchido. Cada Server
Action confere `professorLogado()`.

## 4. Erros e testes

**Erros**

- Data ou hora inválida, ou campo vazio: o servidor recusa (Zod), a linha mostra o motivo, nada é
  gravado.
- Banco fora ao salvar: mensagem de erro; a data anterior continua valendo.
- Banco fora ao ler: planejamento do código + log.
- Ajuste órfão: ignorado na leitura, listado no painel para apagar.

**Testes** (Vitest, na função pura `aplicarAjustes`):

- sem ajustes, o resultado é idêntico ao conteúdo do código;
- ajuste de encontro muda a data da aula e a do marco de avaliação daquele encontro;
- adiar a aula move o prazo do quiz para a nova quinta-feira;
- prazo de quiz ajustado vence o prazo especial, que vence a regra da quinta;
- ajuste de entrega substitui o prazo de `avaliacao.ts`;
- dias sem aula: acrescentar, ocultar um do código e voltar ao planejado;
- ajuste órfão é ignorado.

Antes do commit: `typecheck`, `lint`, `test`, `build` e conferência no navegador local de que as
páginas públicas mostram as datas planejadas quando não há ajuste.

## Fora do escopo

- Mudar título, conteúdo ou ordem dos encontros pelo painel (continua no código).
- Histórico de alterações do calendário (a tabela guarda só o ajuste vigente).
- Avisar os alunos automaticamente quando uma data muda (o professor usa os avisos do portal).
