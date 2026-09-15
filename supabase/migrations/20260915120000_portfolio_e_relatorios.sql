-- Portfólio consolidado e entrega do relatório Raio-X
--
-- Aplicar: painel do Supabase → SQL Editor → colar este arquivo → Run.
-- Todas as tabelas seguem a regra da primeira migração: RLS ligada e nenhuma
-- política. Só o servidor do portal, com a chave secreta, lê e grava.


-- 1. O que o professor decide sobre cada quiz de cada aluno ---------------------
--
-- O portal calcula o portfólio sozinho a partir dos envios. Estas duas marcas
-- são as únicas partes que dependem de julgamento humano, e ficam numa tabela
-- à parte para nunca misturar o que o aluno enviou com o que o professor achou.

create table public.avaliacoes_portfolio (
  disciplina                text        not null,
  encontro                  smallint    not null,
  matricula                 text        not null,
  -- observações genéricas, copiadas ou sem conexão com o conceito: perdem o 0,5
  observacoes_insuficientes boolean     not null default false,
  -- primeiro envio depois do prazo só conta se o professor aceitar
  atraso_aceito             boolean     not null default false,
  atualizado_em             timestamptz not null default now(),
  primary key (disciplina, encontro, matricula)
);

alter table public.avaliacoes_portfolio enable row level security;


-- 2. Entregas do relatório (PDF) ------------------------------------------------
--
-- Como no quiz, cada envio é uma linha nova: a equipe pode reenviar, vale o
-- mais recente, e o histórico fica. O arquivo em si vai para o bucket abaixo;
-- aqui fica só o registro de quem entregou o quê, e quando.

create table public.entregas_relatorio (
  id            bigint generated always as identity primary key,
  disciplina    text        not null,
  etapa         smallint    not null,
  fase          text        not null check (fase in ('parcial', 'final')),
  equipe        text        not null,
  -- [{ "nome": "...", "matricula": "..." }], na ordem informada pela equipe
  integrantes   jsonb       not null,
  -- as mesmas matrículas, ordenadas: é por elas que o painel agrupa reenvios
  matriculas    text[]      not null,
  arquivo       text        not null,
  tamanho_bytes integer     not null,
  enviado_em    timestamptz not null default now()
);

create index entregas_relatorio_por_fase
  on public.entregas_relatorio (disciplina, etapa, fase, enviado_em desc);

alter table public.entregas_relatorio enable row level security;


-- 3. Onde os PDFs ficam ---------------------------------------------------------
--
-- Privado: sem URL pública. A equipe envia por uma URL assinada que o servidor
-- gera para um único caminho e expira; o professor baixa por outra URL
-- assinada, de 60 segundos. `storage.objects` já nasce com RLS e sem políticas.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('relatorios', 'relatorios', false, 15 * 1024 * 1024, array['application/pdf'])
on conflict (id) do nothing;
