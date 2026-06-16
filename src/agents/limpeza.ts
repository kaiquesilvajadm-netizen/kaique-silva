import type { LinhaLimpa, LinhaPlanilha } from '@/types/metricas'

// Agente de Limpeza / Normalização
// Recebe as linhas cruas extraídas da planilha e devolve linhas "limpas":
// - remove linhas totalmente vazias
// - retira espaços extras de textos
// - converte textos numéricos (ex: "12", "3,5") em number
// - normaliza valores ausentes para null
export function limparLinhas(linhas: LinhaPlanilha[]): LinhaLimpa[] {
  return linhas.map(limparLinha).filter((linha) => !linhaEstaVazia(linha))
}

function limparLinha(linha: LinhaPlanilha): LinhaLimpa {
  const linhaLimpa: LinhaLimpa = {}

  for (const [coluna, valorOriginal] of Object.entries(linha)) {
    linhaLimpa[coluna] = normalizarValor(valorOriginal)
  }

  return linhaLimpa
}

function normalizarValor(valor: unknown): string | number | null {
  if (valor === null || valor === undefined) return null
  if (typeof valor === 'number') return valor

  const texto = String(valor).trim()
  if (texto === '') return null

  // Aceita vírgula como separador decimal (ex: "3,5" -> 3.5), comum em
  // planilhas configuradas em pt-BR.
  const textoComoNumero = texto.replace(',', '.')
  const numero = Number(textoComoNumero)
  const pareceNumero = !Number.isNaN(numero)

  return pareceNumero ? numero : texto
}

function linhaEstaVazia(linha: LinhaLimpa): boolean {
  return Object.values(linha).every((valor) => valor === null || valor === '')
}
