-- Fase 3 · quiz semanal nativo
--
-- Uma tabela só, de propósito. O conteúdo do quiz (perguntas, gabarito,
-- justificativas) vive versionado em `src/content/<disciplina>/quizzes.ts`,
-- não no banco — o banco guarda apenas o que é dinâmico e privado: o que cada
-- aluno enviou.
--
-- Cada envio é uma linha nova, nunca uma atualização. O aluno pode reenviar
-- (para completar as observações depois, por exemplo): vale o acerto do
-- primeiro envio e as observações do último. O histórico fica, e com ele fica
-- visível qualquer envio feito com a matrícula de outra pessoa.
--
-- Aplicar: painel do Supabase → SQL Editor → colar este arquivo → Run.

create table public.submissoes_quiz (
  id          bigint generated always as identity primary key,
  disciplina  text        not null,
  encontro    smallint    not null,
  matricula   text        not null,
  nome        text        not null,
  -- índice da alternativa marcada em cada pergunta, na ordem do quiz
  respostas   smallint[]  not null,
  -- corrigido no servidor no momento do envio: a nota não depende de o
  -- conteúdo do quiz continuar igual depois
  acertos     smallint    not null,
  aprovado    boolean     not null,
  observacoes text[]      not null,
  enviado_em  timestamptz not null default now()
);

-- O painel do professor lê "o envio mais recente de cada matrícula num encontro".
create index submissoes_quiz_por_encontro
  on public.submissoes_quiz (disciplina, encontro, matricula, enviado_em desc);

-- RLS ligada e NENHUMA política: a chave pública (a que poderia chegar ao
-- navegador) não lê nem grava nada nesta tabela. Só o servidor do portal, com
-- a chave secreta, acessa — e ele só expõe os dados ao professor autenticado.
-- É a segunda linha de defesa: mesmo que alguém ache a chave pública, não há
-- o que ler.
alter table public.submissoes_quiz enable row level security;
