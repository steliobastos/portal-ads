import type { Encontro } from "../tipos";

/**
 * Os 17 encontros + Semana 0 de Sistemas Operacionais (ADS23).
 *
 * As leituras vêm do Mapa de Leituras da disciplina (páginas conferidas contra
 * os sumários reais de Laureano e Tanenbaum). As datas são da oferta corrente —
 * o material em si é escrito sem data, para ser reaproveitado em outras ofertas.
 */
export const ENCONTROS: Encontro[] = [
  {
    numero: 0,
    pasta: "aula0",
    titulo: "Onboarding de ambiente",
    data: "2026-08-07",
    etapa: 1,
    unidade: "Semana 0",
    resumo:
      "Atividade extracurricular que integra a 1ª etapa: você monta a máquina virtual que vai usar o semestre inteiro. Ao fim do dia, o ambiente está de pé — e a primeira aula não perde tempo com infraestrutura.",
    topicos: ["VirtualBox", "Ubuntu 24.04 LTS", "Docker", "primeiro terminal"],
    docker: "Instalação do Docker dentro da própria VM, via script de conveniência.",
    leituras: [
      {
        faixa: "aprofundamento",
        fonte: "LAUREANO, Cap. 3",
        titulo: "Estudo de Caso: Linux",
        paginas: "26–28",
        nota: "O que é, história e características do sistema que usaremos o semestre inteiro.",
      },
    ],
  },
  {
    numero: 1,
    pasta: "aula1",
    titulo: "O que é um Sistema Operacional",
    data: "2026-08-14",
    etapa: 1,
    unidade: "Unidade I — Visão geral e conceitos",
    resumo:
      "As duas coisas que um SO faz: ser uma máquina estendida (esconde a complexidade do hardware) e ser um gerenciador de recursos (decide quem usa o quê, e quando). São os dois óculos que usaremos o curso todo.",
    topicos: ["máquina estendida", "gerenciador de recursos", "história dos SOs", "terminal"],
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 1",
        titulo: "Introdução",
        paginas: "9–17",
        nota: "Papel do SO, arquitetura, tipos e chamada de sistema — o mapa geral de tudo que vem pela frente.",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 1.1",
        titulo: "O que é um sistema operacional?",
        paginas: "3–5",
        nota: "A formulação clássica das duas lentes.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 1.2",
        titulo: "História dos sistemas operacionais",
        paginas: "5–14",
      },
    ],
  },
  {
    numero: 2,
    pasta: "aula2",
    titulo: "Hardware e tipos de SO",
    data: "2026-08-21",
    etapa: 1,
    unidade: "Unidade I — Visão geral e conceitos",
    resumo:
      "O hardware essencial visto de cima (CPU, memória, disco, barramento) e o \"zoológico dos SOs\". A ponte prática: o /proc, um sistema de arquivos que não existe no disco e expõe o que o núcleo sabe sobre a máquina.",
    topicos: ["CPU e memória", "barramento", "zoológico dos SOs", "/procfs"],
    docker: "Gancho para o eixo do curso: como cgroups usam o /proc para limitar containers.",
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 9",
        titulo: "O sistema de arquivo /procfs",
        paginas: "90–94",
        nota: "O livro explica exatamente o que você acabou de explorar no laboratório.",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 1.4",
        titulo: "O zoológico dos sistemas operacionais",
        paginas: "24–27",
        nota: "Mainframe, servidor, embarcado, tempo real — onde o Linux do lab se encaixa.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 1.3",
        titulo: "Revisão sobre hardware de computadores",
        paginas: "14–24",
      },
    ],
  },
  {
    numero: 3,
    pasta: "aula3",
    titulo: "Arquiteturas de SO e chamadas de sistema",
    data: "2026-08-28",
    etapa: 1,
    unidade: "Unidade II — Arquitetura de sistemas operacionais",
    resumo:
      "Monolítico, camadas, micronúcleo e máquinas virtuais em formato jigsaw — cada grupo vira especialista e ensina os demais. Depois, a fronteira que separa seu programa do núcleo: a chamada de sistema, vista ao vivo com strace.",
    topicos: ["monolítico × micronúcleo", "jigsaw", "chamada de sistema", "strace"],
    docker: "Primeira comparação concreta entre container e máquina virtual.",
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 1",
        titulo: "Releitura dirigida: Arquitetura de SO e Chamada de Sistema",
        paginas: "12–14 e 16–17",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 1.7",
        titulo: "Estrutura de sistemas operacionais",
        paginas: "43–51",
        nota: "Leitura por grupo de especialistas: cada grupo lê a subseção da sua arquitetura.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 1.6",
        titulo: "Chamadas de sistema",
        paginas: "35–43",
        nota: "Prepara o strace do laboratório.",
      },
    ],
  },
  {
    numero: 4,
    pasta: "aula4",
    titulo: "Da virtualização aos containers (Docker)",
    data: "2026-09-04",
    etapa: 1,
    unidade: "Unidade II — Arquitetura de sistemas operacionais",
    resumo:
      "Fechamento da Unidade II. Hipervisores tipo 1 e tipo 2, o que a nuvem realmente vende, e o aprofundamento formal do Docker: imagem × container, Docker Hub, Dockerfile e os comandos essenciais.",
    topicos: ["hipervisores", "nuvem", "imagem × container", "Dockerfile"],
    docker: "Aprofundamento formal: do docker pull à sua primeira imagem própria com docker build.",
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 7",
        titulo: "Máquinas Virtuais",
        paginas: "70–77",
        nota: "Por que existem, tipos, estratégias e usos.",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 7.3 e 7.11",
        titulo: "Hipervisores tipo 1 e tipo 2 · Nuvens",
        paginas: "329–330 e 342–344",
        nota: "O vocabulário que o mercado usa todo dia.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, Cap. 7",
        titulo: "Virtualização e a nuvem (completo)",
        paginas: "327–357",
      },
    ],
  },
  {
    numero: 5,
    pasta: "aula5",
    titulo: "Processos: conceito, estados e diagnóstico",
    data: "2026-09-11",
    etapa: 1,
    unidade: "Unidade III — Processos",
    resumo:
      "Abertura da Unidade III. A diferença entre programa e processo, a anatomia de um processo (PID, memória, estado), os três estados e suas transições, a hierarquia de PPIDs — e as ferramentas de diagnóstico ps e top.",
    topicos: ["processo × programa", "estados", "PID e PPID", "ps · top"],
    docker: "Namespace de PID: o mesmo processo tem PIDs diferentes visto de dentro e de fora do container.",
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 10",
        titulo: "Programas e Processos · Informações sobre processos no /proc",
        paginas: "99–106",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 2.1",
        titulo: "Processos",
        paginas: "59–67",
        nota: "Modelo de processo, criação, término, hierarquia e estados — a teoria por trás do ps e do top.",
      },
      {
        faixa: "aprofundamento",
        fonte: "LAUREANO",
        titulo: "O ciclo de vida de um processo no Linux",
        paginas: "132–150",
      },
    ],
  },
  {
    numero: 6,
    pasta: "aula6",
    titulo: "CPU-bound, I/O-bound e pipes",
    data: "2026-09-18",
    etapa: 1,
    unidade: "Unidade III — Processos",
    resumo:
      "Por que dois processos que \"consomem 100%\" podem ser problemas completamente diferentes. Surtos de CPU × surtos de E/S, o que o escalonador faz com essa informação, e os pipes explicados por dentro.",
    topicos: ["CPU-bound × I/O-bound", "escalonamento", "stdin/stdout/stderr", "pipes"],
    docker: "docker stats: comparar um container ocioso com um sob carga.",
    marco: {
      nota: "N1",
      etapa: 1,
      instrumento:
        "Formação das equipes do Raio-X. A entrega parcial (seções 1 a 4) é enviada pelo portal até a sexta-feira seguinte.",
      projeto: true,
    },
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO",
        titulo: "Multiplexação do processador · Entradas e saídas padrão de um processo",
        paginas: "106–108 e 120–126",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 2.4",
        titulo: "Escalonamento (recorte introdutório)",
        paginas: "103–107",
        nota: "Comportamento de processos, surtos de CPU × E/S, quando escalonar.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 2.4 · LAUREANO",
        titulo: "Escalonamento completo · Prioridades e escalonamento no Linux",
        paginas: "103–115 e 127–132",
      },
    ],
  },
  {
    numero: 7,
    pasta: "aula7",
    titulo: "Concorrência: condição de corrida e exclusão mútua",
    data: "2026-09-25",
    etapa: 1,
    unidade: "Unidade III — Processos",
    resumo:
      "O bug mais traiçoeiro que você vai encontrar em código: dois processos leem, calculam e gravam ao mesmo tempo, e o resultado depende de quem chegou primeiro. Região crítica, exclusão mútua e os quatro requisitos de uma boa solução.",
    topicos: ["condição de corrida", "região crítica", "exclusão mútua", "espera ocupada"],
    docker: "Ensaio de entrega: a equipe pratica o ciclo build → run → demonstração → stop/rm da N2.",
    leituras: [
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 2.3.1–2.3.2",
        titulo: "Condições de corrida · Regiões críticas",
        paginas: "82–84",
        nota: "Três páginas que explicam o bug mais caro de reproduzir em produção. O Laureano não desdobra concorrência — aqui o Tanenbaum assume a frente.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 2.3.3–2.3.6 e 2.5",
        titulo: "Da espera ocupada aos mutexes · Problemas clássicos de IPC",
        paginas: "84–94 e 115–119",
      },
    ],
  },
  {
    numero: 8,
    pasta: "aula8",
    titulo: "Fechamento da 1ª etapa — defesas",
    data: "2026-10-02",
    etapa: 1,
    unidade: "Avaliação",
    resumo:
      "Dia de defesa, não de conteúdo novo. Cada equipe apresenta o relatório Raio-X do sistema investigado, defende as escolhas em 5–6 minutos e demonstra o container ao vivo.",
    topicos: ["relatório Raio-X", "defesa oral", "container ao vivo"],
    marco: {
      nota: "N2",
      etapa: 1,
      instrumento: "Relatório Raio-X (duplas/trios) + defesa 5–6 min + container ao vivo",
      projeto: true,
    },
    leituras: [
      {
        faixa: "aprofundamento",
        fonte: "Revisão",
        titulo: "Reveja os recortes 🔵 dos Encontros 1–7",
        nota: "Sem leitura nova. Esses recortes são a munição conceitual da sua defesa.",
      },
    ],
  },
  {
    numero: 9,
    pasta: "aula9",
    titulo: "Memória na prática: consumo, vazamento e OOM",
    data: "2026-10-09",
    etapa: 2,
    unidade: "Unidade IV — Memória e E/S",
    resumo:
      "Abertura da Unidade IV. Como ler o free sem se enganar (available × used), o que é de fato um vazamento de memória, para que serve o swap e quem é o OOM Killer que derruba seu processo de madrugada.",
    topicos: ["espaço de endereçamento", "vazamento", "swap", "OOM Killer"],
    docker: "docker run --memory e um OOM provocado de propósito: o famoso Exited (137).",
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 9",
        titulo: "Utilizando o /proc",
        paginas: "94–98",
        nota: "meminfo e vizinhança, direto do laboratório.",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 3.2.1–3.2.2",
        titulo: "A noção de um espaço de endereçamento · Swapping",
        paginas: "128–131",
        nota: "Por que cada processo enxerga \"sua\" memória.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 3.1",
        titulo: "Sem abstração de memória",
        paginas: "125–128",
        nota: "Como era o mundo antes.",
      },
    ],
  },
  {
    numero: 10,
    pasta: "aula10",
    titulo: "Memória virtual, paginação e limites em container",
    data: "2026-10-16",
    etapa: 2,
    unidade: "Unidade IV — Memória e E/S",
    resumo:
      "O mecanismo que explica por que a máquina \"engasga\": paginação, page fault (minor × major) e thrashing. E como o cgroups transforma isso num limite prático de container.",
    topicos: ["paginação", "page fault", "thrashing", "cgroups"],
    docker: "Dimensionamento empírico do --memory: achar o limite certo em vez de chutar.",
    leituras: [
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 3.3.1",
        titulo: "Paginação",
        paginas: "134–136",
      },
      {
        faixa: "base",
        fonte: "LAUREANO",
        titulo: "Releitura de apoio: p. 94–98 com novos olhos",
        paginas: "94–98",
        nota: "Agora você sabe o que é page fault.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 3.3 e 3.5.2",
        titulo: "Paginação completa · Controle de carga (thrashing)",
        paginas: "134–144 e 155–156",
      },
      {
        faixa: "fora-do-escopo",
        fonte: "TANENBAUM, 3.4",
        titulo: "Algoritmos de substituição de páginas",
        nota: "Decisão de calibragem da disciplina: relevante para engenharia de SO, não para o perfil ADS. Não será cobrado.",
      },
    ],
  },
  {
    numero: 11,
    pasta: "aula11",
    titulo: "E/S como fonte de latência",
    data: "2026-10-23",
    etapa: 2,
    unidade: "Unidade IV — Memória e E/S",
    resumo:
      "Fechamento da Unidade IV. As ordens de grandeza da latência (cache → RAM → SSD → HDD → rede), \"tudo é arquivo\" e o /dev, e a diferença entre partição, sistema de arquivos e ponto de montagem.",
    topicos: ["latência", "tudo é arquivo", "/dev", "lsblk · df · du"],
    docker: "Volumes: o dado que sobrevive ao docker rm.",
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 5",
        titulo: "Sistema de Arquivos: partições, arquivos e diretórios",
        paginas: "39–43",
        nota: "A base para o lsblk e o /dev.",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 5.2",
        titulo: "Princípios do software de E/S",
        paginas: "243–246",
        nota: "As metas que todo subsistema de E/S persegue.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 5.1 e 5.4",
        titulo: "Princípios do hardware de E/S · Discos",
        paginas: "233–243 e 255–269",
      },
    ],
  },
  {
    numero: 12,
    pasta: "aula12",
    titulo: "Shell: comandos, arquivos e coringas",
    data: "2026-10-30",
    etapa: 2,
    unidade: "Unidade VI — Shell script",
    resumo:
      "Abertura da Unidade VI — a competência mais empregável do curso. Onde o shell se encaixa na arquitetura do SO, navegação e manipulação de arquivos, coringas (globbing), find, grep e redirecionamento.",
    topicos: ["globbing", "find · grep", "> × >>", "navegação"],
    docker: "docker exec -it … sh: o shell dentro do container.",
    marco: {
      nota: "N1",
      etapa: 2,
      instrumento: "Prática avaliada curta (~40 min) de memória e E/S, no início da aula",
    },
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 4 e 5",
        titulo: "Comandos Básicos · Comandos para diretórios e arquivos",
        paginas: "33–38 e 43–53",
      },
      {
        faixa: "recorte",
        fonte: "TANENBAUM, 1.5.6",
        titulo: "O interpretador de comandos (shell)",
        paginas: "32–33",
        nota: "Duas páginas que situam o shell na arquitetura do SO.",
      },
      {
        faixa: "aprofundamento",
        fonte: "LAUREANO, Cap. 6 e 5",
        titulo: "Permissões · Comandos avançados",
        paginas: "62–69 e 59–61",
      },
    ],
  },
  {
    numero: 13,
    pasta: "aula13",
    titulo: "Shell script: variáveis, decisões e funções",
    data: "2026-11-06",
    etapa: 2,
    unidade: "Unidade VI — Shell script",
    resumo:
      "De comando solto a programa: shebang e chmod +x, variáveis e substituição de comando, condicionais, laços, funções, código de saída — e a regra das aspas, que evita a maior parte dos bugs de script.",
    topicos: ["shebang", "$(...)", "a regra das aspas", "funções · exit code"],
    docker: "Script que verifica e sobe um container — o embrião do toolkit do projeto final.",
    leituras: [
      {
        faixa: "base",
        fonte: "Material da disciplina",
        titulo: "Roteiro de laboratório do Encontro 13",
        nota: "Leitura obrigatória da semana: nenhum dos dois livros-base cobre shell script, então o próprio roteiro é o texto — e o quiz cobra o conteúdo dele.",
      },
      {
        faixa: "aprofundamento",
        fonte: "Bibliografia complementar do PUD",
        titulo: "NEGUS & BRESNAHAN, Linux: a Bíblia (cap. de shell scripts) · MENDONÇA & ARAÚJO, Shell Linux",
      },
    ],
  },
  {
    numero: 14,
    pasta: "aula14",
    titulo: "Automação e lançamento do projeto final",
    data: "2026-11-13",
    etapa: 2,
    unidade: "Unidade VI — Shell script",
    resumo:
      "As três tarefas que todo time de operação automatiza: deploy, backup e monitoramento. As três perguntas de um backup, o cron, permissões e os riscos reais de automação. Aqui o projeto final é lançado.",
    topicos: ["deploy", "backup", "monitoramento", "cron"],
    docker: "O toolkit opera um container — a convergência de todo o semestre.",
    leituras: [
      {
        faixa: "base",
        fonte: "LAUREANO, Cap. 6 e 8",
        titulo: "Permissões em arquivos · Administração de Usuários",
        paginas: "62–69 e 81–89",
        nota: "Referência direta para os scripts do toolkit.",
      },
      {
        faixa: "aprofundamento",
        fonte: "TANENBAUM, 4.1–4.2",
        titulo: "Arquivos e Diretórios",
        paginas: "182–197",
      },
    ],
  },
  {
    numero: 15,
    pasta: "aula15",
    titulo: "Semana de projeto — desenvolvimento",
    data: "2026-11-27",
    etapa: 2,
    unidade: "Projeto integrador",
    resumo:
      "Aula inteira de mão na massa, com o professor circulando como mentor. Meta do dia: toda equipe sai com o deploy.sh funcionando de ponta a ponta.",
    topicos: ["deploy.sh", "mentoria", "trabalho em equipe"],
    leituras: [
      {
        faixa: "aprofundamento",
        fonte: "Banco de consulta",
        titulo: "Laureano Cap. 4–6, 8 e 9 · Tanenbaum 1.5, 2.1 e 3.3 · roteiros dos Encontros 12–14",
        nota: "Sem leitura nova — consulte conforme a necessidade do seu toolkit.",
      },
    ],
  },
  {
    numero: 16,
    pasta: "aula16",
    titulo: "Finalização e ensaio · encontro amortecedor",
    data: "2026-12-04",
    etapa: 2,
    unidade: "Projeto integrador",
    resumo:
      "Encontro reservado como amortecedor do semestre: absorve conteúdo deslocado por imprevistos. Sem pendências, é dia de fechar o toolkit e ensaiar a apresentação cronometrada.",
    topicos: ["checklist por equipe", "ensaio cronometrado", "contingência"],
    leituras: [
      {
        faixa: "aprofundamento",
        fonte: "Banco de consulta",
        titulo: "Mesmo banco do Encontro 15",
        nota: "Sem leitura nova.",
      },
    ],
  },
  {
    numero: 17,
    pasta: "aula17",
    titulo: "Apresentação final e encerramento",
    data: "2026-12-11",
    etapa: 2,
    unidade: "Avaliação",
    resumo:
      "Cada equipe apresenta o toolkit de automação em ~10 minutos, demonstra ao vivo sobre o container e responde às perguntas. Depois, o encerramento amarra o eixo do curso.",
    topicos: ["toolkit", "demonstração ao vivo", "README", "encerramento"],
    marco: {
      nota: "N2",
      etapa: 2,
      instrumento: "Projeto final (toolkit + README) + apresentação com timebox de ~10 min",
      projeto: true,
    },
    leituras: [
      {
        faixa: "aprofundamento",
        fonte: "Revisão",
        titulo: "Sem leitura nova",
      },
    ],
  },
];

export const ENCONTRO_POR_NUMERO = new Map(ENCONTROS.map((e) => [e.numero, e]));
