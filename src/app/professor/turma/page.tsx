import type { Metadata } from "next";
import Link from "next/link";
import { Selo, cx } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { turmaParaPainel } from "@/lib/turma";
import { Moldura, exigirProfessor } from "../moldura";
import { FormularioTurma } from "./formulario";

export const metadata: Metadata = {
  title: "Turma · Área do professor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ disciplina?: string }> };

/**
 * A lista da turma (tabela `turma_alunos`) e a importação do CSV do diário.
 * É a lista que os formulários de quiz e de relatório mostram para o aluno se
 * escolher — e de onde sai a matrícula oficial de cada envio.
 */
export default async function PaginaTurma({ searchParams }: Props) {
  const acesso = await exigirProfessor();
  if ("bloqueio" in acesso) return acesso.bloqueio;

  const slugs = slugsPublicados();
  const params = await searchParams;
  const slug = slugs.includes(params.disciplina ?? "") ? params.disciplina! : slugs[0];
  const alunos = await turmaParaPainel(slug);
  const ativos = alunos.filter((a) => a.ativo);
  const inativos = alunos.filter((a) => !a.ativo);

  return (
    <Moldura aba="turma" email={acesso.email}>
      {slugs.length > 1 && (
        <nav aria-label="Disciplinas" className="mb-8 flex flex-wrap gap-1.5">
          {slugs.map((s) => (
            <Link
              key={s}
              href={`/professor/turma?disciplina=${s}`}
              aria-current={s === slug ? "page" : undefined}
              className={cx(
                "rounded-lg border px-3 py-1.5 font-mono text-xs",
                s === slug ? "border-primary bg-primary text-white" : "border-line bg-card text-ink-dim",
              )}
            >
              {conteudoDa(s)!.disciplina.codigo}
            </Link>
          ))}
        </nav>
      )}

      <section className="mb-12">
        <h2 className="text-2xl">Importar a lista do diário</h2>
        <p className="mt-1 mb-5 max-w-3xl text-sm text-ink-dim">
          Exporte a turma do diário em CSV e anexe aqui. Primeiro o portal mostra o que vai mudar;
          só grava quando você confirmar. Quem sair do diário sai da lista, mas não é apagado — os
          envios dessa pessoa continuam no painel. Linha fora do formato faz a importação inteira ser
          recusada.
        </p>
        <FormularioTurma
          disciplinas={slugs.map((s) => ({ slug: s, nome: conteudoDa(s)!.disciplina.nome }))}
          turmaPadrao={ativos[0]?.turma ?? ""}
        />
      </section>

      <section>
        <h2 className="text-2xl">Lista atual</h2>
        <p className="mt-1 mb-5 text-sm text-ink-dim">
          {ativos.length} aluno(s) na lista
          {inativos.length > 0 && ` · ${inativos.length} fora da lista (saíram do diário)`}. Os
          alunos veem só os nomes; a matrícula nunca sai do servidor.
        </p>
        {alunos.length === 0 ? (
          <p className="text-ink-faint">
            Nenhuma turma importada: os formulários pedem nome e matrícula digitados.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Nome</th>
                  <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Matrícula</th>
                  <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Turma</th>
                  <th scope="col" className="px-4 py-3 font-medium text-ink-dim">Situação</th>
                </tr>
              </thead>
              <tbody>
                {[...ativos, ...inativos].map((a) => (
                  <tr key={a.id} className="border-b border-line-soft last:border-0">
                    <td className={cx("px-4 py-2.5", a.ativo ? "text-ink" : "text-ink-faint")}>{a.nome}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-faint">{a.matricula}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-faint">{a.turma}</td>
                    <td className="px-4 py-2.5">
                      {a.ativo ? <Selo tom="secondary">na lista</Selo> : <Selo>fora da lista</Selo>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Moldura>
  );
}
