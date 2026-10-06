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
