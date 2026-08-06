# Portal de Disciplinas — IFCE Campus Horizonte

**No ar:** <https://portal-ads-henna.vercel.app>

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
npm run material:preparar # prepara o material publicado (as duas tarefas abaixo)
npm run material:voltar   # injeta o botão "voltar ao portal" nos HTMLs de material
npm run material:indexar  # regenera o índice dos arquivos de material
```

> **Não rode `npm run build` com o `npm run dev` aberto.** Os dois escrevem no mesmo
> diretório `.next`, e o build sobrescreve os chunks que o servidor de desenvolvimento já
> tinha carregado. O sintoma é um erro do tipo `Cannot find module './331.js'` vindo do
> `webpack-runtime`. A correção é parar o servidor, apagar `.next` e subir de novo:
>
> ```bash
> rm -rf .next    # PowerShell: Remove-Item .next -Recurse -Force
> npm run dev
> ```

## Estrutura

```
src/
  app/
    layout.tsx                      fontes, paleta e metadados de compartilhamento
    page.tsx                        capa do portal (lista de disciplinas)
    icon.svg                        favicon do portal
    opengraph-image.tsx             prévia do link (gerada no build, 1200×630)
    robots.ts · sitemap.ts          derivados da camada de conteúdo
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
  lib/
    datas.ts                        formatação de datas em pt-BR
    site.ts                         endereço público do site (metadata, sitemap)
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
npm run material:preparar
git add -A && git commit -m "Publica material do Encontro N"
```

Se o arquivo não existe em disco, ele simplesmente não aparece no site.

### Roteiros em MDX

Os roteiros migrados vivem em `src/content/so/roteiros/<numero>.mdx` e usam os componentes de
`src/components/aula.tsx` (`<Passo>`, `<Comando>`, `<Terminal>`, `<Dica>`, `<Checklist>`…). A rota
`/so/encontros/<n>/roteiro` só existe se o `.mdx` existir; enquanto não existir, a página do
encontro continua oferecendo o HTML avulso. Os dois nunca aparecem juntos.

`scripts/converter-roteiro.mjs` fez a conversão inicial a partir do HTML. Ele **relata** todo bloco
que não reconhece em vez de descartá-lo em silêncio — omissão em material didático é pior que erro
visível, porque ninguém nota que um passo sumiu.

### Por que o material recebe um botão injetado

Os HTMLs de material foram escritos antes do portal: são documentos avulsos, com CSS próprio e
nenhuma navegação. Aberto a partir de um encontro, o aluno entrava no material e ficava sem
caminho de volta. `scripts/injetar-volta-ao-portal.mjs` insere em cada um deles um botão fixo
"← Voltar ao Encontro N", entre marcadores `<!-- portal:voltar:… -->` — rodar de novo substitui o
bloco em vez de duplicar. É uma medida de transição: na fase 2 o material passa a ser MDX
renderizado dentro do portal, e o botão deixa de ser necessário.

## Identidade visual

A paleta é a mesma dos materiais dos encontros, derivada das cores oficiais do Manual de Aplicação
da Marca IF: teal `#1b878f` como primária, verde IF `#399b3f` como secundária, vermelho IF
`#cd191e` reservado para alerta, sobre fundo creme `#fbfaf5`. Blocos de terminal permanecem
escuros (`#10161f`) por contraste técnico. Tipografia: Space Grotesk (títulos), IBM Plex Sans
(texto) e IBM Plex Mono (código).

Os tokens ficam em `@theme`, no `globals.css` — trocar a paleta de uma disciplina futura é mexer
num arquivo só.

## Publicação

O site é estático (SSG, com revalidação de 1 h nas páginas que destacam o próximo encontro) e vai
ao ar pela Vercel: cada `git push` na `main` publica em produção; cada branch ganha uma URL de
preview.

Publicado em 06/08/2026. Repositório: <https://github.com/steliobastos/portal-ads> ·
produção: <https://portal-ads-henna.vercel.app>.

Publicar uma mudança é dar `git push` na `main` — a Vercel constrói e coloca no ar em cerca de um
minuto. Branches ganham URL de preview automaticamente.

### Variáveis de ambiente

| Variável | Onde | Para quê |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | opcional | Endereço absoluto do site. Só é necessária quando houver **domínio próprio** — na Vercel, `src/lib/site.ts` já usa `VERCEL_PROJECT_PRODUCTION_URL` automaticamente. Em desenvolvimento, o padrão é `http://localhost:3000`. |

O endereço absoluto alimenta o `metadataBase` (prévia do link em WhatsApp e Classroom), o
`sitemap.xml` e o `robots.txt`.

## Roadmap

- [x] **Fase 1** — esqueleto, identidade visual, conteúdo dos 17 encontros, material servido,
      favicon, prévia de compartilhamento, `sitemap.xml`/`robots.txt` e deploy na Vercel
- [ ] **Fase 2** — migrar os HTMLs para MDX, com componentes React reaproveitáveis.
      **12 de 18 roteiros migrados** (todos os do padrão dominante). Faltam Semana 0 e
      Encontro 1, de vocabulário anterior à padronização, e os quatro guias de projeto
      (Encontros 8, 15, 16 e 17). Os slides seguem como HTML avulso por decisão: são
      apresentação, não documento
- [ ] **Fase 3** — quiz nativo com Supabase: aluno envia por rota server-side, vê só o próprio
      resultado; painel do professor autenticado, com exportação para planilha
- [ ] **Fase 4** — testes (Vitest + Playwright) e CI no GitHub Actions

## Material do professor

Roteiros de condução, checklists e rubricas de correção **não** são publicados aqui: ficam na
pasta de trabalho da disciplina. Quando a autenticação existir (fase 3), passam a viver numa área
restrita.
