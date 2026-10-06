import type { Metadata } from "next";
import Link from "next/link";
import { Selo, cx } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import {
  ajustesOrfaos,
  aplicarAjustes,
  camposDoPrazo,
  chaveDaEntrega,
  type TipoAjuste,
} from "@/lib/ajustes-calendario";
import { lerAjustesDireto } from "@/lib/calendario";
import { dataCurta, momentoCampus } from "@/lib/datas";
import { prazoDoQuiz } from "@/lib/portfolio";
import { Moldura, exigirProfessor } from "../moldura";
import { removerAjuste, salvarAjuste } from "./acoes";
import { FormAjuste } from "./form-ajuste";

export const metadata: Metadata = {
  title: "Calendário · Área do professor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ disciplina?: string }> };

const campo = "rounded-lg border border-line bg-card px-2 py-1 font-mono text-xs text-ink";
const botao =
  "rounded-md border border-line px-2.5 py-1 text-xs text-ink-dim hover:border-primary-dim hover:text-primary";

/**
 * Datas do semestre: o planejamento vem do código, e o que se muda aqui vira um
 * ajuste em `calendario_ajustes` (ver `lib/ajustes-calendario.ts`). O site
 * inteiro passa a mostrar a data nova em instantes, sem deploy.
 */
export default async function PaginaCalendario({ searchParams }: Props) {
  const acesso = await exigirProfessor();
  if ("bloqueio" in acesso) return acesso.bloqueio;

  const slugs = slugsPublicados();
  const params = await searchParams;
  const slug = slugs.includes(params.disciplina ?? "") ? params.disciplina! : slugs[0];
  const planejado = conteudoDa(slug)!;
  const ajustes = await lerAjustesDireto(slug);
  const vigente = aplicarAjustes(planejado, ajustes);
  const orfaos = ajustesOrfaos(planejado, ajustes);
  const ajustado = (tipo: TipoAjuste, chave: string) =>
    ajustes.some((a) => a.tipo === tipo && a.chave === chave && !orfaos.includes(a));
  const ocultos = new Set(ajustes.filter((a) => a.tipo === "sem-aula" && a.valor === null).map((a) => a.chave));
  const acrescentados = vigente.semAula.filter((d) => !planejado.semAula.some((p) => p.data === d.data));

  return (
    <Moldura aba="calendario" email={acesso.email}>
      {slugs.length > 1 && (
        <nav aria-label="Disciplinas" className="mb-8 flex flex-wrap gap-1.5">
          {slugs.map((s) => (
            <Link
              key={s}
              href={`/professor/calendario?disciplina=${s}`}
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

      <p className="mb-10 max-w-3xl rounded-xl border border-alert/30 bg-alert-soft p-4 text-sm text-ink">
        Cada alteração vale para o site inteiro em instantes, sem publicar nada. Estender um prazo
        recalcula quem está atrasado: quem enviou entre o prazo antigo e o novo deixa de aparecer
        como atrasado.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl">Encontros e quizzes</h2>
        <p className="mt-1 text-sm text-ink-dim">
          Adiar uma aula move o prazo do quiz dela para a nova quinta-feira, a menos que o prazo do
          quiz tenha sido fixado aqui.
        </p>
        <ul className="mt-5 space-y-3">
          {vigente.encontros.map((e, i) => {
            const chave = String(e.numero);
            const anterior = vigente.encontros[i - 1];
            const seguinte = vigente.encontros[i + 1];
            const foraDeOrdem =
              (anterior && e.data <= anterior.data) || (seguinte && e.data >= seguinte.data);
            const temQuiz = vigente.quizzes.some((q) => q.encontro === e.numero);
            const origem = ajustado("prazo-quiz", chave)
              ? "ajustado"
              : planejado.regrasNota.portfolio.prazosEspeciais.some((p) => p.encontros.includes(e.numero))
                ? "prazo especial"
                : "regra: quinta seguinte";

            return (
              <li key={e.numero} className="rounded-xl border border-line bg-card p-4">
                <p className="font-medium text-ink">
                  {e.numero === 0 ? "Semana 0" : `Encontro ${e.numero}`} · {e.titulo}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="w-28 text-ink-dim">Aula</span>
                  <FormAjuste acao={salvarAjuste}>
                    <Chave disciplina={slug} tipo="encontro" chave={chave} />
                    <input type="date" name="data" defaultValue={e.data} required className={campo} />
                    <button type="submit" className={botao}>
                      Salvar
                    </button>
                  </FormAjuste>
                  {ajustado("encontro", chave) && (
                    <>
                      <Selo tom="primary">ajustado</Selo>
                      <span className="text-xs text-ink-faint">
                        planejado: {dataCurta(planejado.encontros[i].data)}
                      </span>
                      <VoltarAoPlanejado disciplina={slug} tipo="encontro" chave={chave} />
                    </>
                  )}
                  {foraDeOrdem && (
                    <span className="text-xs text-alert">fora de ordem em relação aos vizinhos</span>
                  )}
                </div>
                {temQuiz && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="w-28 text-ink-dim">Prazo do quiz</span>
                    <FormAjuste acao={salvarAjuste}>
                      <Chave disciplina={slug} tipo="prazo-quiz" chave={chave} />
                      <CamposPrazo prazo={prazoDoQuiz(vigente, e.numero)} />
                      <button type="submit" className={botao}>
                        Salvar
                      </button>
                    </FormAjuste>
                    <span className="text-xs text-ink-faint">{origem}</span>
                    {ajustado("prazo-quiz", chave) && (
                      <VoltarAoPlanejado disciplina={slug} tipo="prazo-quiz" chave={chave} />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl">Prazos de entrega</h2>
        <ul className="mt-5 space-y-3">
          {vigente.regrasNota.entregas.map((en, i) => {
            const chave = chaveDaEntrega(en);
            return (
              <li key={chave} className="rounded-xl border border-line bg-card p-4">
                <p className="font-medium text-ink">
                  {en.nome} · {en.etapa}ª etapa
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <FormAjuste acao={salvarAjuste}>
                    <Chave disciplina={slug} tipo="prazo-entrega" chave={chave} />
                    <CamposPrazo prazo={en.prazo} />
                    <button type="submit" className={botao}>
                      Salvar
                    </button>
                  </FormAjuste>
                  {ajustado("prazo-entrega", chave) && (
                    <>
                      <Selo tom="primary">ajustado</Selo>
                      <span className="text-xs text-ink-faint">
                        planejado: {momentoCampus(planejado.regrasNota.entregas[i].prazo)}
                      </span>
                      <VoltarAoPlanejado disciplina={slug} tipo="prazo-entrega" chave={chave} />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl">Dias sem aula</h2>
        <ul className="mt-5 space-y-2">
          {planejado.semAula.map((d) => (
            <li key={d.data} className="flex flex-wrap items-center gap-2 text-sm">
              <span className={cx("font-mono", ocultos.has(d.data) ? "text-ink-faint line-through" : "text-ink")}>
                {dataCurta(d.data)}
              </span>
              <span className={ocultos.has(d.data) ? "text-ink-faint" : "text-ink"}>{d.motivo}</span>
              {ocultos.has(d.data) ? (
                <>
                  <Selo>oculto</Selo>
                  <VoltarAoPlanejado disciplina={slug} tipo="sem-aula" chave={d.data} rotulo="Mostrar de novo" />
                </>
              ) : (
                <FormAjuste acao={salvarAjuste}>
                  <Chave disciplina={slug} tipo="sem-aula" chave={d.data} />
                  <input type="hidden" name="ocultar" value="1" />
                  <button type="submit" className={botao}>
                    Ocultar
                  </button>
                </FormAjuste>
              )}
            </li>
          ))}
          {acrescentados.map((d) => (
            <li key={d.data} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono text-ink">{dataCurta(d.data)}</span>
              <span className="text-ink">{d.motivo}</span>
              <Selo tom="primary">acrescentado</Selo>
              <VoltarAoPlanejado disciplina={slug} tipo="sem-aula" chave={d.data} rotulo="Apagar" />
            </li>
          ))}
        </ul>
        <FormAjuste acao={salvarAjuste} className="mt-5 flex flex-wrap items-center gap-2">
          <input type="hidden" name="disciplina" value={slug} />
          <input type="hidden" name="tipo" value="sem-aula" />
          <input type="date" name="chave" required className={campo} />
          <input
            name="motivo"
            required
            maxLength={120}
            placeholder="Motivo (ex.: recesso)"
            className={cx(campo, "w-64 font-sans")}
          />
          <button type="submit" className={botao}>
            Acrescentar dia
          </button>
        </FormAjuste>
      </section>

      {orfaos.length > 0 && (
        <section>
          <h2 className="text-2xl">Ajustes que não valem</h2>
          <p className="mt-1 text-sm text-ink-dim">
            Apontam para algo que não existe mais no planejamento, ou têm valor inválido. O site os
            ignora.
          </p>
          <ul className="mt-4 space-y-2">
            {orfaos.map((a) => (
              <li key={`${a.tipo}-${a.chave}`} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-ink-dim">
                  {a.tipo} · {a.chave} · {a.valor ?? "—"}
                </span>
                <VoltarAoPlanejado disciplina={slug} tipo={a.tipo} chave={a.chave} rotulo="Apagar" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Moldura>
  );
}

function Chave({ disciplina, tipo, chave }: { disciplina: string; tipo: TipoAjuste; chave: string }) {
  return (
    <>
      <input type="hidden" name="disciplina" value={disciplina} />
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="chave" value={chave} />
    </>
  );
}

function CamposPrazo({ prazo }: { prazo: string }) {
  const { data, hora } = camposDoPrazo(prazo);
  return (
    <>
      <input type="date" name="data" defaultValue={data} required className={campo} />
      <input type="time" name="hora" defaultValue={hora} required className={campo} />
    </>
  );
}

function VoltarAoPlanejado({
  disciplina,
  tipo,
  chave,
  rotulo = "Voltar ao planejado",
}: {
  disciplina: string;
  tipo: TipoAjuste;
  chave: string;
  rotulo?: string;
}) {
  return (
    <FormAjuste acao={removerAjuste}>
      <Chave disciplina={disciplina} tipo={tipo} chave={chave} />
      <button type="submit" className={botao}>
        {rotulo}
      </button>
    </FormAjuste>
  );
}
