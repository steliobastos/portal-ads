import type { Metadata } from "next";
import { Selo } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { momentoCampus } from "@/lib/datas";
import { entregasDaFase } from "@/lib/painel-quiz";
import { Moldura, exigirProfessor } from "../moldura";

export const metadata: Metadata = {
  title: "Relatórios · Área do professor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PaginaRelatorios() {
  const acesso = await exigirProfessor();
  if ("bloqueio" in acesso) return acesso.bloqueio;

  const slug = slugsPublicados()[0];
  const conteudo = conteudoDa(slug)!;
  const entregas = await Promise.all(
    conteudo.regrasNota.entregas.map(async (config) => ({
      config,
      equipes: await entregasDaFase(conteudo, config.etapa, config.fase),
    })),
  );

  return (
    <Moldura aba="relatorios" email={acesso.email}>
      <div className="space-y-12">
        {entregas.map(({ config, equipes }) => (
          <section key={`${config.etapa}-${config.fase}`}>
            <header className="mb-4">
              <h2 className="text-2xl">
                {config.nome} <span className="text-ink-faint">· {config.etapa}ª etapa</span>
              </h2>
              <p className="mt-1 text-sm text-ink-dim">
                {config.secoes} · prazo {momentoCampus(config.prazo, true)} · {equipes.length}{" "}
                {equipes.length === 1 ? "equipe entregou" : "equipes entregaram"}
              </p>
            </header>

            {equipes.length === 0 ? (
              <p className="text-sm text-ink-faint">Nenhuma entrega ainda.</p>
            ) : (
              <ul className="space-y-3">
                {equipes.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-card p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{e.equipe}</p>
                      <p className="mt-0.5 text-sm text-ink-dim">
                        {e.integrantes.map((i) => `${i.nome} (${i.matricula})`).join(" · ")}
                      </p>
                    </div>
                    {e.atrasado && <Selo tom="alert">atrasado</Selo>}
                    {e.envios > 1 && <Selo>{e.envios} envios</Selo>}
                    <span className="font-mono text-xs text-ink-faint">
                      {momentoCampus(e.enviadoEm)} · {(e.tamanhoBytes / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <a
                      href={`/professor/relatorios/${e.id}`}
                      className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-ink hover:border-primary-dim hover:text-primary"
                    >
                      Baixar PDF
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-ink-faint">
        Aparece a entrega mais recente de cada equipe, identificada pelas matrículas. Se a formação
        mudou entre envios, a equipe aparece duas vezes.
      </p>
    </Moldura>
  );
}
