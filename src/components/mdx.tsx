import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import * as Aula from "./aula";
import { Checklist, Item, Rascunho } from "./aula-interativo";

/**
 * O que o MDX enxerga.
 *
 * Duas metades: os componentes do roteiro (`<Passo>`, `<Comando>`, …) e os
 * elementos que o Markdown gera sozinho. A segunda metade não é opcional — o
 * reset do Tailwind zera margem, peso e marcador de lista, então sem estes
 * mapeamentos um parágrafo de Markdown sairia colado no seguinte.
 */

function Paragrafo(props: ComponentPropsWithoutRef<"p">) {
  return <p className="my-4 max-w-3xl text-ink-dim" {...props} />;
}

function Codigo(props: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[0.9em] text-primary"
      {...props}
    />
  );
}

function Ancora({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  const externo = href.startsWith("http");
  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2"
        {...props}
      />
    );
  }
  return <Link href={href} className="text-primary underline underline-offset-2" {...props} />;
}

export const COMPONENTES = {
  ...Aula,
  Rascunho,
  Checklist,
  Item,

  p: Paragrafo,
  code: Codigo,
  a: Ancora,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-ink" {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => <em className="italic" {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-4 max-w-3xl list-disc space-y-1.5 pl-5 text-ink-dim" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-4 max-w-3xl list-decimal space-y-1.5 pl-5 text-ink-dim" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => <h2 className="mt-10 mb-3 text-2xl" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className="mt-8 mb-2 text-lg" {...props} />,
  hr: () => <hr className="my-10 border-line" />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border border-line bg-panel p-2.5 text-left font-mono text-[11px] tracking-wide text-ink-dim uppercase"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border border-line p-2.5 align-top text-ink-dim" {...props} />
  ),
};
