import Link from "next/link";
import { notFound } from "next/navigation";
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
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          <Link href="/" className="font-mono text-[12.5px] tracking-wide text-ink-dim">
            <b className="text-primary">IFCE</b> · Portal de Disciplinas
          </Link>

          <nav aria-label="Seções da disciplina" className="ml-auto">
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
              {SECOES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={`/${slug}${s.href}`}
                    className="rounded-lg px-2.5 py-1.5 text-ink-dim transition-colors hover:bg-primary-soft hover:text-primary"
                  >
                    {s.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

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
