import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renova a sessão do professor a cada requisição da área restrita.
 *
 * O token de acesso do Supabase expira em uma hora. Server Components não podem
 * gravar cookie, então sem este passo o painel "deslogaria" sozinho depois
 * disso. Roda só em `/professor` — as páginas dos alunos não têm sessão e
 * continuam estáticas.
 *
 * Não reaproveita `lib/supabase/servidor.ts` de propósito: aquele módulo lê os
 * cookies via `next/headers`, e aqui eles vêm da própria requisição.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) return NextResponse.next();

  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (novos) => {
        for (const { name, value } of novos) request.cookies.set(name, value);
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of novos) resposta.cookies.set(name, value, options);
      },
    },
  });

  // Não remover: é esta chamada que dispara a renovação do token.
  await supabase.auth.getUser();

  return resposta;
}

export const config = {
  matcher: ["/professor/:path*"],
};
