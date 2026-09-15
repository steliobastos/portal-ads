import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Acesso ao Supabase — só no servidor.
 *
 * Nenhuma variável aqui leva o prefixo `NEXT_PUBLIC_`: o navegador nunca fala
 * com o banco. O aluno envia o quiz para uma Server Action do portal, e é o
 * portal que grava. O `import "server-only"` faz o build falhar se algum
 * componente de cliente importar este arquivo por engano.
 *
 * Duas chaves, dois papéis:
 * - `SUPABASE_SECRET_KEY` ignora a RLS. Usada só depois de o próprio código
 *   decidir que a operação é permitida (gravar um envio; ler tudo, se for o
 *   professor).
 * - `SUPABASE_PUBLISHABLE_KEY` é a chave pública, usada apenas para o login do
 *   professor. Com a RLS ligada e sem políticas, ela não lê dado nenhum.
 */

type Config = { url: string; publica: string; secreta: string };

export function configSupabase(): Config | null {
  const url = process.env.SUPABASE_URL;
  const publica = process.env.SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SECRET_KEY;
  return url && publica && secreta ? { url, publica, secreta } : null;
}

/** Cliente com a chave secreta. `null` enquanto o banco não estiver configurado. */
export function clienteAdmin() {
  const config = configSupabase();
  if (!config) return null;
  return createClient(config.url, config.secreta, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cliente que lê e grava a sessão do professor nos cookies da requisição. */
export async function clienteSessao() {
  const config = configSupabase();
  if (!config) return null;
  const cookieStore = await cookies();

  return createServerClient(config.url, config.publica, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (novos) => {
        try {
          for (const { name, value, options } of novos) cookieStore.set(name, value, options);
        } catch {
          // Chamado durante a renderização de um Server Component, onde cookie
          // não pode ser gravado. Sem problema: o middleware renova a sessão.
        }
      },
    },
  });
}

/**
 * O professor logado, ou `null`.
 *
 * Não basta estar autenticado: o e-mail precisa ser o de `PROFESSOR_EMAIL`.
 * O cadastro público fica desligado no painel do Supabase, mas se um dia for
 * religado por engano, uma conta nova ainda não enxerga o painel.
 */
export async function professorLogado() {
  const supabase = await clienteSessao();
  const permitido = process.env.PROFESSOR_EMAIL?.trim().toLowerCase();
  if (!supabase || !permitido) return null;

  const { data } = await supabase.auth.getUser();
  return data.user?.email?.toLowerCase() === permitido ? data.user : null;
}
