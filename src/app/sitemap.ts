import type { MetadataRoute } from "next";
import { conteudoDa, slugsPublicados } from "@/content";
import { URL_SITE } from "@/lib/site";

const SECOES = ["encontros", "cronograma", "leituras", "avaliacao"] as const;

/**
 * Mapa do site. Deriva das mesmas funções que geram as rotas — disciplina nova
 * ou encontro novo entra aqui sozinho, sem edição manual.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const rotas: string[] = ["/"];

  for (const slug of slugsPublicados()) {
    rotas.push(`/${slug}`);
    for (const secao of SECOES) rotas.push(`/${slug}/${secao}`);
    for (const encontro of conteudoDa(slug)?.encontros ?? []) {
      rotas.push(`/${slug}/encontros/${encontro.numero}`);
    }
  }

  return rotas.map((rota) => ({
    url: `${URL_SITE}${rota}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: rota === "/" ? 1 : 0.7,
  }));
}
