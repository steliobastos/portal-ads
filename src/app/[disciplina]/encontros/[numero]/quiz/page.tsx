import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioQuiz } from "@/components/quiz";
import { conteudoDa, quizDo, slugsPublicados } from "@/content";
import { momentoCampus } from "@/lib/datas";
import { prazoDoQuiz } from "@/lib/portfolio";
import { quizPublico } from "@/lib/quiz";

type Props = { params: Promise<{ disciplina: string; numero: string }> };

export function generateStaticParams() {
  return slugsPublicados().flatMap((disciplina) =>
    (conteudoDa(disciplina)?.quizzes ?? []).map((q) => ({
      disciplina,
      numero: String(q.encontro),
    })),
  );
}

/** Só encontros com quiz geram rota — os demais caem no 404. */
export const dynamicParams = false;

function buscar(slug: string, numero: string) {
  const conteudo = conteudoDa(slug);
  const encontro = conteudo?.encontros.find((e) => String(e.numero) === numero);
  const quiz = encontro && quizDo(slug, encontro.numero);
  return conteudo && encontro && quiz ? { conteudo, encontro, quiz } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina, numero } = await params;
  const achado = buscar(disciplina, numero);
  if (!achado) return {};
  return {
    title: `Quiz da semana · Encontro ${achado.encontro.numero}`,
    description: `Verificação de leitura e observações de laboratório — ${achado.encontro.titulo}.`,
  };
}

export default async function PaginaQuiz({ params }: Props) {
  const { disciplina: slug, numero } = await params;
  const achado = buscar(slug, numero);
  if (!achado) notFound();

  const { conteudo, encontro, quiz } = achado;
  const rotulo = `Encontro ${encontro.numero}`;
  const prazo = prazoDoQuiz(conteudo, encontro.numero);

  return (
    <div className="max-w-3xl">
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
        <span className="text-ink-dim">quiz</span>
      </nav>

      <header className="mb-10">
        <p className="mb-1.5 font-mono text-xs tracking-[0.14em] text-primary uppercase">
          Quiz da semana · {rotulo}
        </p>
        <h1 className="text-3xl leading-tight sm:text-4xl">{encontro.titulo}</h1>
        <p className="mt-4 text-ink-dim">
          Perguntas rápidas sobre a leitura e as suas observações da prática, num envio só. Leva uns
          5 minutos e compõe o portfólio da etapa — não é prova.
        </p>
        <p className="mt-3 text-sm text-ink">
          <span className="font-medium">Prazo:</span> {momentoCampus(prazo, true)}.{" "}
          <Link href={`/${slug}/avaliacao#portfolio`} className="text-primary hover:underline">
            Como o portfólio vira nota →
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-line bg-panel p-4">
          <p className="font-mono text-xs tracking-[0.12em] text-ink-faint uppercase">
            Leitura cobrada
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {quiz.leituras.map((l) => (
              <li key={l.fonte}>
                {l.fonte} <span className="font-mono text-xs text-ink-dim">{l.paginas}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <FormularioQuiz disciplina={slug} quiz={quizPublico(quiz)} prazo={prazo} />
    </div>
  );
}
