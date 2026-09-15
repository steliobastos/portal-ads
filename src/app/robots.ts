import type { MetadataRoute } from "next";
import { URL_SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/professor" },
    sitemap: `${URL_SITE}/sitemap.xml`,
  };
}
