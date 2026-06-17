import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'
import { normalizarTexto, valorDaColuna } from './util-linhas'
import {
  METRICAS_REUNIAO,
  METRICA_REMARCADAS,
  METRICA_REVISOES_DE_CONTAS,
  METRICAS_OPORTUNIDADE,
  METRICA_FECHAMENTOS,
  METRICAS_CHURN_VIA_TAREFAS,
  ROTULOS_SEMANAL,
  type DefinicaoMetricaContagem,
} from './dicionario-tarefas'

const COLUNA_COMPROMISSO = 'compromisso'

// Agrega todas as linhas em uma única entrada.
// MENSAL → exibe todas as métricas.
// SEMANAL → exibe apenas as métricas marcadas como SEMANAL na planilha de
// instruções (reuniões + remarcadas + taxa de cancelamento).
export function calcularMetricasTarefas(
  linhas: LinhaPlanilha[],
  modo: 'mensal' | 'semanal'
): MetricaIndividual[] {
  return [calcularParaGrupo(linhas, modo)]
}

function calcularParaGrupo(linhas: LinhaPlanilha[], modo: 'mensal' | 'semanal'): MetricaIndividual {
  const contar = (def: DefinicaoMetricaContagem) => contarCompromissos(linhas, def.compromissos)

  const v: Record<string, number> = {}

  // Reuniões (SEMANAL)
  for (const def of METRICAS_REUNIAO) v[def.rotulo] = contar(def)
  const totalReunioes = somarRotulos(v, METRICAS_REUNIAO)

  const remarcadas = contar(METRICA_REMARCADAS)
  v[METRICA_REMARCADAS.rotulo] = remarcadas

  const totalAgendado = totalReunioes + remarcadas
  v['Taxa de Cancelamento Reuniões (%)'] =
    totalAgendado > 0 ? (remarcadas / totalAgendado) * 100 : 0

  // Métricas MENSAL
  v[METRICA_REVISOES_DE_CONTAS.rotulo] = contar(METRICA_REVISOES_DE_CONTAS)
  for (const def of METRICAS_OPORTUNIDADE) v[def.rotulo] = contar(def)
  const totalOps = somarRotulos(v, METRICAS_OPORTUNIDADE)
  v[METRICA_FECHAMENTOS.rotulo] = contar(METRICA_FECHAMENTOS)
  v['Taxa de Conversão Ops (%)'] =
    totalOps > 0 ? (v[METRICA_FECHAMENTOS.rotulo] / totalOps) * 100 : 0
  for (const def of METRICAS_CHURN_VIA_TAREFAS) v[def.rotulo] = contar(def)

  const valores =
    modo === 'semanal'
      ? Object.fromEntries(Object.entries(v).filter(([rotulo]) => ROTULOS_SEMANAL.has(rotulo)))
      : v

  return { colaborador: modo, origem: 'planilha', valores }
}

function contarCompromissos(linhas: LinhaPlanilha[], aceitos: string[]): number {
  const norm = aceitos.map(normalizarTexto)
  return linhas.filter((l) => {
    const c = valorDaColuna(l, COLUNA_COMPROMISSO)
    return c !== null && norm.includes(normalizarTexto(String(c)))
  }).length
}

function somarRotulos(v: Record<string, number>, defs: DefinicaoMetricaContagem[]): number {
  return defs.reduce((s, d) => s + (v[d.rotulo] ?? 0), 0)
}
