import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/navegacao";
import { conteudoDa, slugsPublicados } from "@/content";

export function generateStaticParams() {
  return slugsPublicados().map((disciplina) => ({ disciplina }));
}

const SECOES = [
  { href: "", rotulo: "Visão geral" },
  { href: "/encontros", rotulo: "Encontros" },
  { href: "/cronograma", rotulo: "Cronograma" },
  { href: "/leituras", rotulo: "Leituras" },
  { href: "/avaliacao", rotulo: "Avaliação" },
];

export default async function LayoutDisciplina({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ disciplina: string }>;
}) {
  const { disciplina: slug } = await params;
  const conteudo = conteudoDa(slug);
  if (!conteudo) notFound();

  const { disciplina } = conteudo;

  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho
        itens={SECOES.map((s) => ({ href: `/${slug}${s.href}`, rotulo: s.rotulo }))}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-8 text-sm text-ink-dim">
          <p className="font-medium text-ink">
            {disciplina.nome} ({disciplina.codigo}) · {disciplina.periodo}
          </p>
          <p>
            {disciplina.curso} — {disciplina.campus}
          </p>
          <p>Prof. {disciplina.professor}</p>
        </div>
      </footer>
    </div>
  );
}
