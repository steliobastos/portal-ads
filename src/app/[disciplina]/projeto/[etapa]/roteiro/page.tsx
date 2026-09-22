import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoLink } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { carregarRoteiroProjeto } from "@/content/roteiros";
import { momentoCampus } from "@/lib/datas";

type Props = { params: Promise<{ disciplina: string; etapa: string }> };

export async function generateStaticParams() {
  const params = [];
  for (const disciplina of slugsPublicados()) {
    for (const etapa of [1, 2]) {
      if (await carregarRoteiroProjeto(disciplina, etapa)) {
        params.push({ disciplina, etapa: String(etapa) });
      }
    }
  }
  return params;
}

/** Só as etapas com roteiro publicado geram página. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { etapa } = await params;
  return {
    title: `Como fazer a entrega parcial · projeto ${etapa}ª etapa`,
    description: "Roteiro passo a passo: capturar as evidências, escrever as seções e montar o PDF.",
  };
}

export default async function PaginaRoteiroProjeto({ params }: Props) {
  const { disciplina: slug, etapa: etapaTexto } = await params;
  const conteudo = conteudoDa(slug);
  const etapa = Number(etapaTexto) as 1 | 2;
  const Roteiro = conteudo && (await carregarRoteiroProjeto(slug, etapa));
  if (!conteudo || !Roteiro) notFound();

  // O prazo mora em `avaliacao.ts`: mudou lá, muda aqui. O roteiro em si não
  // cita data nenhuma — é material reaproveitado a cada oferta.
  const parcial = conteudo.regrasNota.entregas.find((e) => e.etapa === etapa && e.fase === "parcial");

  return (
    <div className="max-w-4xl">
      <nav aria-label="Trilha" className="mb-10 font-mono text-xs text-ink-faint">
        <Link href={`/${slug}`} className="hover:text-primary">
          {conteudo.disciplina.codigo}
        </Link>
        {" / "}
        <Link href={`/${slug}/projeto/${etapa}`} className="hover:text-primary">
          projeto {etapa}ª etapa
        </Link>
        {" / "}
        <span className="text-ink-dim">como fazer</span>
      </nav>

      {parcial && (
        <p className="mb-8 rounded-xl border border-alert/30 bg-alert-soft p-4 text-sm text-ink">
          <span className="font-medium">{parcial.nome}</span> — {parcial.secoes}. Prazo:{" "}
          <span className="font-mono">{momentoCampus(parcial.prazo, true)}</span>.
        </p>
      )}

      <Roteiro />

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <BotaoLink href={`/${slug}/projeto/${etapa}#entrega`}>Ir para o envio →</BotaoLink>
        <BotaoLink href={`/${slug}/projeto/${etapa}`} variante="secundario">
          ← Voltar ao enunciado
        </BotaoLink>
      </div>
    </div>
  );
}
