import type { ReactNode } from "react";
import { cx } from "./ui";

/**
 * Componentes dos roteiros de laboratório.
 *
 * Substituem, em React, os blocos que cada HTML de material reimplementava com
 * CSS próprio. A estrutura é a mesma que já estava consolidada nos 13 roteiros
 * do padrão dominante — cartão de comando, grade "o que é / por que importa",
 * terminal simulado, dica colapsável, checklist —, agora escrita uma vez só.
 *
 * Os que precisam de estado (rascunho de observação, checklist com progresso)
 * vivem em `aula-interativo.tsx`, marcados como client component.
 */

/**
 * Cabeçalho do roteiro: tempo estimado, título e chamada.
 *
 * `duracao` serve os roteiros de laboratório, que abrem sempre com "Mão na massa
 * · ~90 min". Os guias das semanas de projeto e dos dias de avaliação não têm
 * duração — o dia inteiro é a atividade —, e usam `sobretitulo` para dizer o que
 * o encontro é ("Semana de projeto · desenvolvimento").
 */
export function Abertura({
  duracao,
  sobretitulo,
  titulo,
  children,
}: {
  duracao?: string;
  sobretitulo?: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <header className="mb-12">
      <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">
        {sobretitulo ?? `Mão na massa · ${duracao}`}
      </p>
      <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{titulo}</h1>
      <div className="mt-4 max-w-3xl text-lg text-ink-dim">{children}</div>
    </header>
  );
}

/** Faixa com as partes do roteiro ("Passos 1–4 · Diagnóstico"). */
export function Partes({ children }: { children: ReactNode }) {
  return <div className="mb-14 flex flex-wrap gap-3">{children}</div>;
}

/** `rotulo` é opcional: na Semana 0 a faixa lista só etiquetas ("VirtualBox"). */
export function Parte({ rotulo, children }: { rotulo?: string; children: ReactNode }) {
  return (
    <span className="rounded-lg border border-line bg-card px-4 py-2.5 font-mono text-xs text-ink-dim">
      {rotulo && <b className="text-primary">{rotulo} · </b>}
      {children}
    </span>
  );
}

/**
 * Uma etapa do roteiro.
 *
 * `tempo` só aparece na Semana 0, onde cada passo é longo o bastante (instalar
 * um sistema operacional) para o aluno querer saber quanto ainda falta.
 */
export function Passo({
  numero,
  de,
  titulo,
  tempo,
  children,
}: {
  numero: number;
  de: number;
  titulo: string;
  tempo?: string;
  children: ReactNode;
}) {
  return (
    <section id={`passo-${numero}`} className="mb-14 scroll-mt-32">
      <p className="font-mono text-xs tracking-[0.06em] text-ink-faint uppercase">
        Passo {numero} de {de}
        {tempo && <span className="text-primary"> · {tempo}</span>}
      </p>
      <h2 className="mt-2 text-2xl">{titulo}</h2>
      {children}
    </section>
  );
}

/**
 * Seção que não é passo numerado — "Registro no portfólio", "Antes de
 * encerrar". Mesmo desenho do `Passo`, com rótulo próprio no lugar da contagem.
 */
export function Secao({
  sobretitulo,
  titulo,
  children,
}: {
  sobretitulo?: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-14">
      {sobretitulo && (
        <p className="font-mono text-xs tracking-[0.06em] text-ink-faint uppercase">
          {sobretitulo}
        </p>
      )}
      <h2 className="mt-2 text-2xl">{titulo}</h2>
      {children}
    </section>
  );
}

/**
 * Frase de contexto logo abaixo do título de um passo.
 *
 * `div`, e não `p`: quando o texto é escrito em linhas próprias dentro da tag,
 * o MDX o trata como bloco e já gera um `<p>`. Um `<p>` dentro de outro é HTML
 * inválido — o navegador fecha o externo sozinho e a hidratação quebra. Com
 * `div` por fora, o componente funciona independentemente de como o autor
 * quebra as linhas.
 */
export function Intro({ children }: { children: ReactNode }) {
  return <div className="mt-2 mb-6 max-w-3xl text-ink-dim [&_p]:my-0">{children}</div>;
}

/** Cartão de um comando: o número da etapa, o comando e tudo que o explica. */
export function Comando({
  passo,
  cmd,
  children,
}: {
  passo: number;
  cmd: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5 rounded-xl border border-line bg-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs text-white">
          {passo}
        </span>
        <code className="rounded-md bg-primary-soft px-2.5 py-1 font-mono text-[15px] text-primary">
          {cmd}
        </code>
      </div>
      {children}
    </div>
  );
}

/** Grade de explicação — na prática, sempre "O que é" + "Por que importa". */
export function Explica({ children }: { children: ReactNode }) {
  return <div className="mb-4 grid gap-3.5 sm:grid-cols-2">{children}</div>;
}

export function Caixa({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line-soft bg-panel p-3.5">
      <p className="mb-1.5 font-mono text-[10.5px] tracking-[0.05em] text-ink-faint uppercase">
        {titulo}
      </p>
      <div className="text-sm text-ink-dim [&_p]:m-0">{children}</div>
    </div>
  );
}

/**
 * Terminal simulado — uma sessão inteira, não um comando só.
 *
 * O conteúdo é o texto da sessão como o aluno o veria na tela; as linhas que
 * começam com `$ ` são desenhadas como comando digitado, e o resto como saída.
 * Isso cobre igualmente o terminal de um comando e o de vários, que aparecem em
 * boa parte dos roteiros — e mantém o MDX legível, sem marcar linha por linha.
 *
 * Mantém a sub-paleta escura mesmo com a página clara: é o contraste que faz o
 * aluno reconhecer "isto é a tela do terminal", e vale a exceção.
 */
export function Terminal({ children }: { children: string }) {
  const linhas = String(children).replace(/\n$/, "").split("\n");

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-term-line bg-term">
      <div className="flex gap-1.5 px-3 py-2" aria-hidden>
        <span className="size-2 rounded-full bg-term-line" />
        <span className="size-2 rounded-full bg-term-line" />
        <span className="size-2 rounded-full bg-term-line" />
      </div>
      <pre className="overflow-x-auto px-4 pb-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
        {linhas.map((linha, i) => {
          const comando = linha.startsWith("$ ");
          return (
            <span key={i}>
              {comando ? (
                <>
                  <span className="text-term-prompt">$</span>
                  <span className="text-[#cfd6e0]">{linha.slice(1)}</span>
                </>
              ) : (
                <span className="text-term-dim">{linha}</span>
              )}
              {i < linhas.length - 1 ? "\n" : ""}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

/** Conteúdo de um arquivo que o aluno vai criar — Dockerfile, script, config. */
export function Arquivo({ nome, children }: { nome: string; children: string }) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-line">
      <p className="border-b border-line bg-panel px-3.5 py-2 font-mono text-xs text-ink-dim">
        {nome}
      </p>
      <pre className="overflow-x-auto bg-card px-4 py-3.5 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-ink">
        {String(children).replace(/\n$/, "")}
      </pre>
    </div>
  );
}

/**
 * "O que esperar" — calibra a expectativa antes de o aluno rodar o comando.
 *
 * `div` por fora pelo mesmo motivo do `Intro`. O `[&_p]:inline` faz o parágrafo
 * que o MDX gera continuar na mesma linha do rótulo em negrito, preservando a
 * aparência de frase única.
 */
export function Esperar({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm text-ink-dim [&_p]:my-0 [&_p]:inline">
      <b className="text-ink">O que esperar:</b> {children}
    </div>
  );
}

/** Dica colapsável — fechada por padrão, para não entregar a resposta. */
export function Dica({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <details className="mt-3 rounded-lg border border-line-soft bg-panel">
      <summary className="cursor-pointer px-3.5 py-2.5 font-mono text-sm text-primary">
        {titulo}
      </summary>
      <div className="px-3.5 pb-3.5 text-sm text-ink-dim [&_p]:mt-0">{children}</div>
    </details>
  );
}

/** Divisor entre as duas metades do roteiro. */
export function Divisor({ children }: { children: ReactNode }) {
  return (
    <div className="my-14 flex items-center gap-4">
      <span className="h-px flex-1 bg-line" />
      <span className="font-mono text-xs tracking-[0.08em] text-primary uppercase">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/**
 * Par de exemplos: o que é uma observação fraca e o que é uma forte.
 *
 * Os guias de projeto usam o mesmo contraste para outra coisa — padrão de
 * trabalho em equipe que dá errado × o que funciona —, daí `titulo` e `rotulo`
 * poderem ser trocados.
 */
export function Exemplos({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="mb-4 text-lg">{titulo ?? "Exemplo de observação forte × fraca"}</h2>
      <div className="grid gap-3.5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Exemplo({
  tipo,
  rotulo,
  children,
}: {
  tipo: "fraca" | "forte";
  rotulo?: string;
  children: ReactNode;
}) {
  const forte = tipo === "forte";
  return (
    <div
      className={cx(
        "rounded-lg border p-4",
        forte ? "border-secondary bg-secondary-soft" : "border-alert bg-alert-soft",
      )}
    >
      <p
        className={cx(
          "mb-1.5 font-mono text-[11px] uppercase",
          forte ? "text-secondary" : "text-alert",
        )}
      >
        {rotulo ?? `Observação ${tipo}`}
      </p>
      <div className="text-sm text-ink-dim italic [&_p]:m-0">{children}</div>
    </div>
  );
}

/** Onde a prática do dia encosta na teoria do slide e da leitura. */
export function Teoria({ children }: { children: ReactNode }) {
  return (
    <aside className="mb-14 rounded-xl border border-primary-dim bg-primary-soft p-5">
      <p className="mb-1.5 font-mono text-[11px] tracking-wide text-primary uppercase">
        Conexão com a teoria
      </p>
      <div className="text-sm text-ink-dim [&_p]:m-0">{children}</div>
    </aside>
  );
}

/**
 * Destaque informativo, em teal.
 *
 * Distinto do `Aviso`, que é vermelho: este chama atenção sem alarmar. Usado,
 * por exemplo, quando o próprio roteiro é a leitura obrigatória da semana —
 * caso dos encontros de shell script, que nenhum dos livros-base cobre.
 */
export function Destaque({
  titulo,
  tom,
  children,
}: {
  titulo?: string;
  /** `positivo` (verde) para o que conta a favor do aluno; o padrão é teal. */
  tom?: "positivo";
  children: ReactNode;
}) {
  const positivo = tom === "positivo";
  return (
    <div
      className={cx(
        "mb-8 rounded-xl border p-5",
        positivo ? "border-secondary bg-secondary-soft" : "border-primary-dim bg-primary-soft",
      )}
    >
      {titulo && (
        <p
          className={cx(
            "mb-1.5 font-mono text-[11px] tracking-wide uppercase",
            positivo ? "text-secondary" : "text-primary",
          )}
        >
          {titulo}
        </p>
      )}
      <div className="text-sm text-ink-dim [&_p]:mt-0 [&_p:last-child]:mb-0">{children}</div>
    </div>
  );
}

/** Aviso destacado — usado para lembrete de entrega e alerta de avaliação. */
export function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mb-8 rounded-xl border border-alert/40 bg-alert-soft p-5">
      <p className="mb-1.5 font-mono text-[11px] tracking-wide text-alert uppercase">{titulo}</p>
      <div className="text-sm text-ink-dim [&_p]:mt-0 [&_p:last-child]:mb-0">{children}</div>
    </div>
  );
}

/**
 * Lista em que a ordem é o conteúdo — "a ordem que funciona", "o que ter pronto
 * antes da sua vez". Diferente da lista numerada do Markdown por dois motivos:
 * cada item é um cartão (o aluno percorre um por vez, com o olho parado) e o
 * marcador é livre, porque nem sempre é "1, 2, 3" — às vezes é "1º, 2º".
 */
export function Lista({ children }: { children: ReactNode }) {
  return <div className="my-5 flex max-w-3xl flex-col gap-2.5">{children}</div>;
}

export function Ponto({ marca, children }: { marca: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3.5 rounded-lg border border-line bg-card p-3.5 text-sm text-ink-dim">
      <span className="shrink-0 font-mono font-semibold text-primary">{marca}</span>
      <div className="[&_p]:my-0">{children}</div>
    </div>
  );
}

/** Grade de cartões — duas colunas, cada um com etiqueta, título e explicação. */
export function Cartoes({ children }: { children: ReactNode }) {
  return <div className="my-5 grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Cartao({
  rotulo,
  titulo,
  children,
}: {
  rotulo?: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-card p-5">
      {rotulo && (
        <p className="mb-2 font-mono text-[11px] tracking-wide text-ink-faint uppercase">{rotulo}</p>
      )}
      <h3 className="mb-2 text-base">{titulo}</h3>
      <div className="text-sm text-ink-dim [&_p]:my-0">{children}</div>
    </div>
  );
}

/** Divisão do tempo de uma defesa ou apresentação. */
export function Tempos({ children }: { children: ReactNode }) {
  return <div className="my-5 grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Tempo({ quanto, children }: { quanto: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-primary-dim bg-primary-soft p-5 text-center">
      <p className="font-mono text-xl text-primary">{quanto}</p>
      <div className="mt-1.5 text-sm text-ink-dim [&_p]:my-0">{children}</div>
    </div>
  );
}

/**
 * Bloco de apoio com título — "Antes de começar", "Guarde esse print".
 *
 * Não é alerta nem destaque: só um texto que precisa se separar do corpo por ser
 * uma instrução à parte. Por isso o título é um `h3` de verdade, e não uma
 * etiqueta em versalete.
 */
export function Painel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="my-8 max-w-3xl rounded-xl border border-line bg-card p-5 sm:p-6">
      <h3 className="mb-2 text-lg">{titulo}</h3>
      <div className="text-sm text-ink-dim [&_p]:mt-0 [&_p:last-child]:mb-0">{children}</div>
    </section>
  );
}

/**
 * Subdivisão de um passo — "1.1 · Abrir o assistente".
 *
 * Existe por causa da Semana 0, o único encontro em que a atividade é uma
 * sequência longa de cliques num instalador, e não um punhado de comandos. Um
 * passo ali tem oito subpassos; sem esta divisão, o aluno perde o lugar na
 * página no meio da instalação do Ubuntu.
 */
export function Etapa({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mb-3.5 max-w-3xl rounded-lg border border-line border-l-[3px] border-l-primary bg-card p-4">
      <p className="mb-1.5 font-mono text-[12.5px] text-primary">{titulo}</p>
      <div className="text-sm text-ink-dim [&_p]:my-0">{children}</div>
    </div>
  );
}

/** Provocação curta no meio do passo — "Pense:", "Desafio rápido:". */
export function Nota({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="my-3.5 max-w-3xl rounded-lg border border-line-soft bg-panel p-3.5 text-sm text-ink-dim [&_p]:my-0 [&_p]:inline">
      <b className="text-ink">{rotulo}:</b> {children}
    </div>
  );
}
