-- O bucket de entregas passa a aceitar .zip, além de PDF.
--
-- A Etapa 2 entrega código (scripts, Dockerfile e README) num .zip. O
-- formulário envia sempre `application/zip`; `application/x-zip-compressed` é o
-- tipo que o Windows informa, aceito por segurança. O limite de 15 MB continua.
-- Nenhum arquivo existente muda.

update storage.buckets
set allowed_mime_types = array['application/pdf', 'application/zip', 'application/x-zip-compressed']
where id = 'relatorios';
