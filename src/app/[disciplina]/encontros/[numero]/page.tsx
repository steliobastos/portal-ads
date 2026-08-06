import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemLeitura, LegendaFaixas } from "@/components/leitura";
import { ListaMateriais, materiaisDo } from "@/components/material";
import { Cartao, Selo, TituloSecao } from "@/components/ui";
import { conteudoDa, slugsPublicados } from "@/content";
import { dataExtensa } from "@/lib/datas";
import { temRoteiro } from "@/lib/roteiros";

type Props = { params: Promise<{ disciplina: string; numero: string }> };

export function generateStaticParams() {
  return slugsPublicados().flatMap((disciplina) =>
    (conteudoDa(disciplina)?.encontros ?? []).map((e) => ({
      disciplina,
      numero: String(e.numero),
    })),
  );
}

function buscar(slug: string, numero: string) {
  const conteudo = conteudoDa(slug);
  if (!conteudo) return null;
  const encontro = conteudo.encontros.find((e) => String(e.numero) === numero);
  return encontro ? { conteudo, encontro } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina, numero } = await params;
  const achado = buscar(disciplina, numero);
  if (!achado) return {};
  const rotulo = achado.encontro.numero === 0 ? "Semana 0" : `Encontro ${achado.encontro.numero}`;
  return {
    title: `${rotulo} · ${achado.encontro.titulo}`,
    description: achado.encontro.resumo,
  };
}

export default async function PaginaEncontro({ params }: Props) {
  const { disciplina: slug, numero } = await params;
  const achado = buscar(slug, numero);
  if (!achado) notFound();

  const { conteudo, encontro } = achado;

  // Migração gradual: existindo o roteiro em MDX, ele substitui o HTML avulso
  // na lista — os dois nunca aparecem juntos, para o aluno não escolher entre
  // duas versões do mesmo material. Vale para "roteiro" e para "guia", que são
  // o mesmo papel com nomes diferentes (as semanas de projeto e os dias de
  // avaliação nunca tiveram roteiro de laboratório).
  const roteiroNativo = await temRoteiro(slug, encontro.numero);
  const materiais = materiaisDo(slug, encontro.pasta).filter(
    (m) => !(roteiroNativo && (m.tipo === "roteiro" || m.tipo === "guia")),
  );
  const rotulo = encontro.numero === 0 ? "Semana 0" : `Encontro ${encontro.numero}`;

  const indice = conteudo.encontros.findIndex((e) => e.numero === encontro.numero);
  const anterior = conteudo.encontros[indice - 1];
  const proximo = conteudo.encontros[indice + 1];

  const obrigatorias = encontro.leituras.filter(
    (l) => l.faixa === "base" || l.faixa === "recorte",
  );
  const opcionais = encontro.leituras.filter(
    (l) => l.faixa === "aprofundamento" || l.faixa === "fora-do-escopo",
  );

  return (
    <div className="space-y-14">
      <nav aria-label="Trilha" className="font-mono text-xs text-ink-faint">
        <Link href={`/${slug}`} className="hover:text-primary">
          {conteudo.disciplina.codigo}
        </Link>
        {" / "}
        <Link href={`/${slug}/encontros`} className="hover:text-primary">
          encontros
        </Link>
        {" / "}
        <span className="text-ink-dim">{rotulo.toLowerCase()}</span>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Selo tom="primary">{rotulo}</Selo>
          <Selo>{dataExtensa(encontro.data)}</Selo>
          {/* Na Semana 0, unidade e rótulo são a mesma coisa — não repetir. */}
          {encontro.unidade !== rotulo && <Selo>{encontro.unidade}</Selo>}
          {encontro.marco && (
            <Selo tom="alert">
              {encontro.marco.nota} · {encontro.marco.etapa}ª etapa
            </Selo>
          )}
        </div>

        <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">{encontro.titulo}</h1>
        <p className="mt-4 max-w-3xl text-lg text-ink-dim">{encontro.resumo}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {encontro.topicos.map((t) => (
            <li key={t}>
              <span className="rounded-md border border-line bg-panel px-2.5 py-1 font-mono text-xs text-ink-dim">
                {t}
              </span>
            </li>
          ))}
        </ul>
      </header>

      {encontro.marco && (
        <Cartao className="border-alert/30 bg-alert-soft">
          <Selo tom="alert">
            Avaliação · {encontro.marco.nota} da {encontro.marco.etapa}ª etapa
          </Selo>
          <p className="mt-3 text-ink">{encontro.marco.instrumento}</p>
          <Link
            href={`/${slug}/avaliacao`}
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            Ver critérios de avaliação →
          </Link>
        </Cartao>
      )}

      <section>
        <TituloSecao sobretitulo="Material do encontro">Para estudar</TituloSecao>

        {roteiroNativo && (
          <Link
            href={`/${slug}/encontros/${encontro.numero}/roteiro`}
            className="group mb-3 flex items-start gap-3 rounded-xl border border-primary-dim bg-card p-4 transition-colors hover:border-primary"
          >
            <span
              aria-hidden
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-mono text-white"
            >
              ⌘
            </span>
            <span className="min-w-0">
              <span className="block font-medium text-ink group-hover:text-primary">
                Roteiro de laboratório
              </span>
              <span className="mt-0.5 block text-sm text-ink-dim">
                Os comandos passo a passo, com dicas para quando travar — e campos que guardam suas
                observações enquanto você trabalha.
              </span>
            </span>
          </Link>
        )}

        <ListaMateriais arquivos={materiais} />
      </section>

      {encontro.docker && (
        <section>
          <TituloSecao sobretitulo="Eixo do curso">O Docker desta semana</TituloSecao>
          <Cartao className="border-secondary-dim bg-secondary-soft">
            <p className="text-ink">{encontro.docker}</p>
          </Cartao>
        </section>
      )}

      <section>
        <TituloSecao
          sobretitulo="Depois da aula"
          descricao="A ordem aqui é invertida de propósito: primeiro você vive a experiência no terminal, depois o livro dá nome e profundidade ao que você viu."
        >
          Para ler
        </TituloSecao>

        {obrigatorias.length > 0 && (
          <>
            <h3 className="mb-3 text-sm font-medium tracking-wide text-ink-dim uppercase">
              Obrigatórias
            </h3>
            <ul className="mb-8 space-y-3">
              {obrigatorias.map((l) => (
                <ItemLeitura key={l.fonte + l.titulo} leitura={l} />
              ))}
            </ul>
          </>
        )}

        {opcionais.length > 0 && (
          <>
            <h3 className="mb-3 text-sm font-medium tracking-wide text-ink-dim uppercase">
              Aprofundamento
            </h3>
            <ul className="space-y-3">
              {opcionais.map((l) => (
                <ItemLeitura key={l.fonte + l.titulo} leitura={l} />
              ))}
            </ul>
          </>
        )}

        <div className="mt-8 rounded-xl border border-line bg-panel p-5">
          <LegendaFaixas />
        </div>
      </section>

      <nav aria-label="Navegação entre encontros" className="flex flex-wrap gap-4 border-t border-line pt-6">
        {anterior && (
          <Link href={`/${slug}/encontros/${anterior.numero}`} className="group max-w-xs">
            <span className="font-mono text-xs text-ink-faint">← anterior</span>
            <span className="block text-ink group-hover:text-primary">{anterior.titulo}</span>
          </Link>
        )}
        {proximo && (
          <Link
            href={`/${slug}/encontros/${proximo.numero}`}
            className="group ml-auto max-w-xs text-right"
          >
            <span className="font-mono text-xs text-ink-faint">próximo →</span>
            <span className="block text-ink group-hover:text-primary">{proximo.titulo}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
