import type { Metadata } from "next";
import Link from "next/link";
import { Cartao, Selo } from "@/components/ui";
import { avisosRecentes } from "@/content/avisos";
import { buscarDisciplina } from "@/content";
import { dataExtensa } from "@/lib/datas";

export const metadata: Metadata = {
  title: "Avisos",
  description: "O que mudou no portal: material novo, mudanças de calendário e lembretes de entrega.",
};

export default function PaginaAvisos() {
  const avisos = avisosRecentes();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-12 sm:py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Portal</p>
        <h1 className="mt-3 text-4xl">Avisos</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-dim">
          Material novo, mudança de data, lembrete de entrega. O que for decidido em aula aparece
          aqui também — para quem faltou não ficar sabendo por terceiros.
        </p>
      </header>

      {avisos.length === 0 ? (
        <p className="text-ink-faint">Nenhum aviso publicado ainda.</p>
      ) : (
        <ol className="space-y-4">
          {avisos.map((aviso) => {
            const disciplina = aviso.disciplina ? buscarDisciplina(aviso.disciplina) : undefined;

            return (
              <li key={aviso.data + aviso.titulo}>
                <Cartao destaque={aviso.fixado}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Selo tom={aviso.fixado ? "primary" : "neutro"}>{aviso.etiqueta}</Selo>
                    {disciplina && <Selo tom="secondary">{disciplina.codigo}</Selo>}
                    <time dateTime={aviso.data} className="font-mono text-xs text-ink-faint">
                      {dataExtensa(aviso.data)}
                    </time>
                  </div>

                  <h2 className="mt-3 font-display text-xl">{aviso.titulo}</h2>
                  <p className="mt-2 text-ink-dim">{aviso.texto}</p>

                  {aviso.href && (
                    <Link
                      href={aviso.href}
                      className="mt-3 inline-block text-sm text-primary hover:underline"
                    >
                      Abrir →
                    </Link>
                  )}
                </Cartao>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
