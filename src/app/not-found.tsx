import { BotaoLink } from "@/components/ui";

export default function NaoEncontrado() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-16">
      <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Erro 404</p>
      <h1 className="mt-3 text-4xl">Página não encontrada</h1>
      <p className="mt-4 text-ink-dim">
        O endereço não existe ou o material ainda não foi publicado. Volte ao portal e navegue pelos
        encontros.
      </p>
      <div className="mt-8">
        <BotaoLink href="/">Voltar ao portal</BotaoLink>
      </div>
    </main>
  );
}
