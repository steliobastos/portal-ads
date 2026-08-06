/**
 * Conteúdo do portal — o que existe acima das disciplinas.
 *
 * A navegação global mora aqui, e não espalhada pelos layouts: acrescentar uma
 * seção ao portal é acrescentar uma linha nesta lista e criar a rota.
 */

export type ItemMenu = { href: string; rotulo: string };

export const MENU_GLOBAL: ItemMenu[] = [
  { href: "/", rotulo: "Home" },
  { href: "/disciplinas", rotulo: "Disciplinas" },
  { href: "/avisos", rotulo: "Avisos" },
  { href: "/links", rotulo: "Links úteis" },
  { href: "/sobre", rotulo: "Sobre" },
];

export const PORTAL = {
  nome: "Portal de Disciplinas",
  instituicao: "Instituto Federal de Educação, Ciência e Tecnologia do Ceará",
  campus: "Campus Horizonte",
  curso: "Tecnologia em Análise e Desenvolvimento de Sistemas",
  professor: "José Stelio Sampaio Bastos Neto",
  chamada:
    "O guia do aluno das disciplinas do curso: cronograma, material de cada encontro, mapa de leituras e critérios de avaliação — tudo num lugar só.",
  repositorio: "https://github.com/steliobastos/portal-ads",
} as const;
