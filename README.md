# Portal de Disciplinas — IFCE Campus Horizonte

Guia do aluno das disciplinas do curso de Tecnologia em Análise e Desenvolvimento de Sistemas.
Começa servindo **Sistemas Operacionais (ADS23)**; a arquitetura é multi-disciplina desde o
primeiro commit.

O projeto tem dupla função: é o portal que os alunos usam **e** um exemplo real de programação
web moderna — o código é público de propósito, para ser lido em Programação Web I/II.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) · React 19 · TypeScript |
| Estilo | Tailwind CSS v4, com a paleta institucional em `src/app/globals.css` |
| Conteúdo | Módulos TypeScript tipados em `src/content/` |
| Deploy | Vercel (plano Hobby) |
| Banco (fase 3) | Supabase — PostgreSQL + Auth |

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros comandos:

```bash
npm run build             # build de produção
npm run typecheck         # tsc --noEmit
npm run lint              # ESLint
npm run material:indexar  # regenera o índice dos arquivos de material
```

## Estrutura

```
src/
  app/
    page.tsx                        capa do portal (lista de disciplinas)
    [disciplina]/
      layout.tsx                    cabeçalho, navegação e rodapé da disciplina
      page.tsx                      visão geral: próximo encontro, ementa, avaliação
      encontros/page.tsx            índice dos encontros por etapa
      encontros/[numero]/page.tsx   página de um encontro: material, Docker, leituras
      cronograma/page.tsx           tabela de datas e marcos
      leituras/page.tsx             mapa de leituras completo
      avaliacao/page.tsx            projeto integrador, marcos e rubricas
  components/                       UI compartilhada (selos, cartões, listas)
  content/
    tipos.ts                        os tipos de todo o conteúdo
    disciplinas.ts                  registro multi-disciplina
    index.ts                        slug → conteúdo (único ponto que conhece as disciplinas)
    materiais.gerado.ts             ARQUIVO GERADO — índice dos HTMLs em public/
    so/                             conteúdo de Sistemas Operacionais
public/material/<disciplina>/<pasta>/   slides, roteiros e quizzes em HTML
```

### Por que o índice de material é gerado

Os nomes dos arquivos de material são longos e escritos à mão
(`Encontro-07_Concorrencia-Condicao-de-Corrida.html`). Em vez de repetir esses nomes no código —
onde um erro de digitação vira link quebrado em produção —, o script `scripts/indexar-materiais.mjs`
lê o que existe em `public/material/` e gera `src/content/materiais.gerado.ts`.

Publicar material novo:

```bash
# 1. copie os HTMLs para public/material/so/aulaN/
npm run material:indexar
git add -A && git commit -m "Publica material do Encontro N"
```

Se o arquivo não existe em disco, ele simplesmente não aparece no site.

## Identidade visual

A paleta é a mesma dos materiais dos encontros, derivada das cores oficiais do Manual de Aplicação
da Marca IF: teal `#1b878f` como primária, verde IF `#399b3f` como secundária, vermelho IF
`#cd191e` reservado para alerta, sobre fundo creme `#fbfaf5`. Blocos de terminal permanecem
escuros (`#10161f`) por contraste técnico. Tipografia: Space Grotesk (títulos), IBM Plex Sans
(texto) e IBM Plex Mono (código).

Os tokens ficam em `@theme`, no `globals.css` — trocar a paleta de uma disciplina futura é mexer
num arquivo só.

## Roadmap

- [x] **Fase 1** — esqueleto, identidade visual, conteúdo dos 17 encontros e material servido
- [ ] **Fase 2** — migrar os HTMLs para MDX, com componentes React reaproveitáveis
      (`<Terminal>`, `<Leitura>`, `<Checklist>`, `<DicaColapsavel>`)
- [ ] **Fase 3** — quiz nativo com Supabase: aluno envia por rota server-side, vê só o próprio
      resultado; painel do professor autenticado, com exportação para planilha
- [ ] **Fase 4** — testes (Vitest + Playwright) e CI no GitHub Actions

## Material do professor

Roteiros de condução, checklists e rubricas de correção **não** são publicados aqui: ficam na
pasta de trabalho da disciplina. Quando a autenticação existir (fase 3), passam a viver numa área
restrita.
