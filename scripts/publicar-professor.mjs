/**
 * Publica o material do professor (`curso/**\/*.md`) na área restrita do portal.
 *
 * Esses arquivos ficam fora do git de propósito — o repositório é público, e
 * eles têm roteiros de condução e rubricas. Por isso não entram no build: vão
 * para um bucket privado do Supabase, e o painel `/professor/roteiros` lê de
 * lá, só para o professor logado.
 *
 * Espelha a pasta: arquivo novo ou alterado é enviado, arquivo apagado em
 * `curso/` é apagado do bucket.
 *
 * Uso (só na máquina do professor, que tem o .env.local):
 *   npm run professor:publicar
 */
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const BUCKET = "professor";
const RAIZ = join(process.cwd(), "curso");

const url = process.env.SUPABASE_URL;
const secreta = process.env.SUPABASE_SECRET_KEY;
if (!url || !secreta) {
  console.error("Faltam SUPABASE_URL e SUPABASE_SECRET_KEY. Rode com: npm run professor:publicar");
  process.exit(1);
}
const supabase = createClient(url, secreta, { auth: { persistSession: false } });

function listar(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return listar(caminho);
    return nome.toLowerCase().endsWith(".md") ? [caminho] : [];
  });
}

async function listarRemoto(prefixo = "") {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefixo, { limit: 1000 });
  if (error) throw error;
  const arquivos = [];
  for (const item of data) {
    const caminho = prefixo ? `${prefixo}/${item.name}` : item.name;
    // Pastas voltam sem `id` na listagem do Storage.
    if (item.id === null) arquivos.push(...(await listarRemoto(caminho)));
    else arquivos.push(caminho);
  }
  return arquivos;
}

const bucket = await supabase.storage.getBucket(BUCKET);
if (bucket.error) {
  const criado = await supabase.storage.createBucket(BUCKET, { public: false });
  if (criado.error) throw criado.error;
  console.log(`Bucket privado "${BUCKET}" criado.`);
} else if (bucket.data.public) {
  console.error(`O bucket "${BUCKET}" está PÚBLICO. Corrija no painel do Supabase antes de publicar.`);
  process.exit(1);
}

const locais = listar(RAIZ).map((c) => relative(RAIZ, c).split(sep).join("/"));
for (const caminho of locais) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, readFileSync(join(RAIZ, caminho)), {
      upsert: true,
      contentType: "text/markdown; charset=utf-8",
      cacheControl: "0",
    });
  if (error) throw new Error(`${caminho}: ${error.message}`);
}

const sobrando = (await listarRemoto()).filter((c) => !locais.includes(c));
if (sobrando.length > 0) {
  const { error } = await supabase.storage.from(BUCKET).remove(sobrando);
  if (error) throw error;
}

console.log(
  `Publicados ${locais.length} arquivos de curso/` +
    (sobrando.length ? `; removidos ${sobrando.length} que não existem mais.` : "."),
);
