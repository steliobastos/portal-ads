-- Lista de alunos da turma
--
-- Por que no banco e não em `src/content/`, junto do resto do conteúdo: este
-- repositório é público. Nome e matrícula de aluno são dado pessoal e não
-- entram no git. A lista é carregada do CSV do diário pelo script
-- `npm run turma:importar` e vive só aqui.
--
-- Para que serve: nos formulários do portal (quiz semanal e entrega do
-- relatório), o aluno **escolhe o nome numa lista** em vez de digitar nome e
-- matrícula. Isso elimina a fonte de erro mais cara do semestre — matrícula
-- digitada errada, que faz o envio não cair no portfólio de ninguém.
--
-- O navegador recebe apenas `id` e `nome`: a matrícula nunca sai do servidor.
-- É o servidor que, ao receber um `id`, resolve nome e matrícula oficiais.
--
-- Aplicar: painel do Supabase → SQL Editor → colar este arquivo → Run.

create table public.turma_alunos (
  -- Identificador opaco, usado como valor das opções da lista no formulário.
  id            uuid        primary key default gen_random_uuid(),
  disciplina    text        not null,
  matricula     text        not null,
  nome          text        not null,
  -- Rótulo da oferta em que o aluno entrou ("2026.2"). Informativo: quem
  -- serve de filtro é `ativo`.
  turma         text        not null default '',
  -- Aluno que saiu da lista do diário fica `false`, não é apagado: os envios
  -- que ele já fez continuam fazendo sentido.
  ativo         boolean     not null default true,
  atualizado_em timestamptz not null default now(),
  unique (disciplina, matricula)
);

create index turma_alunos_por_disciplina
  on public.turma_alunos (disciplina, ativo, nome);

-- RLS ligada e nenhuma política, como nas demais tabelas: só o servidor do
-- portal, com a chave secreta, lê esta lista.
alter table public.turma_alunos enable row level security;
