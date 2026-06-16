import type { LinhaLimpa, MetricaIndividual } from '@/types/metricas'

// Agente de Cálculo de Métricas
//
// >>> ESTE É O ARQUIVO PRINCIPAL PARA AJUSTAR quando a planilha de instruções
// >>> chegar. Hoje ele apenas repassa os valores numéricos de cada linha como
// >>> se já fossem os valores reais das métricas (sem nenhuma fórmula).
//
// Quando soubermos quais colunas da planilha correspondem a quais métricas
// reais da equipe (e quais fórmulas/filtros usar), a lógica entra aqui:
// 1. Ajustar `COLUNAS_DE_NOME_DO_JOGADOR` com o nome real da coluna que
//    identifica o jogador/membro da equipe.
// 2. Para cada métrica real (ex: "taxa de conversão", "média de vendas"),
//    criar uma função própria nesta página e chamar dentro de
//    `calcularValoresDaLinha`.
export function calcularMetricas(linhas: LinhaLimpa[]): MetricaIndividual[] {
  return linhas.map((linha) => ({
    jogador: identificarNomeDoJogador(linha),
    origem: 'planilha',
    valores: calcularValoresDaLinha(linha),
  }))
}

// TODO: substituir pelos nomes reais de coluna da planilha de instruções.
const COLUNAS_DE_NOME_DO_JOGADOR = ['nome', 'jogador', 'membro', 'colaborador']

function identificarNomeDoJogador(linha: LinhaLimpa): string {
  for (const coluna of Object.keys(linha)) {
    if (COLUNAS_DE_NOME_DO_JOGADOR.includes(coluna.toLowerCase())) {
      return String(linha[coluna] ?? 'Não identificado')
    }
  }
  return 'Não identificado'
}

function calcularValoresDaLinha(linha: LinhaLimpa): Record<string, number> {
  const valores: Record<string, number> = {}

  for (const [coluna, valor] of Object.entries(linha)) {
    if (typeof valor !== 'number') continue
    if (COLUNAS_DE_NOME_DO_JOGADOR.includes(coluna.toLowerCase())) continue

    // TODO: aqui é o lugar para aplicar a fórmula real de cada métrica.
    // Hoje só copiamos o valor numérico bruto da planilha (placeholder).
    valores[coluna] = valor
  }

  return valores
}
