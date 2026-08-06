import Link from "next/link";
import { ArteCamadas, ArteTerminal, Icone } from "@/components/arte";
import { BotaoLink, Cartao, Selo, TituloSecao } from "@/components/ui";
import { DISCIPLINAS } from "@/content";
import { avisosRecentes } from "@/content/avisos";
import { CATEGORIAS, TOTAL_LINKS } from "@/content/links";
import { PORTAL } from "@/content/portal";
import { proximasAulas } from "@/lib/agenda";
import { dataExtensa, diaEMes } from "@/lib/datas";

/** Revalida de hora em hora: "próxima aula" não pode congelar no build. */
export const revalidate = 3600;

export default function Home() {
  const proximas = proximasAulas();
  const avisos = avisosRecentes(3);

  return (
    <main className="flex-1">
      {/* ── Capa ───────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">
            IFCE {PORTAL.campus} · ADS
          </p>

          <h1 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">
            Tudo o que você precisa para acompanhar as aulas,{" "}
            <span className="text-primary">num endereço só</span>.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-ink-dim">{PORTAL.chamada}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <BotaoLink href="/disciplinas">Ver as disciplinas</BotaoLink>
            <BotaoLink href="/links" variante="secundario">
              Links úteis
            </BotaoLink>
          </div>
        </div>

        <ArteTerminal className="w-full max-w-lg justify-self-center" />
      </section>

      {/* ── Próxima aula ───────────────────────────────────────────────── */}
      {proximas.length > 0 && (
        <section className="border-y border-line bg-panel">
          <div className="mx-auto max-w-6xl px-5 py-8">
            <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">
              O que vem agora
            </p>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {proximas.map(({ disciplina, encontro }) => (
                <li key={disciplina.slug}>
                  <Link
                    href={`/${disciplina.slug}/encontros/${encontro.numero}`}
                    className="group flex items-start gap-4 rounded-xl border border-line bg-card p-4 transition-colors hover:border-primary-dim"
                  >
                    <span className="flex shrink-0 flex-col items-center rounded-lg bg-primary-soft px-3 py-2 font-mono">
                      <span className="text-xl leading-tight text-primary">
                        {diaEMes(encontro.data).dia}
                      </span>
                      <span className="text-[11px] tracking-wide text-primary/75 uppercase">
                        {diaEMes(encontro.data).mes}
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span className="font-mono text-xs text-ink-faint">
                        {disciplina.codigo} ·{" "}
                        {encontro.numero === 0 ? "Semana 0" : `Encontro ${encontro.numero}`}
                      </span>
                      <span className="block font-medium text-ink group-hover:text-primary">
                        {encontro.titulo}
                      </span>
                      {encontro.marco && (
                        <span className="mt-1.5 inline-block">
                          <Selo tom="alert">
                            {encontro.marco.nota} · {encontro.marco.etapa}ª etapa
                          </Selo>
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Disciplinas ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <TituloSecao
          sobretitulo="Disciplinas"
          descricao="Cada disciplina traz o cronograma completo, o material de todos os encontros e os critérios de avaliação — publicados antes de você precisar deles."
        >
          O que está no ar
        </TituloSecao>

        <ul className="grid gap-5 sm:grid-cols-2">
          {DISCIPLINAS.map((d) => (
            <li key={d.slug}>
              {d.ativa ? (
                <Cartao className="flex h-full flex-col" destaque>
                  <div className="flex flex-wrap items-center gap-2">
                    <Selo tom="primary">{d.codigo}</Selo>
                    <Selo>{d.periodo}</Selo>
                  </div>
                  <h3 className="mt-3 font-display text-2xl">
                    <Link href={`/${d.slug}`} className="hover:text-primary">
                      {d.nome}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-ink-dim">{d.ementaResumo}</p>
                  <p className="mt-3 font-mono text-xs text-ink-faint">{d.encontrosInfo}</p>
                  <div className="mt-5">
                    <BotaoLink href={`/${d.slug}`}>Entrar</BotaoLink>
                  </div>
                </Cartao>
              ) : (
                <Cartao className="flex h-full flex-col opacity-70">
                  <Selo>Em breve</Selo>
                  <h3 className="mt-3 font-display text-2xl text-ink-dim">{d.nome}</h3>
                  <p className="mt-2 flex-1 text-sm text-ink-faint">{d.ementaResumo}</p>
                </Cartao>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── O que você aprende ─────────────────────────────────────────── */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">
              Como as aulas funcionam
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              Primeiro o terminal, depois o livro
            </h2>
            <p className="mt-4 max-w-xl text-ink-dim">
              A ordem é invertida de propósito. Você vive a experiência na máquina — vê o processo
              nascer, a memória encher, o container morrer por falta de RAM — e só então o livro
              entra para dar nome e profundidade ao que você já viu.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { titulo: "10–15 min", texto: "de abertura, para amarrar o essencial do dia" },
                { titulo: "O resto", texto: "é mão na massa, com o professor circulando" },
                { titulo: "Sem prova", texto: "a nota vem de um projeto em duas etapas" },
              ].map((item) => (
                <li key={item.titulo} className="rounded-xl border border-line bg-card p-4">
                  <p className="font-display text-lg text-primary">{item.titulo}</p>
                  <p className="mt-1 text-sm text-ink-dim">{item.texto}</p>
                </li>
              ))}
            </ul>
          </div>

          <ArteCamadas className="w-full max-w-sm justify-self-center" />
        </div>
      </section>

      {/* ── Avisos ─────────────────────────────────────────────────────── */}
      {avisos.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <TituloSecao sobretitulo="Avisos" descricao="O que mudou por aqui.">
            Últimas atualizações
          </TituloSecao>

          <ul className="space-y-3">
            {avisos.map((aviso) => (
              <li key={aviso.data + aviso.titulo}>
                <Cartao className="sm:flex sm:items-start sm:gap-6">
                  <div className="flex shrink-0 items-center gap-2 sm:w-52 sm:flex-col sm:items-start">
                    <Selo tom={aviso.fixado ? "primary" : "neutro"}>{aviso.etiqueta}</Selo>
                    <time
                      dateTime={aviso.data}
                      className="font-mono text-xs text-ink-faint sm:mt-1"
                    >
                      {dataExtensa(aviso.data)}
                    </time>
                  </div>

                  <div className="mt-3 min-w-0 sm:mt-0">
                    <h3 className="font-display text-lg">{aviso.titulo}</h3>
                    <p className="mt-1 text-sm text-ink-dim">{aviso.texto}</p>
                    {aviso.href && (
                      <Link
                        href={aviso.href}
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                      >
                        Abrir →
                      </Link>
                    )}
                  </div>
                </Cartao>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <BotaoLink href="/avisos" variante="secundario">
              Ver todos os avisos
            </BotaoLink>
          </div>
        </section>
      )}

      {/* ── Links úteis ────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <TituloSecao
            sobretitulo="Links úteis"
            descricao={`${TOTAL_LINKS} referências gratuitas e estáveis, escolhidas por serem consultáveis no dia a dia — documentação oficial e ferramenta interativa, não tutorial que envelhece.`}
          >
            Para consultar o curso inteiro
          </TituloSecao>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIAS.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/links#${cat.id}`}
                  className="group flex h-full flex-col rounded-xl border border-line bg-card p-5 transition-colors hover:border-primary-dim"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icone nome={cat.icone} className="size-5" />
                  </span>
                  <span className="mt-3 font-medium text-ink group-hover:text-primary">
                    {cat.titulo}
                  </span>
                  <span className="mt-1 flex-1 text-sm text-ink-dim">{cat.descricao}</span>
                  <span className="mt-3 font-mono text-xs text-ink-faint">
                    {cat.links.length} {cat.links.length === 1 ? "link" : "links"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
