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
| Conteúdo | Módulos TypeScript tipados em `src/content/`; roteiros em MDX (`@next/mdx` + `remark-gfm`) |
| Deploy | Vercel (plano Hobby) |
| Banco | Supabase — PostgreSQL + Auth, acessado só pelo servidor (`@supabase/supabase-js`, `@supabase/ssr`), com validação em Zod |

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
public/material/<disciplina>/<pasta>/   slides em HTML avulso
supabase/migrations/                    SQL do banco (aplicado no painel do Supabase)
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

Os roteiros vivem em `src/content/so/roteiros/<numero>.mdx` e usam os componentes de
`src/components/aula.tsx` (`<Passo>`, `<Comando>`, `<Terminal>`, `<Dica>`, `<Checklist>`…). A rota
`/so/encontros/<n>/roteiro` só existe se o `.mdx` existir; enquanto não existir, a página do
encontro continua oferecendo o HTML avulso. Os dois nunca aparecem juntos.

Os 18 (Semana 0 + 17 encontros) já foram migrados. Diferente do HTML original, o que o aluno
escreve nos rascunhos de observação e marca no checklist **sobrevive ao recarregamento** — fica no
navegador dele (`localStorage`), não no servidor.

`scripts/converter-roteiro.mjs` fez a conversão inicial a partir do HTML. Ele **relata** todo bloco
que não reconhece em vez de descartá-lo em silêncio — omissão em material didático é pior que erro
visível, porque ninguém nota que um passo sumiu.

### Quiz semanal

Cada encontro com leitura tem um quiz em `/so/encontros/<n>/quiz`: perguntas de múltipla escolha
sobre a leitura e as observações do laboratório, num envio só. O conteúdo fica em
`src/content/so/quizzes.ts`, versionado; o banco guarda só os envios.

- **O navegador nunca fala com o banco.** O formulário chama uma Server Action
  (`src/lib/acoes-quiz.ts`), que valida com Zod, corrige no servidor e grava com a chave secreta.
  A página não recebe o gabarito nem as justificativas; eles só voltam na resposta ao envio.
- **RLS ligada e sem nenhuma política** na tabela `submissoes_quiz`: a chave pública não lê nem
  grava nada nela.
- **Cada envio é uma linha nova.** Vale o acerto do primeiro envio (reenviar depois de ver as
  justificativas não melhora a nota) e as observações do último (o aluno pode voltar para
  completá-las).
- As observações usam a mesma chave de `localStorage` dos rascunhos do roteiro: o que o aluno
  escreveu durante a prática chega preenchido. Quem é o aluno **não** fica guardado, porque os
  computadores do laboratório são compartilhados.

### A lista da turma

Com a turma importada, o aluno **escolhe o nome numa lista** em vez de digitar nome e matrícula —
tanto no quiz quanto na entrega do relatório. Some assim a fonte de erro mais cara do semestre:
matrícula digitada errada, que faz o envio não cair no portfólio de ninguém.

```bash
npm run turma:importar -- curso/turmas/so-2026-2.csv --disciplina so --turma 2026.2
```

- **A lista vive só no banco** (`turma_alunos`), nunca em `src/content/`: este repositório é
  público e nome de aluno é dado pessoal. O CSV fica em `curso/`, que está no `.gitignore`.
- **A matrícula não chega ao navegador.** A lista é carregada depois que a página abre (Server
  Action `src/lib/acoes-turma.ts`) e traz só nome e um identificador opaco; é o servidor que
  resolve a matrícula oficial ao gravar o envio. Como o carregamento não é feito no build, a lista
  também não entra no HTML estático nem em buscador.
- **Quem não está na lista continua podendo digitar** ("Não encontrei meu nome"), e **sem turma
  importada o formulário é o de antes** — nada deixa de funcionar.
- Reimportar atualiza os nomes e **inativa quem saiu** do CSV, sem apagar: os envios que essa
  pessoa já fez continuam no painel. Não precisa publicar o site depois.
- A lista de nomes fica visível para quem abrir a página do quiz. É a contrapartida consciente da
  comodidade; se um dia isso incomodar, basta esvaziar a tabela e o formulário volta a pedir nome e
  matrícula digitados.
- `/professor` é o painel: login pelo Supabase Auth, aceito só para o e-mail de `PROFESSOR_EMAIL`.
  Tem três abas: envios por quiz (com as marcas do professor), portfólio consolidado por etapa e
  relatórios entregues, com exportação `.csv`.

Os quizzes começaram como HTML avulso que gravava com `window.storage`, uma API que só existe
dentro dos artefatos do Claude. Publicados no portal, eles não salvavam nada. Por isso saíram de
`public/material/`, e os endereços antigos redirecionam para o quiz nativo (`next.config.ts`).

**Sem as variáveis do Supabase o portal funciona normalmente**: os quizzes aparecem, mas o envio
avisa que ainda não está ativo.

### Portfólio, prazos e relatório

As regras de nota de SO vivem em `src/content/so/avaliacao.ts`: pesos de cada etapa, valor de cada
quiz, descarte do pior, prazos e rubricas. A página de avaliação, a página do quiz, o enunciado do
projeto e o painel leem dali. Mudar um peso ou prazo é mudar esse arquivo.

- **Prazo do quiz:** quinta-feira seguinte ao encontro, 23:59 de Horizonte, salvo prazo especial.
  Envio atrasado é aceito e marcado; vale zero no portfólio até o professor aceitar o atraso.
- **Cálculo** em `src/lib/portfolio.ts`, com funções puras. A leitura do banco para o painel fica
  em `src/lib/painel-quiz.ts`.
- **Enunciado do projeto** em `src/content/so/projetos/<etapa>.mdx`, publicado em
  `/so/projeto/<etapa>`, com o formulário de envio do PDF.
- **Envio do PDF em dois tempos** (`src/lib/acoes-entrega.ts`): o servidor gera uma URL assinada
  de uso único para um caminho no bucket privado `relatorios`, e o navegador envia direto ao
  Supabase. Isso contorna o limite de 4,5 MB do corpo das funções da Vercel. Depois o servidor
  confere que o arquivo chegou e registra a entrega. O professor baixa por URL assinada de 60 s.

#### Configurar o banco (uma vez por ambiente)

1. Crie um projeto em <https://supabase.com> (região São Paulo).
2. **SQL Editor**: rode, em ordem, os arquivos de `supabase/migrations/`.
3. **Authentication → Sign In / Providers**: desligue *Allow new users to sign up*.
4. **Authentication → Users → Add user**: crie o usuário do professor (e-mail + senha, com
   *Auto Confirm User*).
5. Copie `.env.example` para `.env.local` e preencha. Na Vercel, cadastre as mesmas variáveis e
   faça um novo deploy.

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
| `SUPABASE_URL` | quiz | Endereço do projeto Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | quiz | Chave pública, usada só no login do professor |
| `SUPABASE_SECRET_KEY` | quiz | Chave secreta, que ignora a RLS. Só no servidor |
| `PROFESSOR_EMAIL` | quiz | Único e-mail com acesso a `/professor` |

O endereço absoluto alimenta o `metadataBase` (prévia do link em WhatsApp e Classroom), o
`sitemap.xml` e o `robots.txt`.

## Roadmap

- [x] **Fase 1** — esqueleto, identidade visual, conteúdo dos 17 encontros, material servido,
      favicon, prévia de compartilhamento, `sitemap.xml`/`robots.txt` e deploy na Vercel
- [x] **Fase 2** — os 18 roteiros e guias migrados para MDX. Os slides seguem como HTML avulso
      por decisão: são apresentação, não documento
- [x] **Fase 3** — quiz nativo com Supabase: envio por Server Action, correção no servidor,
      painel do professor autenticado com exportação para planilha
- [ ] **Fase 4** — testes (Vitest + Playwright) e CI no GitHub Actions

## Material do professor

Roteiros de condução, checklists e rubricas ficam em `curso/`, **fora do git**: o repositório é
público. Por isso não entram no build. `npm run professor:publicar`, rodado só na máquina do
professor (usa o `.env.local`), espelha `curso/**/*.md` num bucket **privado** do Supabase. A aba
Roteiros de `/professor` lê de lá, com sessão conferida. Editou um roteiro? Rode o script de novo;
não precisa de deploy.
