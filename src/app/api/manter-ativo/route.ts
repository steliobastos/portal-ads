import { clienteAdmin } from "@/lib/supabase/servidor";

/**
 * Mantém o banco acordado.
 *
 * O plano gratuito do Supabase pausa o projeto depois de cerca de uma semana
 * sem uso — e, pausado, o envio de quiz e a entrega de relatório falham. Em
 * outubro de 2026 isso aconteceu de fato, numa semana sem envios. O agendamento
 * da Vercel (`vercel.json`) chama esta rota uma vez por dia, e a consulta abaixo
 * conta como uso.
 *
 * A consulta só **conta** os alunos (`head: true` não traz linha nenhuma): o
 * objetivo é tocar o banco, não ler dado.
 *
 * A Vercel envia `Authorization: Bearer <CRON_SECRET>` nas chamadas do
 * agendamento. Sem o segredo certo a rota recusa, para que ninguém de fora a
 * use como forma de martelar o banco.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  const supabase = clienteAdmin();
  if (!supabase) return new Response("Banco não configurado", { status: 503 });

  const { error } = await supabase.from("turma_alunos").select("id", { count: "exact", head: true });
  if (error) {
    console.error("Falha ao manter o banco ativo:", error.message);
    return new Response("Banco indisponível", { status: 503 });
  }
  return new Response("ok");
}
