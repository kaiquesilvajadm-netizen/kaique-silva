import * as XLSX from 'xlsx'
import type { AbaImportada } from '@/types/metricas'

// Agente de Importação
// Lê o arquivo de planilha (.xlsx, .xls ou .csv) enviado pelo usuário e
// transforma cada aba em uma lista de linhas "cruas" (ainda não limpas).
// TODO: quando a planilha de instruções chegar, confirmar se o layout real
// (nomes de aba, linha de cabeçalho, abas extras de metadados etc.) bate
// com o que este agente assume hoje (cabeçalho = primeira linha de cada aba).
export async function importarPlanilha(arquivo: File): Promise<AbaImportada[]> {
  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  const workbook = XLSX.read(bytes, { type: 'array' })

  return workbook.SheetNames.map((nomeAba) => criarAbaImportada(workbook, nomeAba))
}

function criarAbaImportada(workbook: XLSX.WorkBook, nomeAba: string): AbaImportada {
  const planilha = workbook.Sheets[nomeAba]
  const matriz = XLSX.utils.sheet_to_json(planilha, {
    header: 1,
    defval: null,
  }) as unknown[][]

  const [cabecalho, ...linhasDeDados] = matriz
  const colunas = (cabecalho ?? []).map((valor, indice) => {
    const nome = String(valor ?? '').trim()
    return nome || `coluna_${indice + 1}`
  })

  const linhas = linhasDeDados
    .filter((linha) => linha.some((valor) => valor !== null && valor !== ''))
    .map((linha) => montarLinha(colunas, linha))

  return { nomeAba, colunas, linhas }
}

function montarLinha(colunas: string[], linha: unknown[]): Record<string, unknown> {
  const objeto: Record<string, unknown> = {}
  colunas.forEach((coluna, indice) => {
    objeto[coluna] = linha[indice] ?? null
  })
  return objeto
}
