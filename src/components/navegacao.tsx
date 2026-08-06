"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

export type ItemNav = { href: string; rotulo: string };

/**
 * Barra de navegação do portal — a mesma em todas as páginas.
 *
 * Vive no layout raiz e no layout da disciplina, então nenhuma página do portal
 * fica sem caminho de volta. Os itens vêm por prop: na capa são as disciplinas,
 * dentro de uma disciplina são as seções dela. O componente não sabe (nem
 * precisa saber) qual é qual.
 *
 * É client component por um motivo só: marcar a seção atual depende do
 * `usePathname`.
 */
export function Cabecalho({ itens }: { itens: ItemNav[] }) {
  const caminho = usePathname();

  /** Marca a seção atual. O item mais específico vence — sem isso, "Visão geral"
   *  (o prefixo de todas as outras) ficaria aceso o tempo todo. */
  const atual = itens.reduce<string | null>((melhor, item) => {
    const casa = caminho === item.href || caminho.startsWith(`${item.href}/`);
    if (!casa) return melhor;
    return melhor && melhor.length >= item.href.length ? melhor : item.href;
  }, null);

  return (
    <header className="sticky top-0 z-30 bg-nav">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        {/* `focus-visible:outline-white` em toda a barra: o foco padrão é teal,
            que sobre o fundo escuro fica invisível. */}
        <Link
          href="/"
          className="rounded-lg font-mono text-[12.5px] tracking-wide text-white/70 transition-colors hover:text-white focus-visible:outline-white"
        >
          <b className="text-white">IFCE</b> · Portal de Disciplinas
        </Link>

        {itens.length > 0 && (
          <nav aria-label="Navegação do portal" className="ml-auto">
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
              {itens.map((item) => {
                const ativo = item.href === atual;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={ativo ? "page" : undefined}
                      className={cx(
                        "block rounded-lg px-2.5 py-1.5 transition-colors focus-visible:outline-white",
                        ativo
                          ? "bg-white/15 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.rotulo}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
