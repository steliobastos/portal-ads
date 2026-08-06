import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

/**
 * Suporte a MDX nativo do Next.
 *
 * Escolha deliberada sobre o `next-mdx-remote`: aquele pacote existe para
 * renderizar MDX vindo de fonte remota e não confiável e, por isso, **remove
 * expressões JavaScript** — `{variável}` e `prop={valor}` — antes de compilar.
 * É a decisão certa para o problema dele e a errada para o nosso: o MDX daqui é
 * conteúdo próprio, versionado neste repositório, e depende de expressões
 * (`<Passo numero={1} de={8}>`, saídas de terminal em template literal).
 *
 * ⚠️ O `npm run dev` precisa do Turbopack (já está no script). Com o empacotador
 * antigo, o módulo gerado a partir do `.mdx` resolve `react/jsx-runtime` para o
 * React de `node_modules` enquanto o servidor RSC roda o React que o Next traz
 * compilado — dois exemplares de React — e a página quebra com `Cannot read
 * properties of undefined (reading 'recentlyCreatedOwnerStacks')`. O build de
 * produção nunca sofreu disso; era falha só de desenvolvimento.
 */
const comMDX = createMDX({});

export default comMDX(nextConfig);
