import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { BotaoLink } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { caminhoValido, lerDocumento } from "@/lib/documentos-professor";
import { Moldura, exigirProfessor } from "../../moldura";

export const metadata: Metadata = {
  title: "Roteiro · Área do professor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ caminho: string[] }> };

export default async function PaginaDocumento({ params }: Props) {
  const acesso = await exigirProfessor();
  if ("bloqueio" in acesso) return acesso.bloqueio;

  const caminho = (await params).caminho.map(decodeURIComponent).join("/");
  if (!caminhoValido(caminho)) notFound();
  const texto = await lerDocumento(caminho);
  if (texto === null) notFound();

  const slug = slugsPublicados()[0];
  const numero = caminho.match(/^aula(\d+)\//)?.[1];
  const encontro = numero !== undefined
    ? conteudoDa(slug)!.encontros.find((e) => String(e.numero) === numero)
    : undefined;

  return (
    <Moldura aba="roteiros" email={acesso.email}>
      <nav aria-label="Trilha" className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link href="/professor/roteiros" className="font-mono text-xs text-ink-faint hover:text-primary">
          ← todos os roteiros
        </Link>
        {encontro && (
          <div className="flex flex-wrap gap-2">
            <BotaoLink href={`/${slug}/encontros/${encontro.numero}`} variante="secundario">
              Página do encontro
            </BotaoLink>
            <BotaoLink href={`/${slug}/encontros/${encontro.numero}/roteiro`} variante="secundario">
              Roteiro do aluno
            </BotaoLink>
          </div>
        )}
      </nav>

      <article className="max-w-4xl">
        <Markdown>{texto}</Markdown>
      </article>
    </Moldura>
  );
}
