import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaMateriais, materiaisDo } from "@/components/material";
import { BotaoLink, Cartao, Selo, TituloSecao } from "@/components/ui";
import { conteudoDa } from "@/content";
import { dataExtensa, paraData } from "@/lib/datas";

/** Revalida de hora em hora para que "próximo encontro" não congele no build. */
export const revalidate = 3600;

type Props = { params: Promise<{ disciplina: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina } = await params;
  const conteudo = conteudoDa(disciplina);
  if (!conteudo) return {};
  return {
    title: conteudo.disciplina.nome,
    description: conteudo.disciplina.ementaResumo,
  };
}

export default async function PaginaDisciplina({ params }: Props) {
  const { disciplina: slug } = await params;
  const conteudo = conteudoDa(slug);
  if (!conteudo) notFound();

  const { disciplina, encontros, unidades, avaliacoes, regras } = conteudo;

  const hoje = new Date();
  const referencia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const proximo = encontros.find((e) => paraData(e.data) >= referencia) ?? null;
  const concluidos = encontros.filter((e) => paraData(e.data) < referencia).length;

  return (
    <div className="space-y-16">
      {/* Capa */}
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <Selo tom="primary">{disciplina.codigo}</Selo>
          <Selo>{disciplina.periodo}</Selo>
          <Selo>{disciplina.encontrosInfo}</Selo>
        </div>

        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{disciplina.nome}</h1>

        <p className="mt-4 max-w-3xl text-lg text-ink-dim">{disciplina.ementaResumo}</p>

        <dl className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-ink-faint">Curso</dt>
            <dd className="text-ink">{disciplina.curso}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-faint">Campus</dt>
            <dd className="text-ink">{disciplina.campus}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-faint">Professor</dt>
            <dd className="text-ink">{disciplina.professor}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-faint">Carga horária</dt>
            <dd className="text-ink">{disciplina.cargaHoraria}</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          <BotaoLink href={`/${slug}/encontros`}>Ver os encontros</BotaoLink>
          <BotaoLink href={`/${slug}/leituras`} variante="secundario">
            Mapa de leituras
          </BotaoLink>
        </div>
      </section>

      {/* Próximo encontro */}
      {proximo && (
        <section>
          <TituloSecao sobretitulo="Comece por aqui" descricao="O material fica disponível antes da aula — chegue tendo dado ao menos uma olhada.">
            Próximo encontro
          </TituloSecao>

          <Cartao destaque>
            <div className="flex flex-wrap items-center gap-2">
              <Selo tom="primary">
                {proximo.numero === 0 ? "Semana 0" : `Encontro ${proximo.numero}`}
              </Selo>
              <Selo>{dataExtensa(proximo.data)}</Selo>
              {proximo.marco && (
                <Selo tom="alert">
                  {proximo.marco.nota} · {proximo.marco.etapa}ª etapa
                </Selo>
              )}
            </div>

            <h3 className="mt-3 text-2xl">
              <Link href={`/${slug}/encontros/${proximo.numero}`} className="hover:text-primary">
                {proximo.titulo}
              </Link>
            </h3>

            <p className="mt-2 max-w-3xl text-ink-dim">{proximo.resumo}</p>

            <div className="mt-5">
              <ListaMateriais arquivos={materiaisDo(slug, proximo.pasta)} />
            </div>
          </Cartao>

          <p className="mt-3 text-sm text-ink-faint">
            {concluidos} de {encontros.length} encontros já aconteceram.
          </p>
        </section>
      )}

      {/* Eixo do curso */}
      {disciplina.eixo && (
        <section>
          <TituloSecao sobretitulo="O que amarra o semestre">Eixo do curso</TituloSecao>
          <Cartao className="border-secondary-dim bg-secondary-soft">
            <p className="text-lg text-ink">{disciplina.eixo}</p>
            <p className="mt-2 text-ink-dim">
              Por isso o Docker reaparece quase toda semana, sempre com uma pergunta diferente: como
              o container vê um processo, quanta memória ele pode usar, para onde vai o dado que ele
              grava. Ao fim do curso, o mesmo container vira o alvo do seu toolkit de automação.
            </p>
          </Cartao>
        </section>
      )}

      {/* Unidades */}
      <section>
        <TituloSecao
          sobretitulo="Ementa"
          descricao="A ementa é coberta por inteiro. O que muda é a profundidade: cada unidade foi calibrada para o perfil de quem desenvolve e opera software, não para quem projeta sistemas operacionais."
        >
          Unidades
        </TituloSecao>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {unidades.map((u) => (
            <li key={u.id}>
              <Cartao className="h-full">
                <Selo tom="primary">Unidade {u.id}</Selo>
                <h3 className="mt-3 text-lg">{u.titulo}</h3>
                <p className="mt-2 text-sm text-ink-dim">{u.calibragem}</p>
              </Cartao>
            </li>
          ))}
        </ul>
      </section>

      {/* Avaliação resumida */}
      <section>
        <TituloSecao
          sobretitulo="Como você é avaliado"
          descricao="Não há prova tradicional: a nota vem de um projeto integrador em duas etapas, com dois momentos de avaliação cada."
        >
          Quatro momentos
        </TituloSecao>

        <ul className="grid gap-4 sm:grid-cols-2">
          {avaliacoes.map((a) => (
            <li key={`${a.etapa}-${a.nota}`}>
              <Cartao className="h-full">
                <div className="flex flex-wrap items-center gap-2">
                  <Selo tom={a.nota === "N2" ? "alert" : "primary"}>
                    {a.nota} · {a.etapa}ª etapa
                  </Selo>
                  <Selo>{dataExtensa(a.data)}</Selo>
                </div>
                <p className="mt-3 text-ink">{a.instrumento}</p>
                <Link
                  href={`/${slug}/encontros/${a.encontro}`}
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  Encontro {a.encontro} →
                </Link>
              </Cartao>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <BotaoLink href={`/${slug}/avaliacao`} variante="secundario">
            Detalhes e critérios
          </BotaoLink>
        </div>
      </section>

      {/* Regras */}
      <section>
        <TituloSecao sobretitulo="Contrato pedagógico">O combinado</TituloSecao>
        <ul className="grid gap-4 sm:grid-cols-2">
          {regras.map((r) => (
            <li key={r.titulo}>
              <Cartao className="h-full">
                <h3 className="text-lg">{r.titulo}</h3>
                <p className="mt-1.5 text-sm text-ink-dim">{r.texto}</p>
              </Cartao>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
