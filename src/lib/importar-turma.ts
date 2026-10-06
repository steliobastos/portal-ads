/**
 * Importação da lista da turma a partir do CSV do diário — funções puras, sem
 * banco, para poderem ser testadas. Quem grava é a aba Turma do painel.
 *
 * O CSV é o que o diário exporta: separado por `;`, com uma coluna de
 * matrícula e uma de nome. Os demais campos (faltas, frequência, notas) são
 * ignorados de propósito: nota é assunto do diário, não do portal.
 *
 * A regra é "tudo ou nada": se uma linha estiver fora do formato, nada é
 * gravado. Importar uma turma pela metade é pior do que não importar.
 */

export type AlunoCsv = { matricula: string; nome: string };
export type AlunoAtual = AlunoCsv & { ativo: boolean };

/**
 * O diário exporta em UTF-8, mas um CSV aberto e salvo no Excel volta em
 * Windows-1252 — e os acentos dos nomes viram lixo. Tenta UTF-8 estrito
 * primeiro e cai para Windows-1252 se os bytes não forem UTF-8 válido.
 */
export function decodificarCsv(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

/** Uma linha de CSV separado por `;`, com suporte a campo entre aspas. */
function campos(linha: string): string[] {
  const lista: string[] = [];
  let atual = "";
  let aspas = false;
  for (const c of linha) {
    if (c === '"') aspas = !aspas;
    else if (c === ";" && !aspas) {
      lista.push(atual);
      atual = "";
    } else atual += c;
  }
  lista.push(atual);
  return lista.map((c) => c.trim());
}

function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Os alunos do arquivo e, se houver, por que ele não pode ser importado. */
export function lerTurmaCsv(texto: string): { alunos: AlunoCsv[]; problemas: string[] } {
  // Planilha costuma salvar com marca de ordem de bytes (BOM) na frente.
  const limpo = texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;
  const linhas = limpo.split(/\r?\n/);

  const cabecalho = campos(linhas[0] ?? "").map(semAcento);
  const colMatricula = cabecalho.findIndex((c) => c.includes("matricula"));
  const colNome = cabecalho.findIndex((c) => c === "nome" || c.includes("nome do aluno"));
  if (colMatricula < 0 || colNome < 0) {
    return {
      alunos: [],
      problemas: [`Não achei as colunas de matrícula e nome no cabeçalho (li: ${linhas[0] ?? ""}).`],
    };
  }

  const alunos: AlunoCsv[] = [];
  const problemas: string[] = [];
  for (const [i, linha] of linhas.entries()) {
    if (i === 0 || !linha.trim()) continue;
    const valores = campos(linha);
    const matricula = (valores[colMatricula] ?? "").replace(/\s+/g, "").toUpperCase();
    const nome = (valores[colNome] ?? "").replace(/\s+/g, " ").trim();
    if (!matricula && !nome) continue;
    if (!/^[A-Z0-9]{4,20}$/.test(matricula) || nome.length < 3) {
      problemas.push(`Linha ${i + 1}: matrícula "${matricula}", nome "${nome}".`);
    } else if (alunos.some((a) => a.matricula === matricula)) {
      problemas.push(`Linha ${i + 1}: matrícula ${matricula} repetida no arquivo.`);
    } else {
      alunos.push({ matricula, nome });
    }
  }

  if (alunos.length === 0 && problemas.length === 0) {
    problemas.push("O arquivo não tem nenhuma linha de aluno.");
  }
  return { alunos, problemas };
}

/**
 * O que a importação vai mudar na lista atual. É o que a prévia mostra antes
 * de gravar — principalmente `saem`: com o arquivo errado, a turma inteira
 * sairia da lista.
 */
export function compararTurma(atual: AlunoAtual[], arquivo: AlunoCsv[]) {
  const porMatricula = new Map(atual.map((a) => [a.matricula, a]));
  const noArquivo = new Set(arquivo.map((a) => a.matricula));

  const novos: AlunoCsv[] = [];
  const renomeados: { matricula: string; de: string; para: string }[] = [];
  const voltam: AlunoCsv[] = [];
  let iguais = 0;

  for (const aluno of arquivo) {
    const antes = porMatricula.get(aluno.matricula);
    if (!antes) novos.push(aluno);
    else if (!antes.ativo) voltam.push(aluno);
    else if (antes.nome !== aluno.nome) {
      renomeados.push({ matricula: aluno.matricula, de: antes.nome, para: aluno.nome });
    } else iguais++;
  }

  const saem = atual
    .filter((a) => a.ativo && !noArquivo.has(a.matricula))
    .map(({ matricula, nome }) => ({ matricula, nome }));

  return { novos, renomeados, voltam, saem, iguais };
}
