import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { COMPONENTES } from "./mdx";

/**
 * Markdown lido em tempo de execução — o material do professor, que vem do
 * bucket privado e não passa pelo build.
 *
 * Não é MDX de propósito: aqui não há componentes nem expressões, só Markdown
 * comum. Reaproveita o mapeamento de elementos do MDX para as duas coisas
 * terem a mesma tipografia.
 */
const { p, code, a, strong, em, ul, ol, h2, h3, hr, table, th, td } = COMPONENTES;

const ELEMENTOS = {
  p,
  code,
  a,
  strong,
  em,
  ul,
  ol,
  h2,
  h3,
  hr,
  table,
  th,
  td,
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="mb-6 text-3xl leading-tight sm:text-4xl" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mt-6 mb-2 font-semibold text-ink" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-6 max-w-3xl rounded-xl border border-primary-dim bg-primary-soft px-5 py-1 [&_p]:text-ink"
      {...props}
    />
  ),
  // Bloco de código: a sub-paleta escura do terminal, e o `code` de dentro sem
  // o fundo claro que o código em linha usa.
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-5 max-w-3xl overflow-x-auto rounded-lg border border-term-line bg-term p-4 font-mono text-[13px] leading-relaxed text-term-dim [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="[&>p]:my-1" {...props} />,
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={ELEMENTOS}>
      {children}
    </ReactMarkdown>
  );
}
