import type { Quiz } from "../tipos";

/**
 * Quizzes semanais de SO: verificação de leitura + observações de laboratório.
 *
 * Extraídos uma única vez dos quizzes em HTML avulso (scripts/extrair-quizzes.mjs).
 * A partir daqui, este arquivo é a fonte — edite à mão.
 *
 * ⚠️ Não reordene alternativas de um quiz que já recebeu respostas: o banco
 * guarda o índice marcado. O número de acertos fica gravado no momento do
 * envio, então a nota não muda; o que ficaria errado é a leitura das respostas.
 */
export const QUIZZES: Quiz[] = [
  {
    "encontro": 1,
    "leituras": [
      {
        "fonte": "Laureano, Cap. 1",
        "paginas": "p. 9–17"
      },
      {
        "fonte": "Tanenbaum, 1.1",
        "paginas": "p. 3–5"
      }
    ],
    "perguntas": [
      {
        "enunciado": "No texto, \"máquina estendida\" se refere a...",
        "alternativas": [
          "O SO escondendo a complicação do hardware do programador",
          "Um computador com mais memória RAM",
          "A CPU rodando mais rápido que o normal",
          "Um tipo de disco rígido"
        ],
        "correta": 0,
        "justificativa": "É o SO entregando uma versão mais simples do hardware — visto no slide 5 (Ideia 1)."
      },
      {
        "enunciado": "O SO como \"gerenciador de recursos\" significa principalmente que ele...",
        "alternativas": [
          "Aumenta a velocidade do processador automaticamente",
          "Substitui a necessidade de memória RAM",
          "Organiza o uso ordenado de CPU, memória e disco entre processos que competem por eles",
          "É responsável apenas por rodar antivírus"
        ],
        "correta": 2,
        "justificativa": "É a segunda ideia do slide 5 — o SO arbitrando o acesso aos recursos entre processos concorrentes."
      },
      {
        "enunciado": "Na sequência de boot vista em aula, o que acontece depois que o bootloader (GRUB) localiza o kernel?",
        "alternativas": [
          "A tela de login aparece imediatamente, antes de qualquer outra coisa",
          "O hardware reinicia automaticamente",
          "O sistema volta para o BIOS/UEFI",
          "O kernel assume o controle e inicializa o gerenciamento de processos e memória"
        ],
        "correta": 3,
        "justificativa": "É a ordem da animação: POST → bootloader → kernel assume → init/systemd → login."
      }
    ],
    "observacoes": [
      {
        "enunciado": "O que você notou rodando `whoami`, `uname -a` ou `hostname` — e com qual das duas ideias isso se conecta.",
        "minimo": 40
      },
      {
        "enunciado": "O que o `ps aux | head -5` revelou sobre o que a máquina já estava fazendo antes de você chegar.",
        "minimo": 40
      },
      {
        "enunciado": "Livre: algo que te surpreendeu no `ls -la /`, no desafio bônus, ou uma dúvida que sobrou.",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 2,
    "leituras": [
      {
        "fonte": "Laureano — O Sistema de Arquivo /procfs",
        "paginas": "p. 90–94"
      },
      {
        "fonte": "Tanenbaum — O zoológico dos sistemas operacionais, 1.4",
        "paginas": "p. 24–27"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Por que o comando cat /proc/uptime mostra números diferentes a cada vez que é executado, mesmo sem ninguém editar nada?",
        "alternativas": [
          "Porque o Linux reescreve esse arquivo no disco automaticamente a cada segundo",
          "Porque /proc é um sistema de arquivos virtual — o conteúdo é gerado pelo kernel no instante da leitura, não fica armazenado em disco",
          "Porque cada leitura corrompe levemente o arquivo, alterando os números",
          "Porque o arquivo tem permissão de escrita liberada para qualquer processo do sistema"
        ],
        "correta": 1,
        "justificativa": "/proc não guarda arquivos de verdade: cada leitura é, na prática, uma pergunta feita ao kernel, que responde com o valor atual na hora — por isso o resultado muda entre uma leitura e outra."
      },
      {
        "enunciado": "Por que o mesmo Linux aparece em quase todas as categorias do 'zoológico dos sistemas operacionais' vistas em aula (servidor, computador pessoal, portátil/móvel)?",
        "alternativas": [
          "Porque o Linux é o único sistema operacional que existe atualmente",
          "Porque o hardware por trás de cada categoria (servidor, PC, celular) é sempre idêntico",
          "Porque o Linux foi adaptado para rodar sobre hardwares muito diferentes, de servidores a celulares (o Android é Linux por baixo)",
          "Porque, na prática, todas as categorias do zoológico são a mesma coisa com nomes diferentes"
        ],
        "correta": 2,
        "justificativa": "O zoológico do Tanenbaum classifica os SOs pelo tipo de hardware e uso, não pelo kernel usado — e o Linux é versátil o suficiente para rodar (adaptado) em quase todas essas categorias, do servidor ao celular."
      },
      {
        "enunciado": "Sobre a diferença entre memória RAM e disco, vista no Encontro 2, é correto afirmar que:",
        "alternativas": [
          "RAM é lenta e persistente; disco é rápido e perde os dados ao desligar",
          "RAM é rápida e volátil (perde tudo ao desligar); disco é mais lento, porém persistente",
          "Ambos são igualmente rápidos e persistentes, mudando apenas o preço",
          "O disco substitui a função da CPU quando ela está sobrecarregada"
        ],
        "correta": 1,
        "justificativa": "RAM é onde os programas em execução vivem enquanto rodam — rápida, mas volátil. Disco é mais lento, mas guarda os dados mesmo com a máquina desligada — por isso é o gargalo clássico de E/S."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Compare a saída de lscpu com cat /proc/cpuinfo. O que muda entre as duas formas de ver a mesma informação?",
        "minimo": 40
      },
      {
        "enunciado": "O que os campos \"MemFree\" e \"MemAvailable\" do /proc/meminfo sugerem sobre como o Linux gerencia memória livre?",
        "minimo": 40
      },
      {
        "enunciado": "Por que /proc/uptime muda de valor a cada leitura, mesmo sem você \"editar\" nada? Conecte com a ideia de sistema de arquivos virtual vista na aula.",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 3,
    "leituras": [
      {
        "fonte": "Laureano — Arquitetura de Sistemas Operacionais",
        "paginas": "p. 12–13"
      },
      {
        "fonte": "Laureano — Chamada de Sistema (System Call)",
        "paginas": "p. 16–17"
      },
      {
        "fonte": "Tanenbaum — Chamadas de sistema (processos e arquivos), 1.6.1–1.6.2",
        "paginas": "p. 37–40"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Segundo a leitura, qual é a principal vantagem de um sistema com arquitetura de micronúcleo em relação a um sistema monolítico?",
        "alternativas": [
          "É sempre mais rápido, pois evita chamadas de sistema",
          "Um erro em um driver de dispositivo não derruba o sistema inteiro",
          "Ele elimina a necessidade de chamadas de sistema entre processos",
          "Ele une todos os serviços em um único espaço de endereçamento para acelerar o acesso"
        ],
        "correta": 1,
        "justificativa": "No micronúcleo, drivers e serviços rodam como processos separados em modo usuário; se um deles falhar, apenas aquele serviço é afetado — diferente do monolítico, onde tudo compartilha o mesmo espaço privilegiado."
      },
      {
        "enunciado": "Por que uma aplicação comum, como um editor de texto, não pode executar instruções como HALT ou acessar o disco diretamente?",
        "alternativas": [
          "Porque essas instruções não existem nos processadores modernos",
          "Porque o modo usuário restringe o acesso a instruções que poderiam comprometer o sistema, exigindo uma chamada de sistema para tarefas privilegiadas",
          "Porque só o modo privilegiado tem acesso à memória RAM",
          "Porque isso é uma limitação exclusiva do Windows, e não existe no Linux"
        ],
        "correta": 1,
        "justificativa": "O modo usuário existe justamente para impedir que uma aplicação comum comprometa o sistema; para tarefas que exigem acesso privilegiado, ela precisa 'pedir' via chamada de sistema, que transfere o controle pro núcleo."
      },
      {
        "enunciado": "Qual par de chamadas de sistema é usado, respectivamente, para criar um novo processo e para substituir o programa que um processo está executando?",
        "alternativas": [
          "open e close",
          "read e write",
          "fork e exec",
          "wait e exit"
        ],
        "correta": 2,
        "justificativa": "fork cria uma cópia do processo atual; exec substitui o programa em execução por outro. wait e exit também lidam com processos, mas servem para esperar término e encerrar — não para criar ou substituir."
      }
    ],
    "observacoes": [
      {
        "enunciado": "O que você percebeu comparando as chamadas de sistema entre dois programas diferentes (ex: ls e date)?",
        "minimo": 40
      },
      {
        "enunciado": "O que mudou entre o tempo/recurso do contêiner Docker e da sua máquina virtual?",
        "minimo": 40
      },
      {
        "enunciado": "Algo que te surpreendeu ou uma dúvida que sobrou do Encontro 3",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 4,
    "leituras": [
      {
        "fonte": "Laureano — Máquinas Virtuais",
        "paginas": "p. 70–77"
      },
      {
        "fonte": "Tanenbaum — Hipervisores tipo 1 e tipo 2 · Nuvens",
        "paginas": "p. 329–330 e 342–344"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Segundo a leitura, qual é a principal razão histórica para a virtualização ter surgido, décadas antes de containers existirem?",
        "alternativas": [
          "Consolidar servidores caros e subutilizados, isolando ambientes diferentes num único hardware físico",
          "Tornar os programas mais rápidos do que rodando diretamente no hardware",
          "Eliminar a necessidade de qualquer sistema operacional",
          "Substituir a memória RAM por armazenamento em disco"
        ],
        "correta": 0,
        "justificativa": "A virtualização nasceu pra consolidar servidores caros e subutilizados, isolar ambientes de clientes diferentes e testar múltiplos SOs sem comprar uma máquina física pra cada um."
      },
      {
        "enunciado": "Qual é a diferença entre um hipervisor tipo 1 (bare-metal) e um tipo 2 (hospedado)?",
        "alternativas": [
          "Tipo 1 só existe na nuvem; tipo 2 só existe em notebooks pessoais",
          "Tipo 1 roda direto sobre o hardware, sem um SO anfitrião por baixo; tipo 2 roda como um programa comum dentro de um SO anfitrião já existente",
          "Tipo 1 é sempre mais lento que tipo 2, em qualquer cenário",
          "Não existe diferença técnica real — é só uma questão de marketing dos fabricantes"
        ],
        "correta": 1,
        "justificativa": "Hipervisores tipo 1 (ex: VMware ESXi, Hyper-V, Xen) são a camada mais baixa, direto no hardware — usados em data centers. Tipo 2 (ex: VirtualBox) roda como um aplicativo dentro de um SO anfitrião comum."
      },
      {
        "enunciado": "Por que uma máquina virtual costuma ser bem mais pesada para inicializar do que um container, mesmo cumprindo um papel parecido de isolamento?",
        "alternativas": [
          "Porque VMs usam mais núcleos de CPU simultaneamente do que containers",
          "Porque cada VM carrega um núcleo (kernel) inteiro e independente, enquanto o container compartilha o núcleo do host via namespaces e cgroups",
          "Porque VMs não podem ser desligadas depois de ligadas",
          "Porque containers, na prática, não fazem nenhum tipo de isolamento"
        ],
        "correta": 1,
        "justificativa": "VM precisa dar boot num núcleo completo, do zero. Container só empresta, via namespaces e cgroups, um pedaço isolado do núcleo que já está rodando no host — por isso é ordens de grandeza mais rápido e mais leve."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Qual a diferença entre uma imagem (docker images) e um container (docker ps -a)? Use suas próprias palavras.",
        "minimo": 40
      },
      {
        "enunciado": "O que aconteceu quando você rodou docker build? Conecte com a diferença entre RUN e CMD no Dockerfile.",
        "minimo": 40
      },
      {
        "enunciado": "Algo que te surpreendeu ou uma dúvida que sobrou do Encontro 4",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 5,
    "leituras": [
      {
        "fonte": "Laureano — Programas e Processos + Informações no /proc",
        "paginas": "p. 99–106"
      },
      {
        "fonte": "Tanenbaum — Processos, 2.1",
        "paginas": "p. 59–67"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Segundo a leitura, qual afirmação descreve corretamente a diferença entre um programa e um processo?",
        "alternativas": [
          "Programa e processo são sinônimos — todo processo é sempre chamado de programa",
          "Programa é um arquivo estático no disco; processo é esse programa em execução, com seu próprio PID, memória e estado",
          "Processo é sempre mais lento do que o programa que o originou",
          "Um processo só existe enquanto o disco estiver sendo lido"
        ],
        "correta": 1,
        "justificativa": "Programa é um arquivo parado no disco. Processo é o programa em execução, com identidade própria: PID, contador de instruções, memória isolada e um estado — por isso dois processos do mesmo programa são independentes entre si."
      },
      {
        "enunciado": "Segundo o modelo de processos do Tanenbaum, para onde um processo bloqueado vai assim que o evento que ele esperava (por exemplo, uma leitura de disco) termina?",
        "alternativas": [
          "Direto para o estado rodando, furando a fila de outros processos",
          "O processo é encerrado automaticamente",
          "Para o estado pronto, esperando o escalonador liberar a CPU",
          "Ele permanece bloqueado até o computador ser reiniciado"
        ],
        "correta": 2,
        "justificativa": "Um processo nunca pula direto de bloqueado pra rodando — ele sempre volta pro estado pronto primeiro, entrando na fila junto com os demais processos que aguardam a CPU."
      },
      {
        "enunciado": "O que o campo PPid, visto em cat /proc/<pid>/status, representa?",
        "alternativas": [
          "O número de processos filhos que aquele processo criou",
          "A prioridade do processo no escalonador",
          "O tempo, em segundos, que o processo já está em execução",
          "O PID do processo pai que criou aquele processo"
        ],
        "correta": 3,
        "justificativa": "PPid é o PID do processo pai — a informação que permite reconstruir a árvore genealógica de processos (a mesma que ferramentas como o pstree desenham na tela)."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Qual a diferença entre o que ps aux mostra e o que top mostra? Cite uma vantagem de cada um.",
        "minimo": 40
      },
      {
        "enunciado": "Compare o PID do processo sleep 300 visto no host (ps aux) com o PID visto dentro do container (docker exec ... ps aux). Por que eles são diferentes?",
        "minimo": 40
      },
      {
        "enunciado": "Algo que te surpreendeu ou uma dúvida que sobrou do Encontro 5",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 6,
    "leituras": [
      {
        "fonte": "Laureano — Multiplexação do processador + Entrada/saída padrão de um processo",
        "paginas": "p. 106–108 e 120–126"
      },
      {
        "fonte": "Tanenbaum — Escalonamento (recorte introdutório)",
        "paginas": "p. 103–107"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Qual afirmação descreve corretamente a diferença entre um processo CPU-bound e um I/O-bound?",
        "alternativas": [
          "CPU-bound e I/O-bound são só nomes diferentes para o mesmo comportamento de processo",
          "CPU-bound tem surtos longos de CPU e poucas pausas de E/S; I/O-bound tem surtos curtos de CPU e espera muito por E/S",
          "Um processo I/O-bound sempre usa mais CPU que um processo CPU-bound",
          "Um processo é CPU-bound ou I/O-bound apenas quando roda dentro de um container"
        ],
        "correta": 1,
        "justificativa": "Todo processo alterna entre surtos de CPU e de E/S — o que muda é a proporção. CPU-bound (como compactar um arquivo) passa a maior parte do tempo calculando; I/O-bound (como copiar um arquivo) passa a maior parte do tempo esperando o disco ou a rede responder."
      },
      {
        "enunciado": "Segundo a leitura, em qual destas situações o escalonador do SO NÃO é necessariamente acionado?",
        "alternativas": [
          "Um processo novo é criado",
          "Um processo termina sua execução",
          "Um processo bloqueia esperando por E/S",
          "Um processo soma duas variáveis que já estão na sua própria memória"
        ],
        "correta": 3,
        "justificativa": "O escalonador decide quando um processo é criado, quando termina, quando bloqueia esperando E/S e quando chega uma interrupção de E/S (Tanenbaum, 2.4.1); nos sistemas preemptivos, também a cada interrupção de relógio que encerra a fatia de tempo. Somar duas variáveis na própria memória não gera chamada de sistema nem interrupção: o processo simplesmente continua na CPU."
      },
      {
        "enunciado": "Por que o comando `ls arquivo_inexistente 2> erro.txt` não mostra nenhuma mensagem de erro na tela?",
        "alternativas": [
          "Porque o comando `ls` não gera mensagens de erro",
          "Porque stdout e stderr são o mesmo canal, e o redirecionamento captura tudo",
          "Porque `2>` redireciona especificamente o canal de erro (stderr, descritor 2) para o arquivo, deixando a tela sem essa saída",
          "Porque o arquivo erro.txt impede o comando de rodar"
        ],
        "correta": 2,
        "justificativa": "stdout (descritor 1) e stderr (descritor 2) são canais independentes. O operador `2>` redireciona só o stderr — por isso a mensagem de erro vai parar no arquivo, e nada aparece na tela nesse caso."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Compare o que você viu no top entre o yes (CPU-bound) e o dd (I/O-bound). Qual consumiu mais CPU, e por quê?",
        "minimo": 40
      },
      {
        "enunciado": "O que o docker stats mostrou sobre o container statsdemo? Compare com o que você esperava de um processo quase parado.",
        "minimo": 40
      },
      {
        "enunciado": "Algo que te surpreendeu ou uma dúvida que sobrou do Encontro 6",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 7,
    "leituras": [
      {
        "fonte": "Tanenbaum — Condições de corrida e Regiões críticas (2.3.1–2.3.2)",
        "paginas": "p. 82–84"
      }
    ],
    "perguntas": [
      {
        "enunciado": "O que caracteriza uma condição de corrida (race condition)?",
        "alternativas": [
          "Um processo que roda mais rápido que outro, sem nenhuma consequência prática",
          "Uma situação em que o resultado final de dois ou mais processos depende da ordem exata em que eles acessam um dado compartilhado",
          "Um erro de sintaxe que só acontece em containers",
          "Um processo que nunca termina de executar"
        ],
        "correta": 1,
        "justificativa": "Condição de corrida é quando o resultado depende de \"quem chega primeiro\" numa disputa por um recurso compartilhado — cada processo, isoladamente, está correto; o problema é a simultaneidade."
      },
      {
        "enunciado": "No exemplo dos dois caixas de banco somando R$ 100 na mesma conta ao mesmo tempo, por que o saldo final pode ficar errado?",
        "alternativas": [
          "Porque a operação de somar não é uma etapa só — é ler, calcular e gravar, e o segundo caixa pode ler o saldo antes do primeiro terminar de gravar",
          "Porque bancos nunca permitem duas operações simultâneas",
          "Porque o valor de R$ 100 é grande demais para o sistema processar",
          "Porque cada caixa usa uma conta bancária diferente"
        ],
        "correta": 0,
        "justificativa": "\"Somar R$ 100\" envolve três passos (ler, calcular, gravar). Se o escalonador trocar de processo entre esses passos, o segundo processo pode ler um valor desatualizado — perdendo a atualização do primeiro quando gravar por cima."
      },
      {
        "enunciado": "Qual das opções abaixo é um dos quatro requisitos de uma boa solução de exclusão mútua, segundo a leitura?",
        "alternativas": [
          "Um processo fora da região crítica pode bloquear outros processos, se for realmente necessário",
          "Nenhum processo deve esperar para sempre pra entrar na região crítica",
          "A solução pode assumir que todos os processos rodam exatamente na mesma velocidade",
          "É aceitável que dois processos estejam na região crítica ao mesmo tempo, desde que seja raro"
        ],
        "correta": 1,
        "justificativa": "Um dos quatro requisitos é que nenhum processo espere para sempre pra entrar na região crítica — junto com nunca dois processos dentro dela ao mesmo tempo, não assumir nada sobre velocidades relativas, e não deixar que processos fora da região crítica bloqueiem os demais."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Quais resultados você obteve rodando o contador_concorrente.sh várias vezes? Por que o número final varia mesmo rodando exatamente o mesmo script?",
        "minimo": 40
      },
      {
        "enunciado": "Se você tivesse que corrigir o script pra sempre dar 1000, o que impediria os dois processos de ler o saldo ao mesmo tempo?",
        "minimo": 40
      },
      {
        "enunciado": "Como foi o ensaio do container da sua equipe para a N2? Algo travou, ou uma dúvida que sobrou do Encontro 7",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 9,
    "leituras": [
      {
        "fonte": "Laureano — Utilizando o /proc (Cap. 9)",
        "paginas": "p. 94–98"
      },
      {
        "fonte": "Tanenbaum — A noção de um espaço de endereçamento + Swapping (3.2.1–3.2.2)",
        "paginas": "p. 128–131"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Numa máquina Linux saudável, o comando free -h mostra pouca memória na coluna \"free\" mas bastante em \"available\". O que isso significa?",
        "alternativas": [
          "A máquina está prestes a ficar sem memória e precisa de intervenção urgente",
          "É normal: o Linux usa memória ociosa como cache de disco e a devolve assim que algum processo precisar — \"available\" é o número que realmente indica quanto dá pra alocar",
          "Houve um vazamento de memória que já consumiu quase tudo",
          "O sistema está usando swap intensamente"
        ],
        "correta": 1,
        "justificativa": "O Linux aproveita memória ociosa como cache de disco de propósito — cache alto é desejável, não é problema. A coluna \"available\" já desconta esse cache reciclável e mostra quanto realmente pode ser alocado agora."
      },
      {
        "enunciado": "Segundo a leitura, para que serve o espaço de endereçamento que o SO dá a cada processo?",
        "alternativas": [
          "Para que todos os processos compartilhem os mesmos endereços de memória e possam trocar dados livremente",
          "Para acelerar o acesso ao disco rígido",
          "Para dar a cada processo a ilusão de ter a memória só pra si, isolando-o dos demais — dois processos podem usar o mesmo endereço virtual e estarem em lugares físicos diferentes",
          "Para eliminar a necessidade de memória RAM no computador"
        ],
        "correta": 2,
        "justificativa": "O espaço de endereçamento é uma abstração: cada processo enxerga a memória como se fosse toda dele, e o SO traduz endereços virtuais em físicos. É isso que impede um processo de ler ou corromper a memória de outro."
      },
      {
        "enunciado": "Um container Docker foi encerrado e o docker ps -a mostra \"Exited (137)\". O que isso indica com mais probabilidade?",
        "alternativas": [
          "O container terminou normalmente, com sucesso",
          "Houve erro de sintaxe no Dockerfile",
          "O container não conseguiu baixar a imagem do Docker Hub",
          "O processo foi morto pelo OOM Killer por ultrapassar o limite de memória disponível"
        ],
        "correta": 3,
        "justificativa": "137 é 128 + 9: o processo recebeu SIGKILL, o sinal que o OOM Killer usa. Entre as alternativas, é a única que produz esse código. Quando o container ultrapassa o limite de memória, o kernel o mata na hora, sem chance de salvar estado. Para ter certeza (um docker kill também dá 137), confira docker inspect: OOMKilled precisa ser true."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Na sua VM, qual a diferença entre os valores de \"free\" e \"available\" no free -h? Por que essa diferença existe?",
        "minimo": 40
      },
      {
        "enunciado": "O que aconteceu com o container memtest e por quê? O que o código de saída 137 indica?",
        "minimo": 40
      },
      {
        "enunciado": "Algo que te surpreendeu ou uma dúvida que sobrou do Encontro 9",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 10,
    "leituras": [
      {
        "fonte": "Tanenbaum — Paginação (3.3.1)",
        "paginas": "p. 134–136"
      },
      {
        "fonte": "Laureano — Utilizando o /proc (releitura de apoio)",
        "paginas": "p. 94–98"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Um servidor está com a CPU em 15%, a aplicação quase não lê nem grava arquivos, e mesmo assim está extremamente lento. Qual diagnóstico é mais provável?",
        "alternativas": [
          "A CPU está superdimensionada e precisa ser reduzida",
          "Thrashing: falta RAM, e o sistema passa a maior parte do tempo trocando páginas entre memória e disco em vez de trabalhar",
          "O problema certamente está na aplicação, já que nenhum recurso do servidor está saturado",
          "É necessário desligar o swap para melhorar o desempenho"
        ],
        "correta": 1,
        "justificativa": "CPU baixa não significa máquina ociosa — ela pode estar esperando disco. No thrashing, o SO expulsa páginas que serão pedidas de volta logo em seguida, criando um ciclo de page faults que consome o tempo do sistema sem produzir trabalho útil. O disco trabalha muito, mas com swap, não com os arquivos da aplicação — por isso quem olha só a aplicação não vê."
      },
      {
        "enunciado": "O que é um page fault, segundo a leitura?",
        "alternativas": [
          "Um erro de programação que trava o processo imediatamente",
          "Uma falha física na memória RAM que exige troca do hardware",
          "Uma interrupção normal disparada quando o processo acessa uma página que não está carregada na RAM — o SO busca a página e devolve o controle ao processo",
          "Um sinal de que o disco rígido está corrompido"
        ],
        "correta": 2,
        "justificativa": "Page fault não é erro, apesar do nome — é operação normal e constante. O problema nunca é a existência de page faults, e sim a frequência dos major faults (que exigem ir ao disco, milhares de vezes mais lento que a RAM)."
      },
      {
        "enunciado": "Por que impor um limite de memória (--memory) a um container é considerado boa prática, mesmo sabendo que isso pode fazer o container ser morto?",
        "alternativas": [
          "Porque transforma uma falha global e imprevisível (um serviço consumindo toda a RAM e degradando todos os outros) numa falha local, contida e visível",
          "Porque aumenta a velocidade de processamento do container",
          "Porque impede completamente que vazamentos de memória aconteçam no código",
          "Porque reduz o tamanho da imagem Docker no disco"
        ],
        "correta": 0,
        "justificativa": "O limite não corrige o vazamento — ele contém o estrago. Sem limite, um serviço problemático derruba a máquina inteira e afeta todos os demais; com limite, ele morre sozinho, é reiniciado pelo orquestrador, e o incidente fica isolado e detectável."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Quantos page faults minor e major seu comando gerou? Por que a diferença entre os dois números é tão grande?",
        "minimo": 40
      },
      {
        "enunciado": "Qual foi o menor limite de memória em que o container ainda funcionou? Por que não seria prudente usar exatamente esse valor em produção?",
        "minimo": 40
      },
      {
        "enunciado": "Algo que te surpreendeu ou uma dúvida que sobrou do Encontro 10",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 11,
    "leituras": [
      {
        "fonte": "Laureano — Sistema de Arquivos: partições, arquivos e diretórios (Cap. 5)",
        "paginas": "p. 39–43"
      },
      {
        "fonte": "Tanenbaum — Princípios do software de E/S (5.2)",
        "paginas": "p. 243–246"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Por que a E/S é considerada a principal fonte de latência na maioria dos sistemas?",
        "alternativas": [
          "Porque os discos modernos são mal fabricados",
          "Porque o acesso a disco é ordens de grandeza mais lento que o acesso à RAM — enquanto o disco responde, a CPU poderia ter executado milhões de instruções",
          "Porque a E/S sempre exige mais processamento de CPU que qualquer cálculo",
          "Porque o sistema de arquivos ocupa muito espaço em memória"
        ],
        "correta": 1,
        "justificativa": "A diferença não é de grau, é de ordem de grandeza: RAM responde em ~100 nanossegundos, um HDD em ~10 milissegundos — cerca de 100.000 vezes mais lento. É por isso que processos I/O-bound passam a maior parte do tempo bloqueados, e por que a multiplexação da CPU existe."
      },
      {
        "enunciado": "Num incidente de \"disco cheio\", qual é a divisão de trabalho correta entre os comandos df e du?",
        "alternativas": [
          "df mostra qual partição está cheia; du mostra o que, dentro dela, está ocupando o espaço",
          "df e du fazem exatamente a mesma coisa, com nomes diferentes",
          "df mostra os arquivos individuais; du mostra o total do disco",
          "du deve ser usado primeiro, sempre na raiz do sistema, e o df só depois"
        ],
        "correta": 0,
        "justificativa": "São ferramentas complementares: o df (disk free) responde \"qual sistema de arquivos encheu\", e o du (disk usage) responde \"quem está ocupando lugar dentro dele\". Usar na ordem certa — df primeiro, du depois e em diretórios específicos — economiza tempo no incidente."
      },
      {
        "enunciado": "Um container gravou um arquivo e depois foi removido com docker rm. Sem volume montado, o que acontece com esse arquivo?",
        "alternativas": [
          "Ele é automaticamente movido para o diretório /var/backups do host",
          "Ele permanece disponível para qualquer novo container da mesma imagem",
          "Ele é perdido, porque foi gravado na camada de escrita do próprio container, que é destruída junto com ele",
          "Ele é enviado ao Docker Hub junto com a imagem"
        ],
        "correta": 2,
        "justificativa": "Container é efêmero por natureza: dados gravados na sua camada de escrita morrem junto com ele. Para persistir, é preciso montar um volume (-v), que grava no disco do host e sobrevive à remoção do container — é assim que se roda banco de dados ou qualquer dado que não pode se perder."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Qual a diferença entre o que o df e o du respondem? Em que ordem você usaria os dois num incidente de \"disco cheio\"?",
        "minimo": 40
      },
      {
        "enunciado": "O que aconteceu com o arquivo no container sem volume e no container com volume? Por que a diferença, se o comando era praticamente o mesmo?",
        "minimo": 40
      },
      {
        "enunciado": "Algo que te surpreendeu ou uma dúvida que sobrou do Encontro 11",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 12,
    "leituras": [
      {
        "fonte": "Laureano — Comandos Básicos (Cap. 4) + Comandos para diretórios e arquivos (Cap. 5)",
        "paginas": "p. 33–38 e 43–53"
      },
      {
        "fonte": "Tanenbaum — O interpretador de comandos, shell (1.5.6)",
        "paginas": "p. 32–33"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Segundo a leitura, qual afirmação descreve corretamente o que é o shell?",
        "alternativas": [
          "É a parte central do kernel, responsável por gerenciar processos e memória",
          "É um programa comum que interpreta os comandos digitados e pede ao kernel que os execute — por isso existem vários shells diferentes e é possível trocar de um para outro",
          "É um componente de hardware que traduz comandos em sinais elétricos",
          "É um driver de dispositivo que controla o teclado"
        ],
        "correta": 1,
        "justificativa": "O shell não faz parte do núcleo do SO — é apenas mais um programa em espaço de usuário. Ele lê o que você digita, expande coringas, monta pipes e solicita ao kernel (via chamadas de sistema) a execução. É justamente por não ser parte do kernel que se pode substituí-lo."
      },
      {
        "enunciado": "Ao executar rm *.log, quem é responsável por expandir o coringa * e determinar quais arquivos serão afetados?",
        "alternativas": [
          "O comando rm, que recebe o asterisco e decide internamente o que apagar",
          "O kernel, durante a chamada de sistema de remoção",
          "O shell, que substitui o padrão pela lista de arquivos correspondentes antes de chamar o rm",
          "O sistema de arquivos, ao receber a solicitação"
        ],
        "correta": 2,
        "justificativa": "A expansão (globbing) é feita pelo shell antes do comando ser executado — o rm recebe a lista de nomes já pronta e nunca vê o asterisco. É por isso que testar o padrão com echo ou ls antes mostra exatamente o que seria afetado: os três comandos recebem a mesma lista expandida."
      },
      {
        "enunciado": "Um script de monitoramento grava resultados num arquivo de log a cada execução. Qual operador de redirecionamento ele deve usar, e por quê?",
        "alternativas": [
          ">>, porque acrescenta ao final do arquivo, preservando as execuções anteriores",
          ">, porque substitui o conteúdo e mantém o arquivo sempre limpo e pequeno",
          "|, porque encana a saída diretamente para o arquivo",
          "2>, porque garante que tanto a saída normal quanto os erros sejam gravados"
        ],
        "correta": 0,
        "justificativa": "O >> acrescenta ao final, preservando o histórico; o > substitui todo o conteúdo. Usar > num script de log significa descartar silenciosamente tudo que foi registrado antes — é a causa clássica do problema \"meu script apagou o log inteiro\"."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Por que testar um coringa com echo ou ls antes de usá-lo num rm é uma boa prática? Quem expande o coringa: o shell ou o comando?",
        "minimo": 40
      },
      {
        "enunciado": "Qual a diferença prática entre > e >>? Descreva uma situação real em que usar o errado causaria um problema sério.",
        "minimo": 40
      },
      {
        "enunciado": "O que você notou ao usar os comandos dentro do container em vez do host? Ou uma dúvida que sobrou do Encontro 12",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 13,
    "leituras": [
      {
        "fonte": "Roteiro de Laboratório do Encontro 13 (leitura obrigatória — nenhum livro-base cobre shell script)",
        "paginas": "documento completo"
      },
      {
        "fonte": "Complementar do PUD: Negus & Bresnahan, Linux a Bíblia; Mendonça & Araújo, Shell Linux",
        "paginas": "opcional"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Num script, para que serve a construção VAR=$(comando)?",
        "alternativas": [
          "Para exibir a saída do comando diretamente na tela, sem guardá-la",
          "Para executar o comando e guardar a saída dele dentro da variável, permitindo que o script compare e decida com base nesse valor",
          "Para executar o comando em segundo plano, liberando o terminal",
          "Para transformar a variável num comando executável"
        ],
        "correta": 1,
        "justificativa": "A substituição de comando executa o que está dentro dos parênteses e substitui a expressão pela saída produzida. É o que permite um script reagir ao estado real da máquina — sem ela, o script só conseguiria imprimir resultados, nunca compará-los ou decidir a partir deles."
      },
      {
        "enunciado": "Por que é recomendado escrever if [ \"$USO\" -gt \"$LIMITE\" ] com aspas, em vez de if [ $USO -gt $LIMITE ]?",
        "alternativas": [
          "Porque as aspas fazem o script executar mais rápido",
          "Porque sem aspas o bash converte os valores para texto e a comparação numérica falha",
          "Porque as aspas são exigidas pela sintaxe e o script não roda sem elas",
          "Porque se a variável estiver vazia, sem aspas a linha vira um teste malformado e quebra o script — com aspas, ela falha de forma controlada"
        ],
        "correta": 3,
        "justificativa": "Se a variável estiver vazia, sem aspas a expansão resulta em algo como [ -gt 80 ], que é sintaticamente inválido e interrompe o script. Com aspas, resulta em [ \"\" -gt \"80\" ], que falha de forma controlada. A mesma regra protege contra nomes de arquivo com espaços."
      },
      {
        "enunciado": "O que o código de saída de um script indica, e como ele é usado?",
        "alternativas": [
          "Indica quantas linhas o script executou; é usado para medir desempenho",
          "0 significa sucesso e qualquer outro valor indica erro; é o que permite encadear comandos com && e || e sinalizar falhas a quem chamou o script",
          "Indica o número de arquivos que o script modificou",
          "É um identificador único do script, semelhante ao PID de um processo"
        ],
        "correta": 1,
        "justificativa": "Por convenção, 0 é sucesso e qualquer valor diferente é erro. É esse número que o operador && consulta para decidir se executa o próximo comando — a mesma lógica usada desde o Encontro 5 — e é assim que ferramentas de agendamento e pipelines detectam que algo falhou."
      }
    ],
    "observacoes": [
      {
        "enunciado": "O que a construção $(...) faz, e por que ela é essencial para um script de monitoramento? Use a linha do USO como exemplo.",
        "minimo": 40
      },
      {
        "enunciado": "Qual a vantagem de usar uma função log() em vez de repetir echo em vários pontos do script?",
        "minimo": 40
      },
      {
        "enunciado": "O que aconteceu ao rodar o garante_container.sh duas vezes seguidas? Por que essa propriedade é desejável num script de automação?",
        "minimo": 40
      }
    ]
  },
  {
    "encontro": 14,
    "leituras": [
      {
        "fonte": "Laureano — Permissões em arquivos (Cap. 6) + Administração de Usuários (Cap. 8)",
        "paginas": "p. 62–69 e 81–89"
      },
      {
        "fonte": "Enunciado do Projeto Integrador — Etapa 2 (leitura obrigatória)",
        "paginas": "documento completo"
      }
    ],
    "perguntas": [
      {
        "enunciado": "Qual é a pergunta mais importante para saber se uma estratégia de backup realmente funciona?",
        "alternativas": [
          "Com que frequência o backup é executado?",
          "O backup já foi restaurado alguma vez?",
          "Qual é o tamanho total dos arquivos de backup?",
          "Qual formato de compactação foi utilizado?"
        ],
        "correta": 1,
        "justificativa": "Frequência e local de armazenamento importam, mas um backup que nunca foi restaurado é apenas um arquivo de utilidade desconhecida — pode estar vazio, corrompido ou com estrutura de caminhos inutilizável. O teste de restauração é o único que responde \"eu tenho backup?\"."
      },
      {
        "enunciado": "Por que scripts agendados no cron devem sempre usar caminhos absolutos?",
        "alternativas": [
          "Porque caminhos absolutos são executados mais rapidamente pelo sistema",
          "Porque o cron não aceita a sintaxe de caminhos relativos e recusa a linha",
          "Porque o cron roda num ambiente reduzido, sem as variáveis do shell interativo — um caminho relativo pode não ser resolvido como se espera, causando o clássico \"funciona no terminal mas não no cron\"",
          "Porque caminhos absolutos consomem menos memória durante a execução"
        ],
        "correta": 2,
        "justificativa": "O cron executa num ambiente enxuto, com variáveis e diretório de trabalho diferentes dos de uma sessão interativa. Por isso o til (~) e caminhos relativos podem não apontar para onde o autor imagina — é a causa nº 1 de tarefas agendadas que silenciosamente não funcionam."
      },
      {
        "enunciado": "Por que rodar scripts de automação com o máximo de privilégio (como root) \"porque é mais fácil\" é considerado prática de risco?",
        "alternativas": [
          "Porque scripts executados como root rodam mais lentamente",
          "Porque o Linux impede que scripts rodem como root por padrão",
          "Porque isso impede o uso de agendamento via cron",
          "Porque um erro no script — como um rm -rf com variável vazia — passa a ter poder de destruir o sistema inteiro, em vez de falhar de forma limitada"
        ],
        "correta": 3,
        "justificativa": "O princípio do menor privilégio limita o estrago de um erro. Um rm -rf \"$DIR\"/ com $DIR vazio apaga a raiz quando executado como root — e é exatamente por isso que as regras de usar aspas e validar variáveis antes de agir não são preciosismo, e sim proteção."
      }
    ],
    "observacoes": [
      {
        "enunciado": "Por que testar a restauração é parte essencial do backup, e não um passo opcional? O que seu teste revelou?",
        "minimo": 40
      },
      {
        "enunciado": "Por que o cron exige caminho absoluto? O que aconteceria se você usasse ~/backup.sh no agendamento?",
        "minimo": 40
      },
      {
        "enunciado": "Qual serviço sua equipe escolheu operar no projeto final, e por quê? O que pretendem guardar em backup e monitorar?",
        "minimo": 40
      }
    ]
  }
];
