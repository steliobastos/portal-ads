"use server";

import { z } from "zod";
import { conteudoDa } from "@/content";
import { clienteAdmin } from "@/lib/supabase/servidor";
import { LIMITE_PDF_BYTES } from "./datas";
import { passouDoPrazo } from "./portfolio";

/**
 * Entrega do relatório em PDF, em dois tempos.
 *
 * O arquivo não passa pelo servidor do portal: uma função da Vercel recusa
 * corpo acima de 4,5 MB, e relatório com prints passa disso fácil. Então:
 *
 * 1. `prepararEntrega` valida a equipe e devolve uma URL assinada, que só
 *    permite gravar **um** caminho, escolhido aqui, no bucket privado;
 * 2. o navegador envia o PDF direto ao Supabase por essa URL;
 * 3. `confirmarEntrega` confere que o arquivo chegou e registra a entrega.
 *
 * O bucket só aceita `application/pdf` e até 15 MB — a regra vale mesmo para
 * quem chamar a URL assinada sem passar pelo formulário.
 *
 * (Um arquivo `"use server"` só pode exportar funções assíncronas — por isso o
 * limite de tamanho mora em `datas.ts`, onde o formulário também o enxerga.)
 */

const Matricula = z
  .string()
  .transform((m) => m.replace(/\s+/g, "").toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9]{4,20}$/, "Matrícula inválida: use só letras e números."));

const Equipe = z.object({
  disciplina: z.string().max(20),
  etapa: z.union([z.literal(1), z.literal(2)]),
  fase: z.enum(["parcial", "final"]),
  equipe: z.string().trim().min(2, "Dê um nome à equipe.").max(60),
  integrantes: z
    .array(z.object({ nome: z.string().trim().min(3, "Informe o nome completo de cada integrante.").max(120), matricula: Matricula }))
    .min(2, "A equipe precisa de 2 ou 3 integrantes.")
    .max(3, "A equipe precisa de 2 ou 3 integrantes.")
    .refine((l) => new Set(l.map((i) => i.matricula)).size === l.length, "Há matrícula repetida na equipe."),
});

type EntradaEquipe = z.input<typeof Equipe>;

function entregaConfigurada(dados: z.output<typeof Equipe>) {
  return conteudoDa(dados.disciplina)?.regrasNota.entregas.find(
    (e) => e.etapa === dados.etapa && e.fase === dados.fase,
  );
}

export type ResultadoPreparo =
  | { ok: true; caminho: string; url: string }
  | { ok: false; erro: string };

export async function prepararEntrega(
  dados: EntradaEquipe & { tamanho: number; tipo: string },
): Promise<ResultadoPreparo> {
  const lido = Equipe.safeParse(dados);
  if (!lido.success) return { ok: false, erro: lido.error.issues[0].message };
  if (!entregaConfigurada(lido.data)) return { ok: false, erro: "Esta entrega não existe." };
  if (dados.tipo !== "application/pdf") return { ok: false, erro: "Envie o relatório em PDF." };
  if (!(dados.tamanho > 0 && dados.tamanho <= LIMITE_PDF_BYTES)) {
    return { ok: false, erro: "O PDF precisa ter até 15 MB. Reduza a resolução dos prints." };
  }

  const supabase = clienteAdmin();
  if (!supabase) return { ok: false, erro: "O envio de relatórios ainda não está ativo. Avise o professor." };

  const { disciplina, etapa, fase } = lido.data;
  const caminho = `${disciplina}/etapa-${etapa}/${fase}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.pdf`;
  const { data, error } = await supabase.storage.from("relatorios").createSignedUploadUrl(caminho);
  if (error) {
    console.error("Falha ao preparar envio de relatório:", error.message);
    return { ok: false, erro: "Não foi possível preparar o envio. Tente de novo em instantes." };
  }
  return { ok: true, caminho, url: data.signedUrl };
}

export type ResultadoEntrega =
  | { ok: true; protocolo: number; enviadoEm: string; atrasado: boolean }
  | { ok: false; erro: string };

export async function confirmarEntrega(
  dados: EntradaEquipe & { caminho: string },
): Promise<ResultadoEntrega> {
  const lido = Equipe.safeParse(dados);
  if (!lido.success) return { ok: false, erro: lido.error.issues[0].message };
  const entrega = entregaConfigurada(lido.data);
  if (!entrega) return { ok: false, erro: "Esta entrega não existe." };

  const { disciplina, etapa, fase, equipe, integrantes } = lido.data;

  // O caminho volta do navegador: só é aceito se tiver exatamente a forma que
  // `prepararEntrega` gera para esta mesma entrega.
  const pasta = `${disciplina}/etapa-${etapa}/${fase}`;
  const nome = dados.caminho.slice(pasta.length + 1);
  if (!dados.caminho.startsWith(`${pasta}/`) || !/^\d+-[0-9a-f]{8}\.pdf$/.test(nome)) {
    return { ok: false, erro: "Envio inválido. Recarregue a página e tente de novo." };
  }

  const supabase = clienteAdmin();
  if (!supabase) return { ok: false, erro: "O envio de relatórios ainda não está ativo." };

  const { data: objetos } = await supabase.storage.from("relatorios").list(pasta, { search: nome });
  const arquivo = objetos?.find((o) => o.name === nome);
  if (!arquivo) return { ok: false, erro: "O arquivo não chegou. Tente enviar de novo." };

  const { data, error } = await supabase
    .from("entregas_relatorio")
    .insert({
      disciplina,
      etapa,
      fase,
      equipe,
      integrantes,
      matriculas: integrantes.map((i) => i.matricula).sort(),
      arquivo: dados.caminho,
      tamanho_bytes: Number(arquivo.metadata?.size ?? 0),
    })
    .select("id, enviado_em")
    .single();

  if (error) {
    console.error("Falha ao registrar entrega de relatório:", error.message);
    return { ok: false, erro: "O arquivo chegou, mas não foi possível registrar. Tente de novo." };
  }

  return {
    ok: true,
    protocolo: data.id,
    enviadoEm: data.enviado_em,
    atrasado: passouDoPrazo(entrega.prazo, data.enviado_em),
  };
}
