/**
 * Endereço público do portal.
 *
 * Precisa ser absoluto para o `metadataBase` do Next (imagem de compartilhamento,
 * canonical, sitemap). A ordem de resolução cobre os três lugares onde o site roda:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — definida à mão quando houver domínio próprio;
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — injetada pela Vercel no build de produção,
 *    sempre o domínio estável do projeto (não a URL efêmera do preview);
 * 3. localhost — desenvolvimento.
 */
function resolver(): string {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicita) return explicita.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const URL_SITE = resolver();
