/**
 * Links úteis — referências externas que o aluno de ADS usa o curso inteiro.
 *
 * Critério de entrada: precisa ser gratuito, estável e realmente consultável no
 * dia a dia. Tutorial de moda e vídeo solto envelhecem e viram link quebrado —
 * documentação oficial e ferramenta interativa, não.
 *
 * Editado à mão pelo professor, como os avisos.
 */

export type Link = {
  titulo: string;
  url: string;
  descricao: string;
  /** Marca o que vale abrir primeiro em cada categoria. */
  destaque?: boolean;
};

export type CategoriaLinks = {
  id: string;
  titulo: string;
  /** Ícone desenhado em `components/arte.tsx`. */
  icone: "terminal" | "container" | "ramo" | "web" | "livro" | "predio";
  descricao: string;
  links: Link[];
};

export const CATEGORIAS: CategoriaLinks[] = [
  {
    id: "terminal",
    titulo: "Linha de comando e Linux",
    icone: "terminal",
    descricao:
      "O eixo do curso. Vale ter estes quatro abertos numa aba enquanto você faz os laboratórios.",
    links: [
      {
        titulo: "explainshell",
        url: "https://explainshell.com/",
        descricao:
          "Cole um comando inteiro e ele explica cada pedaço, flag por flag. O melhor jeito de entender uma linha que você copiou sem saber o que faz.",
        destaque: true,
      },
      {
        titulo: "tldr pages",
        url: "https://tldr.inbrowser.app/",
        descricao:
          "O manual de um comando reduzido aos exemplos que as pessoas realmente usam. É o man sem as 400 linhas.",
      },
      {
        titulo: "Linux Journey",
        url: "https://linuxjourney.com/",
        descricao: "Curso gratuito de Linux do zero, em trilhas curtas, com exercícios.",
      },
      {
        titulo: "ShellCheck",
        url: "https://www.shellcheck.net/",
        descricao:
          "Cole seu shell script e ele aponta os erros — inclusive os de aspas, que derrubam metade dos scripts do Encontro 13.",
      },
      {
        titulo: "man7.org — páginas de manual",
        url: "https://man7.org/linux/man-pages/",
        descricao: "As páginas de manual do Linux em HTML, a fonte oficial quando a dúvida é fina.",
      },
    ],
  },
  {
    id: "containers",
    titulo: "Docker e containers",
    icone: "container",
    descricao:
      "Docker atravessa o curso inteiro. Se a sua máquina não colaborar, os dois ambientes de navegador salvam a aula.",
    links: [
      {
        titulo: "Documentação oficial do Docker",
        url: "https://docs.docker.com/",
        descricao: "A referência. Comece pelo guia de primeiros passos e pela referência do Dockerfile.",
        destaque: true,
      },
      {
        titulo: "Play with Docker",
        url: "https://labs.play-with-docker.com/",
        descricao:
          "Um Docker de verdade rodando no navegador, sem instalar nada. O plano B de quem está com a VM quebrada.",
      },
      {
        titulo: "Killercoda",
        url: "https://killercoda.com/",
        descricao: "Cenários interativos de Linux, Docker e Kubernetes direto no navegador.",
      },
      {
        titulo: "Docker Hub",
        url: "https://hub.docker.com/",
        descricao:
          "O repositório público de imagens — de onde vem o docker pull dos laboratórios.",
      },
    ],
  },
  {
    id: "git",
    titulo: "Git e versionamento",
    icone: "ramo",
    descricao:
      "Não é conteúdo de Sistemas Operacionais, mas é ferramenta de todo dia de quem desenvolve.",
    links: [
      {
        titulo: "Pro Git (livro completo, em português)",
        url: "https://git-scm.com/book/pt-br/v2",
        descricao: "O livro de referência sobre Git, gratuito e traduzido. Os três primeiros capítulos já bastam.",
        destaque: true,
      },
      {
        titulo: "Learn Git Branching",
        url: "https://learngitbranching.js.org/?locale=pt_BR",
        descricao:
          "Aprende branch e merge mexendo num diagrama animado, em vez de decorar comando. Em português.",
      },
      {
        titulo: "Documentação do GitHub",
        url: "https://docs.github.com/pt",
        descricao: "Pull request, issues, Actions — o fluxo de trabalho em equipe.",
      },
    ],
  },
  {
    id: "web",
    titulo: "Desenvolvimento web",
    icone: "web",
    descricao:
      "A stack deste portal. O código dele é público de propósito: dá para ler o que está por trás de cada página que você usa.",
    links: [
      {
        titulo: "MDN Web Docs",
        url: "https://developer.mozilla.org/pt-BR/",
        descricao:
          "A referência de HTML, CSS e JavaScript. Quando a resposta do fórum divergir da MDN, confie na MDN.",
        destaque: true,
      },
      {
        titulo: "React",
        url: "https://react.dev/",
        descricao: "Documentação oficial, com tutorial interativo.",
      },
      {
        titulo: "Next.js",
        url: "https://nextjs.org/docs",
        descricao: "O framework em que este portal é escrito.",
      },
      {
        titulo: "TypeScript",
        url: "https://www.typescriptlang.org/docs/",
        descricao: "Tipagem sobre JavaScript — o que evita metade dos erros antes de rodar.",
      },
      {
        titulo: "Tailwind CSS",
        url: "https://tailwindcss.com/docs",
        descricao: "O CSS utilitário usado no visual deste portal.",
      },
    ],
  },
  {
    id: "estudo",
    titulo: "Estudo e carreira",
    icone: "livro",
    descricao: "Para quem quer saber o que estudar depois — e em que ordem.",
    links: [
      {
        titulo: "roadmap.sh",
        url: "https://roadmap.sh/",
        descricao:
          "Mapas de estudo por área (backend, DevOps, frontend). Bom para enxergar o caminho inteiro, não para seguir à risca.",
        destaque: true,
      },
      {
        titulo: "The Odin Project",
        url: "https://www.theodinproject.com/",
        descricao: "Currículo gratuito e completo de desenvolvimento web, baseado em projetos.",
      },
      {
        titulo: "freeCodeCamp",
        url: "https://www.freecodecamp.org/portuguese/",
        descricao: "Trilhas com certificado, em português, com muito exercício prático.",
      },
    ],
  },
  {
    id: "institucional",
    titulo: "Institucional",
    icone: "predio",
    descricao: "Os sistemas do IFCE que você usa fora do portal.",
    links: [
      {
        titulo: "IFCE",
        url: "https://ifce.edu.br/",
        descricao: "Portal institucional do Instituto Federal do Ceará.",
      },
      {
        titulo: "SUAP",
        url: "https://suap.ifce.edu.br/",
        descricao: "Sistema acadêmico: matrícula, notas, frequência e documentos.",
      },
    ],
  },
];

export const TOTAL_LINKS = CATEGORIAS.reduce((s, c) => s + c.links.length, 0);
