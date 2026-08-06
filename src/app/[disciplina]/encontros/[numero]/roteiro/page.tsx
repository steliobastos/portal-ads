import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoLink } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { carregarRoteiro } from "@/content/roteiros";
import { encontrosComRoteiro } from "@/lib/roteiros";

type Props = { params: Promise<{ disciplina: string; numero: string }> };

export async function generateStaticParams() {
  const params = [];
  for (const disciplina of slugsPublicados()) {
    for (const numero of await encontrosComRoteiro(disciplina)) {
      params.push({ disciplina, numero: String(numero) });
    }
  }
  return params;
}

/** Só as rotas geradas acima existem — encontro sem `.mdx` cai no 404. */
export const dynamicParams = false;

function buscar(slug: string, numero: string) {
  const conteudo = conteudoDa(slug);
  const encontro = conteudo?.encontros.find((e) => String(e.numero) === numero);
  return conteudo && encontro ? { conteudo, encontro } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina, numero } = await params;
  const achado = buscar(disciplina, numero);
  if (!achado) return {};
  return {
    title: `Roteiro de laboratório · Encontro ${achado.encontro.numero}`,
    description: achado.encontro.resumo,
  };
}

export default async function PaginaRoteiro({ params }: Props) {
  const { disciplina: slug, numero } = await params;
  const achado = buscar(slug, numero);
  if (!achado) notFound();

  const Roteiro = await carregarRoteiro(slug, achado.encontro.numero);
  if (!Roteiro) notFound();

  const { conteudo, encontro } = achado;
  const rotulo = encontro.numero === 0 ? "Semana 0" : `Encontro ${encontro.numero}`;

  return (
    <div className="max-w-4xl">
      <nav aria-label="Trilha" className="mb-10 font-mono text-xs text-ink-faint">
        <Link href={`/${slug}`} className="hover:text-primary">
          {conteudo.disciplina.codigo}
        </Link>
        {" / "}
        <Link href={`/${slug}/encontros`} className="hover:text-primary">
          encontros
        </Link>
        {" / "}
        <Link href={`/${slug}/encontros/${encontro.numero}`} className="hover:text-primary">
          {rotulo.toLowerCase()}
        </Link>
        {" / "}
        <span className="text-ink-dim">roteiro</span>
      </nav>

      <Roteiro />

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <BotaoLink href={`/${slug}/encontros/${encontro.numero}`} variante="secundario">
          ← Voltar ao {rotulo.toLowerCase()}
        </BotaoLink>
      </div>
    </div>
  );
}
