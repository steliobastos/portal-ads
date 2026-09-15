import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { ENCONTROS } from "./src/content/so/encontros";
import { QUIZZES } from "./src/content/so/quizzes";

const nextConfig: NextConfig = {
  /**
   * Os quizzes em HTML avulso saíram de `public/material/` na Fase 3 (gravavam
   * com `window.storage`, que não existe fora dos artefatos do Claude). Link
   * antigo que ficou num grupo de WhatsApp ou no Classroom cai no quiz nativo
   * em vez de dar 404.
   */
  async redirects() {
    return QUIZZES.map((q) => {
      const pasta = ENCONTROS.find((e) => e.numero === q.encontro)!.pasta;
      const arquivo = `Quiz_Encontro-${String(q.encontro).padStart(2, "0")}.html`;
      return {
        source: `/material/so/${pasta}/${arquivo}`,
        destination: `/so/encontros/${q.encontro}/quiz`,
        permanent: true,
      };
    });
  },
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
 *
 * `remark-gfm` entra por causa das tabelas: tabela não faz parte do Markdown
 * original, e sem ele os guias de avaliação renderizavam a grade de critérios
 * como uma linha de canos literais. Declarado pelo **nome**, não pelo módulo
 * importado — o Turbopack precisa serializar a configuração dos plugins.
 */
const comMDX = createMDX({
  options: { remarkPlugins: [["remark-gfm", {}]] },
});

export default comMDX(nextConfig);
