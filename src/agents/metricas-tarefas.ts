import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'
import { normalizarTexto, valorDaColuna } from './util-linhas'

// ── Detecção de período ───────────────────────────────────────────────────────
// Verifica se o arquivo inserido bate com o modo selecionado (mensal/semanal),
// lendo colunas de data da planilha e calculando a amplitude em dias.
export function detectarPeriodoTarefas(
  linhas: LinhaPlanilha[],
  modo: 'mensal' | 'semanal'
): string | null {
  if (linhas.length < 2) return null

  const timestamps: number[] = []
  for (const linha of linhas) {
    for (const [coluna, valor] of Object.entries(linha)) {
      if (!normalizarTexto(coluna).includes('data')) continue
      const ts = parsearData(valor)
      if (ts !== null) timestamps.push(ts)
    }
  }
  if (timestamps.length < 2) return null

  const min = Math.min(...timestamps)
  const max = Math.max(...timestamps)
  const dias = (max - min) / (1000 * 60 * 60 * 24)

  if (modo === 'semanal' && dias > 10) {
    return `⚠️ A planilha inserida parece cobrir ${Math.round(dias)} dias. O modo Semanal espera um relatório de até 7 dias — verifique se exportou o período correto na ADVBOX.`
  }
  if (modo === 'mensal' && dias > 0 && dias < 8) {
    return `⚠️ A planilha inserida parece cobrir apenas ${Math.round(dias)} dias. O modo Mensal espera o relatório do mês completo — verifique se exportou o período correto na ADVBOX.`
  }
  return null
}

function parsearData(valor: unknown): number | null {
  // Excel serial date — intervalo ~2020-2028 (seriais 43831-47483)
  if (typeof valor === 'number' && valor > 43831 && valor < 47483) {
    return (valor - 25569) * 86400 * 1000
  }
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor.getTime()
  if (typeof valor === 'string') {
    const ptBR = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (ptBR) {
      const ts = new Date(`${ptBR[3]}-${ptBR[2]}-${ptBR[1]}`).getTime()
      return isNaN(ts) ? null : ts
    }
    const iso = valor.match(/^\d{4}-\d{2}-\d{2}/)
    if (iso) {
      const ts = new Date(valor.slice(0, 10)).getTime()
      return isNaN(ts) ? null : ts
    }
  }
  return null
}
import {
  METRICAS_REUNIAO,
  METRICA_REMARCADAS,
  METRICA_AGENDAMENTOS_TENTADOS,
  METRICA_REVISOES_DE_CONTAS,
  METRICA_OUTRAS_REUNIOES_CULTIVACAO,
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
  const agendamentos = contar(METRICA_AGENDAMENTOS_TENTADOS)
  v[METRICA_AGENDAMENTOS_TENTADOS.rotulo] = agendamentos
  v['Taxa de Efetivação de Reuniões (%)'] =
    agendamentos > 0 ? (totalReunioes / agendamentos) * 100 : 0

  // Métricas MENSAL
  v[METRICA_REVISOES_DE_CONTAS.rotulo] = contar(METRICA_REVISOES_DE_CONTAS)
  v[METRICA_OUTRAS_REUNIOES_CULTIVACAO.rotulo] = contar(METRICA_OUTRAS_REUNIOES_CULTIVACAO)
  for (const def of METRICAS_OPORTUNIDADE) v[def.rotulo] = contar(def)
  const totalOps = somarRotulos(v, METRICAS_OPORTUNIDADE)
  v[METRICA_FECHAMENTOS.rotulo] = contar(METRICA_FECHAMENTOS)
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
