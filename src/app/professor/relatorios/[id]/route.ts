import { arquivoDaEntrega } from "@/lib/painel-quiz";
import { clienteAdmin, professorLogado } from "@/lib/supabase/servidor";

/**
 * Download do arquivo de uma entrega (PDF ou .zip): confere a sessão e redireciona para uma URL
 * assinada de 60 segundos. O link da página nunca expõe o arquivo em si —
 * copiado e aberto por outra pessoa, só leva ao login.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await professorLogado())) return new Response("Não autorizado", { status: 401 });

  const { id } = await params;
  const entrega = await arquivoDaEntrega(Number(id));
  if (!entrega) return new Response("Entrega não encontrada", { status: 404 });

  const extensao = entrega.arquivo.split(".").pop();
  const nome = `etapa-${entrega.etapa}-${entrega.fase}-${entrega.equipe}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .toLowerCase();

  const { data, error } = await clienteAdmin()!
    .storage.from("relatorios")
    .createSignedUrl(entrega.arquivo, 60, { download: `${nome}.${extensao}` });
  if (error) return new Response("Arquivo indisponível", { status: 404 });

  return Response.redirect(data.signedUrl, 302);
}
