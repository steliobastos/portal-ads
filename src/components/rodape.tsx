import Link from "next/link";
import { MENU_GLOBAL, PORTAL } from "@/content/portal";
import { DISCIPLINAS_ATIVAS } from "@/content";

/** Rodapé do portal — no layout raiz, portanto igual em todas as páginas. */
export function Rodape() {
  return (
    <footer className="mt-auto border-t border-line bg-panel">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3">
        <div>
          <p className="font-medium text-ink">{PORTAL.nome}</p>
          <p className="mt-1 text-sm text-ink-dim">
            {PORTAL.instituicao} — {PORTAL.campus}
          </p>
          <p className="mt-1 text-sm text-ink-dim">Prof. {PORTAL.professor}</p>

          <a
            href={PORTAL.repositorio}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-mono text-xs text-ink-faint hover:text-primary"
          >
            código-fonte no GitHub ↗
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
          <Link
            href="/professor"
            className="mt-1 block font-mono text-xs text-ink-faint hover:text-primary"
          >
            área do professor
          </Link>
        </div>

        <nav aria-label="Seções do portal">
          <p className="font-mono text-xs tracking-[0.12em] text-ink-faint uppercase">Portal</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {MENU_GLOBAL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-dim hover:text-primary">
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Disciplinas">
          <p className="font-mono text-xs tracking-[0.12em] text-ink-faint uppercase">
            Disciplinas
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {DISCIPLINAS_ATIVAS.map((d) => (
              <li key={d.slug}>
                <Link href={`/${d.slug}`} className="text-ink-dim hover:text-primary">
                  {d.nome}{" "}
                  <span className="font-mono text-xs text-ink-faint">({d.codigo})</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
