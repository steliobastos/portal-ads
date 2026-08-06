import type { FaixaLeitura, Leitura } from "@/content/tipos";
import { Selo, cx } from "./ui";

export const FAIXAS: Record<
  FaixaLeitura,
  { emoji: string; rotulo: string; descricao: string; classe: string }
> = {
  base: {
    emoji: "🟢",
    rotulo: "Base",
    descricao: "Leitura obrigatória — a ponte acessível (Laureano)",
    classe: "border-secondary-dim bg-secondary-soft",
  },
  recorte: {
    emoji: "🔵",
    rotulo: "Recorte",
    descricao: "Leitura obrigatória curta — o rigor conceitual (Tanenbaum), no máximo ~8 páginas",
    classe: "border-primary-dim bg-primary-soft",
  },
  aprofundamento: {
    emoji: "⚪",
    rotulo: "Aprofundamento",
    descricao: "Opcional, para quem quer ir além — não é cobrado, mas é valorizado na defesa",
    classe: "border-line bg-panel",
  },
  "fora-do-escopo": {
    emoji: "✋",
    rotulo: "Fora do escopo",
    descricao: "Decisão de calibragem da disciplina — não será cobrado",
    classe: "border-alert/30 bg-alert-soft",
  },
};

export function ItemLeitura({ leitura }: { leitura: Leitura }) {
  const faixa = FAIXAS[leitura.faixa];

  return (
    <li className={cx("rounded-xl border p-4", faixa.classe)}>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span aria-hidden className="text-sm">
          {faixa.emoji}
        </span>
        <span className="font-mono text-[11px] tracking-wide text-ink-dim uppercase">
          {faixa.rotulo}
        </span>
        <span className="font-mono text-[12px] text-ink">{leitura.fonte}</span>
        {leitura.paginas && (
          <span className="font-mono text-[12px] text-ink-faint">p. {leitura.paginas}</span>
        )}
      </div>
      <p className="mt-1 font-medium text-ink">{leitura.titulo}</p>
      {leitura.nota && <p className="mt-1 text-sm text-ink-dim">{leitura.nota}</p>}
    </li>
  );
}

export function LegendaFaixas() {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {(Object.keys(FAIXAS) as FaixaLeitura[])
        .filter((f) => f !== "fora-do-escopo")
        .map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-dim">
            <span aria-hidden>{FAIXAS[f].emoji}</span>
            <span>
              <strong className="font-medium text-ink">{FAIXAS[f].rotulo}</strong> —{" "}
              {FAIXAS[f].descricao}
            </span>
          </li>
        ))}
    </ul>
  );
}

export function SeloFaixa({ faixa }: { faixa: FaixaLeitura }) {
  const tom = faixa === "base" ? "secondary" : faixa === "recorte" ? "primary" : "neutro";
  return (
    <Selo tom={tom}>
      <span aria-hidden>{FAIXAS[faixa].emoji}</span>
      {FAIXAS[faixa].rotulo}
    </Selo>
  );
}
