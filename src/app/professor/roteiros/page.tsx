import type { Metadata } from "next";
import Link from "next/link";
import { Selo } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { dataCurta, situacao } from "@/lib/datas";
import { listarDocumentos, type Documento } from "@/lib/documentos-professor";
import { Moldura, exigirProfessor } from "../moldura";

export const metadata: Metadata = {
  title: "Roteiros · Área do professor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PaginaRoteiros() {
  const acesso = await exigirProfessor();
  if ("bloqueio" in acesso) return acesso.bloqueio;

  const conteudo = conteudoDa(slugsPublicados()[0])!;
  const documentos = await listarDocumentos();
  const transversais = documentos.filter((d) => d.encontro === null);
  const proximo = conteudo.encontros.find((e) => situacao(e.data) === "futuro");

  return (
    <Moldura aba="roteiros" email={acesso.email}>
      <p className="mb-8 max-w-3xl text-sm text-ink-dim">
        O material de condução de cada encontro, lido da pasta <code className="font-mono">curso/</code>{" "}
        da sua máquina. Depois de editar um arquivo, rode{" "}
        <code className="font-mono">npm run professor:publicar</code> para atualizar esta página.
      </p>

      {documentos.length === 0 && (
        <p className="text-ink-faint">
          Nada publicado ainda. Rode <code className="font-mono">npm run professor:publicar</code>.
        </p>
      )}

      {transversais.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg">Material transversal</h2>
          <ListaDocumentos documentos={transversais} />
        </section>
      )}

      <ol className="space-y-3">
        {conteudo.encontros.map((e) => {
          const doEncontro = documentos.filter((d) => d.encontro === e.numero);
          if (doEncontro.length === 0) return null;
          const ehProximo = proximo?.numero === e.numero;
          return (
            <li
              key={e.numero}
              className={
                ehProximo
                  ? "rounded-xl border border-primary bg-primary-soft p-4"
                  : "rounded-xl border border-line bg-card p-4"
              }
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-ink-faint">
                  {e.numero === 0 ? "Semana 0" : `Encontro ${e.numero}`} · {dataCurta(e.data)}
                </span>
                {ehProximo && <Selo tom="primary">próxima aula</Selo>}
                {e.marco && (
                  <Selo tom="alert">
                    {e.marco.nota} · {e.marco.etapa}ª etapa
                  </Selo>
                )}
              </div>
              <p className="font-medium text-ink">{e.titulo}</p>
              <ListaDocumentos documentos={doEncontro} />
            </li>
          );
        })}
      </ol>
    </Moldura>
  );
}

function ListaDocumentos({ documentos }: { documentos: Documento[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {documentos.map((d) => (
        <li key={d.caminho}>
          <Link
            href={`/professor/roteiros/${d.caminho}`}
            className="inline-block rounded-lg border border-line bg-card px-3 py-1.5 text-sm text-ink hover:border-primary-dim hover:text-primary"
          >
            {d.titulo}
          </Link>
        </li>
      ))}
    </ul>
  );
}
