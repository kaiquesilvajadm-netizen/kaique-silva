import type { MetricaIndividual, OrigemMetrica } from '@/types/metricas'

// Agente de Relatório
// Junta as métricas vindas da planilha com as métricas preenchidas
// manualmente e organiza tudo em uma linha por jogador/membro, pronta para
// o dashboard.
export interface LinhaDashboard {
  jogador: string
  valores: Record<string, number>
  origens: OrigemMetrica[]
}

export function montarRelatorio(metricas: MetricaIndividual[]): LinhaDashboard[] {
  const porJogador = new Map<string, LinhaDashboard>()

  for (const metrica of metricas) {
    const existente = porJogador.get(metrica.jogador)

    if (!existente) {
      porJogador.set(metrica.jogador, {
        jogador: metrica.jogador,
        valores: { ...metrica.valores },
        origens: [metrica.origem],
      })
      continue
    }

    // Quando o mesmo jogador aparece em mais de uma fonte (planilha + manual),
    // os valores preenchidos manualmente sobrescrevem os da planilha.
    // TODO: revisar essa regra de prioridade quando soubermos como a equipe
    // quer tratar conflitos entre as duas fontes.
    existente.valores = { ...existente.valores, ...metrica.valores }
    existente.origens.push(metrica.origem)
  }

  return Array.from(porJogador.values())
}

export function colunasDeMetricas(linhas: LinhaDashboard[]): string[] {
  const colunas = new Set<string>()
  linhas.forEach((linha) => Object.keys(linha.valores).forEach((coluna) => colunas.add(coluna)))
  return Array.from(colunas)
}
