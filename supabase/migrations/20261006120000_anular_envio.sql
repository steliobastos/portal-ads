-- Envio de quiz desconsiderado pelo professor.
--
-- Vazio: o envio vale. Preenchido: o envio continua guardado e aparece no
-- painel, mas não conta para o portfólio — se era o primeiro, o seguinte passa
-- a ser o primeiro. Serve para envio de teste e para envio feito por outra
-- pessoa no nome do aluno (a lista da turma é pública e o envio não tem senha).
--
-- Só acrescenta a coluna: nenhum envio existente muda.

alter table public.submissoes_quiz
  add column anulado_em timestamptz;
