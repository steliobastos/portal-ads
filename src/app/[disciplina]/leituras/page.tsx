import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemLeitura, LegendaFaixas } from "@/components/leitura";
import { Cartao, Selo, TituloSecao } from "@/components/ui";
import { conteudoDa } from "@/content";
import { dataCurta } from "@/lib/datas";

type Props = { params: Promise<{ disciplina: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { disciplina } = await params;
  const conteudo = conteudoDa(disciplina);
  return conteudo ? { title: `Mapa de leituras — ${conteudo.disciplina.nome}` } : {};
}

const LIVROS = [
  {
    sigla: "LAUREANO",
    referencia: "LAUREANO, M. A. P. Sistemas Operacionais. Curitiba: Livro Técnico, 160 p.",
    papel: "A ponte acessível — mais próxima do nível do tecnólogo. É a base da primeira leitura.",
  },
  {
    sigla: "TANENBAUM",
    referencia: "TANENBAUM, A. S.; BOS, H. Sistemas Operacionais Modernos. 4. ed. São Paulo: Pearson.",
    papel:
      "Bibliografia básica oficial e fonte de autoridade — entra em recortes curtos, para dar rigor conceitual ao que você já viu na prática.",
  },
];

export default async function PaginaLeituras({ params }: Props) {
  const { disciplina: slug } = await params;
  const conteudo = conteudoDa(slug);
  if (!conteudo) notFound();

  return (
    <div className="space-y-14">
      <TituloSecao
        sobretitulo={conteudo.disciplina.codigo}
        descricao="A lógica da disciplina é invertida: primeiro você vive a experiência no terminal, depois o livro dá nome e profundidade ao que você viu. Por isso a leitura de cada encontro é feita depois da aula, como fechamento — e prepara o encontro seguinte."
      >
        Mapa de leituras
      </TituloSecao>

      <section>
        <Cartao>
          <h2 className="text-lg">Como este mapa funciona</h2>
          <div className="mt-4">
            <LegendaFaixas />
          </div>
          <p className="mt-4 text-sm text-ink-dim">
            Carga semanal típica: <strong className="text-ink">10 a 15 páginas</strong> no total. O
            recorte do Tanenbaum nunca passa de ~8 páginas — é cirúrgico de propósito. Cada quiz de
            verificação alimenta o portfólio (N1 de cada etapa); nos relatórios e defesas, conecte a
            prática ao conceito citado, mencionando a seção lida, sem copiar o texto.
          </p>
        </Cartao>
      </section>

      <section>
        <TituloSecao sobretitulo="Bibliografia">Os dois livros e seus papéis</TituloSecao>
        <ul className="grid gap-4 sm:grid-cols-2">
          {LIVROS.map((l) => (
            <li key={l.sigla}>
              <Cartao className="h-full">
                <Selo tom="primary">{l.sigla}</Selo>
                <p className="mt-3 text-sm text-ink">{l.referencia}</p>
                <p className="mt-2 text-sm text-ink-dim">{l.papel}</p>
              </Cartao>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <TituloSecao sobretitulo="Encontro a encontro">Leituras</TituloSecao>

        <div className="space-y-8">
          {conteudo.encontros.map((e) => (
            <article key={e.numero} className="scroll-mt-24" id={`encontro-${e.numero}`}>
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
                <h3 className="text-lg">
                  <Link href={`/${slug}/encontros/${e.numero}`} className="hover:text-primary">
                    {e.numero === 0 ? "Semana 0" : `Encontro ${e.numero}`} · {e.titulo}
                  </Link>
                </h3>
                <span className="font-mono text-xs text-ink-faint">{dataCurta(e.data)}</span>
              </div>

              <ul className="space-y-3">
                {e.leituras.map((l) => (
                  <ItemLeitura key={l.fonte + l.titulo} leitura={l} />
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
