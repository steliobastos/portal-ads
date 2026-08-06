/**
 * Arte do portal — SVG desenhado à mão, na paleta institucional.
 *
 * Por que SVG e não foto: o repositório é público e institucional, então imagem
 * de banco sem licença clara é problema; e vetor não desfoca, não pesa e muda de
 * cor junto com a paleta. As duas peças grandes ilustram o que o curso realmente
 * é — um terminal e as camadas entre o hardware e a sua aplicação — em vez de
 * decorar com gente sorrindo na frente de um monitor.
 *
 * Tudo aqui é decorativo: `aria-hidden`, porque o texto ao lado já diz o que a
 * imagem mostra. Os ícones são a exceção — recebem rótulo de quem os usa.
 */

/** Composição do topo da home: terminal em primeiro plano, camadas atrás. */
export function ArteTerminal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 360" className={className} aria-hidden role="presentation">
      {/* malha de pontos — textura discreta no canto */}
      <g fill="#8fc7ca" opacity="0.55">
        {[0, 1, 2, 3, 4].map((c) =>
          [0, 1, 2, 3].map((l) => <circle key={`${c}-${l}`} cx={22 + c * 20} cy={22 + l * 20} r="2" />),
        )}
      </g>

      {/* as duas camadas atrás sugerem containers empilhados */}
      <rect x="120" y="26" width="330" height="200" rx="14" fill="#ffffff" stroke="#e2ddd0" />
      <rect x="100" y="48" width="330" height="200" rx="14" fill="#f3f1e8" stroke="#a8d4ab" />

      {/* terminal */}
      <rect x="40" y="76" width="360" height="226" rx="16" fill="#10161f" stroke="#212b3a" />
      <circle cx="66" cy="100" r="5" fill="#2b3648" />
      <circle cx="84" cy="100" r="5" fill="#2b3648" />
      <circle cx="102" cy="100" r="5" fill="#7ee787" />
      <line x1="40" y1="120" x2="400" y2="120" stroke="#212b3a" />

      <g fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" fontSize="14.5">
        <text x="64" y="152" fill="#7ee787">$</text>
        <text x="82" y="152" fill="#cfd6e0">docker run -it ubuntu</text>

        <text x="64" y="182" fill="#8d96a8">root@a1b2c3:/#</text>

        <text x="64" y="212" fill="#7ee787">$</text>
        <text x="82" y="212" fill="#cfd6e0">ps aux | grep sleep</text>

        <text x="64" y="242" fill="#5fd9d3">PID 1 · sleep 300</text>

        <text x="64" y="272" fill="#7ee787">$</text>
        <rect x="82" y="260" width="10" height="16" fill="#5fd9d3" opacity="0.85" />
      </g>

      {/* etiqueta flutuante */}
      <g>
        <rect x="286" y="288" width="164" height="46" rx="12" fill="#ffffff" stroke="#a8d4ab" />
        <circle cx="310" cy="311" r="5" fill="#399b3f" />
        <text
          x="326"
          y="316"
          fill="#5b6058"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
          fontSize="12.5"
        >
          container ativo
        </text>
      </g>
    </svg>
  );
}

/** As camadas entre o hardware e o código do aluno — a ementa em um desenho. */
export function ArteCamadas({ className }: { className?: string }) {
  // A altura do losango (34) é menor que o passo vertical (44) de propósito: com
  // os dois iguais, a ponta de baixo de uma camada cobre o rótulo da seguinte.
  const CAMADAS = [
    { cy: 60, rotulo: "sua aplicação", fill: "#ffffff", stroke: "#1b878f", cor: "#1b878f" },
    { cy: 104, rotulo: "processos", fill: "#cfe7e8", stroke: "#8fc7ca", cor: "#175f65" },
    { cy: 148, rotulo: "núcleo do SO", fill: "#d8e9d8", stroke: "#a8d4ab", cor: "#2c6b30" },
    { cy: 192, rotulo: "hardware", fill: "#e6e1d4", stroke: "#cdc6b4", cor: "#5b6058" },
  ];

  return (
    <svg viewBox="0 0 320 236" className={className} aria-hidden role="presentation">
      {/* de baixo para cima, para a camada de cima ficar por último no empilhamento */}
      {[...CAMADAS].reverse().map((c) => (
        <g key={c.rotulo}>
          <polygon
            points={`30,${c.cy} 160,${c.cy - 34} 290,${c.cy} 160,${c.cy + 34}`}
            fill={c.fill}
            stroke={c.stroke}
            strokeWidth="1.5"
          />
          <text
            x="160"
            y={c.cy + 4.5}
            textAnchor="middle"
            fill={c.cor}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            fontSize="12.5"
          >
            {c.rotulo}
          </text>
        </g>
      ))}
    </svg>
  );
}

const TRACOS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DESENHOS = {
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M7 10l3 2.5L7 15" />
      <path d="M12.5 15.5H17" />
    </>
  ),
  container: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  ramo: (
    <>
      <circle cx="7" cy="5.5" r="2.2" />
      <circle cx="7" cy="18.5" r="2.2" />
      <circle cx="17" cy="9.5" r="2.2" />
      <path d="M7 7.7v8.6" />
      <path d="M17 11.7c0 3-2.6 4.2-5.4 4.8" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9s1.2-6.4 3.6-9z" />
    </>
  ),
  livro: (
    <>
      <path d="M4 4.5A1.5 1.5 0 015.5 3H19v15H5.5A1.5 1.5 0 004 19.5z" />
      <path d="M4 19.5A1.5 1.5 0 015.5 18H19v3H5.5A1.5 1.5 0 014 19.5z" />
    </>
  ),
  predio: (
    <>
      <path d="M4 21V6.5L12 3l8 3.5V21" />
      <path d="M3 21h18" />
      <path d="M9.5 21v-5h5v5" />
      <path d="M8.5 10h2M13.5 10h2M8.5 13h2M13.5 13h2" />
    </>
  ),
} as const;

export type NomeIcone = keyof typeof DESENHOS;

export function Icone({ nome, className }: { nome: NomeIcone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden role="presentation" {...TRACOS}>
      {DESENHOS[nome]}
    </svg>
  );
}
