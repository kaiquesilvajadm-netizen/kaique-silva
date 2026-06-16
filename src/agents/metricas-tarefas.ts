import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'
import { agruparPorColuna, normalizarTexto, valorDaColuna, COLUNA_COLABORADOR_TAREFAS } from './util-linhas'
import {
  METRICAS_REUNIAO,
  METRICA_REMARCADAS,
  METRICA_REVISOES_DE_CONTAS,
  METRICAS_OPORTUNIDADE,
  METRICA_FECHAMENTOS,
  METRICAS_CHURN_VIA_TAREFAS,
  type DefinicaoMetricaContagem,
} from './dicionario-tarefas'

const COLUNA_COMPROMISSO = 'compromisso'

// Agente de Métricas — Planilha de Tarefas
// Agrupa as linhas por colaborador (coluna "Remetente") e, para cada um,
// conta quantas vezes cada "Compromisso" do dicionário aparece, depois
// calcula as métricas derivadas (percentuais e totais) descritas na
// planilha de instruções.
export function calcularMetricasTarefas(linhas: LinhaPlanilha[]): MetricaIndividual[] {
  const porColaborador = agruparPorColuna(linhas, COLUNA_COLABORADOR_TAREFAS)

  return Array.from(porColaborador.entries()).map(([colaborador, linhasDoColaborador]) => {
    const contar = (definicao: DefinicaoMetricaContagem) =>
      contarCompromissos(linhasDoColaborador, definicao.compromissos)

    const valores: Record<string, number> = {}

    for (const definicao of METRICAS_REUNIAO) {
      valores[definicao.rotulo] = contar(definicao)
    }
    const totalReunioesFeitas = somaDosRotulos(valores, METRICAS_REUNIAO)

    const remarcadas = contar(METRICA_REMARCADAS)
    valores[METRICA_REMARCADAS.rotulo] = remarcadas

    const totalAgendado = totalReunioesFeitas + remarcadas
    valores['Taxa de Cancelamento Reuniões (%)'] = totalAgendado > 0 ? (remarcadas / totalAgendado) * 100 : 0

    valores[METRICA_REVISOES_DE_CONTAS.rotulo] = contar(METRICA_REVISOES_DE_CONTAS)

    for (const definicao of METRICAS_OPORTUNIDADE) {
      valores[definicao.rotulo] = contar(definicao)
    }
    const totalOportunidades = somaDosRotulos(valores, METRICAS_OPORTUNIDADE)

    valores[METRICA_FECHAMENTOS.rotulo] = contar(METRICA_FECHAMENTOS)
    valores['Taxa de Conversão Ops (%)'] =
      totalOportunidades > 0 ? (valores[METRICA_FECHAMENTOS.rotulo] / totalOportunidades) * 100 : 0

    for (const definicao of METRICAS_CHURN_VIA_TAREFAS) {
      valores[definicao.rotulo] = contar(definicao)
    }

    return { colaborador, origem: 'planilha', valores }
  })
}

function contarCompromissos(linhas: LinhaPlanilha[], compromissosAceitos: string[]): number {
  const aceitosNormalizados = compromissosAceitos.map(normalizarTexto)

  return linhas.filter((linha) => {
    const compromisso = valorDaColuna(linha, COLUNA_COMPROMISSO)
    return compromisso !== null && aceitosNormalizados.includes(normalizarTexto(String(compromisso)))
  }).length
}

function somaDosRotulos(valores: Record<string, number>, definicoes: DefinicaoMetricaContagem[]): number {
  return definicoes.reduce((total, definicao) => total + (valores[definicao.rotulo] ?? 0), 0)
}
