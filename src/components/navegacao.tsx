"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_GLOBAL, type ItemMenu } from "@/content/portal";
import { cx } from "./ui";

const HREFS_GLOBAIS = new Set(MENU_GLOBAL.map((i) => i.href));

/**
 * A seção do menu global correspondente ao caminho atual.
 *
 * Duas regras que não são óbvias:
 * - "Home" só acende na raiz. Sem isso, `startsWith("/")` acenderia sempre.
 * - Páginas de disciplina (`/so`, `/so/encontros/5`) acendem "Disciplinas", que
 *   é onde o aluno entrou. Como o cabeçalho vive no layout raiz, ele não recebe
 *   o slug de ninguém: deduz pela primeira parte do caminho não ser uma rota
 *   global.
 */
function ehAtivo(href: string, caminho: string): boolean {
  if (href === "/") return caminho === "/";
  if (caminho === href || caminho.startsWith(`${href}/`)) return true;

  if (href === "/disciplinas") {
    const raiz = `/${caminho.split("/")[1]}`;
    return raiz !== "/" && !HREFS_GLOBAIS.has(raiz);
  }

  return false;
}

/**
 * Barra global do portal — presente em todas as páginas, vinda do layout raiz.
 *
 * Escura de propósito: separa o portal (navegação) do conteúdo (fundo creme) e
 * dá ao aluno um ponto de referência que não muda de página para página.
 */
export function Cabecalho() {
  const caminho = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-nav">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        {/* `focus-visible:outline-white` em toda a barra: o foco padrão é teal,
            que sobre o fundo escuro fica invisível. */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-white"
        >
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-md bg-white/12 font-mono text-[13px] leading-none text-term-prompt"
          >
            {">_"}
          </span>
          <span className="font-mono text-[12.5px] tracking-wide text-white/70">
            <b className="text-white">IFCE</b> Horizonte · Portal
          </span>
        </Link>

        <nav aria-label="Navegação do portal" className="ml-auto">
          <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
            {MENU_GLOBAL.map((item) => {
              const ativo = ehAtivo(item.href, caminho);
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
      </div>
    </header>
  );
}

/**
 * Segunda linha de navegação, só dentro de uma disciplina.
 *
 * Fica clara para não competir com a barra global — a hierarquia visual é a
 * própria hierarquia da informação: portal acima, disciplina abaixo.
 */
export function SubBarra({ titulo, itens }: { titulo: string; itens: ItemMenu[] }) {
  const caminho = usePathname();

  // O item mais específico vence: sem isso, "Visão geral" (`/so`, prefixo de
  // todas as outras seções) ficaria aceso o tempo todo.
  const atual = itens.reduce<string | null>((melhor, item) => {
    const casa = caminho === item.href || caminho.startsWith(`${item.href}/`);
    if (!casa) return melhor;
    return melhor && melhor.length >= item.href.length ? melhor : item.href;
  }, null);

  return (
    <div className="sticky top-[52px] z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-5 py-2">
        <span className="font-mono text-[12px] tracking-wide text-ink-faint">{titulo}</span>

        <nav aria-label="Seções da disciplina" className="ml-auto">
          <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
            {itens.map((item) => {
              const ativo = item.href === atual;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo ? "page" : undefined}
                    className={cx(
                      "block rounded-lg px-2.5 py-1 transition-colors",
                      ativo
                        ? "bg-primary-soft font-medium text-primary"
                        : "text-ink-dim hover:bg-primary-soft hover:text-primary",
                    )}
                  >
                    {item.rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
