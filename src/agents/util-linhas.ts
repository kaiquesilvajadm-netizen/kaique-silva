import type { LinhaLimpa } from '@/types/metricas'

// Nome da coluna que identifica o colaborador, igual nas duas planilhas
// (Tarefas e King), conforme a planilha de instruções.
export const COLUNA_COLABORADOR = 'colaborador (i.s.)'

export function normalizarTexto(texto: string): string {
  return texto.trim().toLowerCase()
}

export function valorDaColuna(linha: LinhaLimpa, nomeColunaNormalizado: string): string | number | null {
  for (const [coluna, valor] of Object.entries(linha)) {
    if (normalizarTexto(coluna) === nomeColunaNormalizado) return valor
  }
  return null
}

export function agruparPorColuna(linhas: LinhaLimpa[], nomeColunaNormalizado: string): Map<string, LinhaLimpa[]> {
  const grupos = new Map<string, LinhaLimpa[]>()

  for (const linha of linhas) {
    const valor = valorDaColuna(linha, nomeColunaNormalizado)
    const chave = valor === null || valor === '' ? 'Não identificado' : String(valor).trim()
    const grupo = grupos.get(chave) ?? []
    grupo.push(linha)
    grupos.set(chave, grupo)
  }

  return grupos
}

// Extrai um número de uma célula que pode já estar limpa (number) ou ainda
// conter texto junto (ex: "12 meses" -> 12), conforme observado na coluna
// Lifetime da Planilha King.
export function extrairNumeroDaColuna(linha: LinhaLimpa, nomeColunaNormalizado: string): number | null {
  const valor = valorDaColuna(linha, nomeColunaNormalizado)
  if (valor === null) return null
  if (typeof valor === 'number') return valor

  const correspondencia = String(valor).replace(',', '.').match(/-?\d+(\.\d+)?/)
  return correspondencia ? Number(correspondencia[0]) : null
}

export function somar(numeros: number[]): number {
  return numeros.reduce((total, numero) => total + numero, 0)
}

export function media(numeros: number[]): number {
  return numeros.length === 0 ? 0 : somar(numeros) / numeros.length
}
