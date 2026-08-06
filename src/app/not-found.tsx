import { Cabecalho } from "@/components/navegacao";
import { BotaoLink } from "@/components/ui";
import { DISCIPLINAS_ATIVAS } from "@/content";

export default function NaoEncontrado() {
  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho
        itens={DISCIPLINAS_ATIVAS.map((d) => ({ href: `/${d.slug}`, rotulo: d.nome }))}
      />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16">
        <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Erro 404</p>
        <h1 className="mt-3 text-4xl">Página não encontrada</h1>
        <p className="mt-4 text-ink-dim">
          O endereço não existe ou o material ainda não foi publicado. Volte ao portal e navegue
          pelos encontros.
        </p>
        <div className="mt-8">
          <BotaoLink href="/">Voltar ao portal</BotaoLink>
        </div>
      </main>
    </div>
  );
}
