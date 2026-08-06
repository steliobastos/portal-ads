import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { Cabecalho } from "@/components/navegacao";
import { Rodape } from "@/components/rodape";
import { URL_SITE } from "@/lib/site";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--fonte-display",
  display: "swap",
});

const corpo = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fonte-corpo",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fonte-mono",
  display: "swap",
});

const TITULO = "Portal de Disciplinas — IFCE Campus Horizonte";
const DESCRICAO =
  "Guia do aluno das disciplinas do professor José Stelio Sampaio Bastos Neto — Tecnólogo em Análise e Desenvolvimento de Sistemas, IFCE Campus Horizonte.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: {
    default: TITULO,
    template: "%s · Portal de Disciplinas",
  },
  description: DESCRICAO,
  applicationName: "Portal de Disciplinas",
  authors: [{ name: "José Stelio Sampaio Bastos Neto" }],
  keywords: [
    "IFCE",
    "Campus Horizonte",
    "Análise e Desenvolvimento de Sistemas",
    "Sistemas Operacionais",
    "Linux",
    "Docker",
  ],
  // O link do portal circula por WhatsApp e Classroom: sem estes campos, a
  // prévia da mensagem sai sem título nem imagem.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: URL_SITE,
    siteName: "Portal de Disciplinas",
    title: TITULO,
    description: DESCRICAO,
  },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1b878f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable} ${mono.variable}`}>
      {/*
       * Cabeçalho e rodapé vivem aqui, no layout raiz, e não nos layouts de
       * seção: assim nenhuma página do portal pode nascer sem navegação — foi
       * exatamente o que aconteceu com a capa e o 404 antes.
       */}
      <body className="flex min-h-screen flex-col antialiased">
        <Cabecalho />
        {children}
        <Rodape />
      </body>
    </html>
  );
}
