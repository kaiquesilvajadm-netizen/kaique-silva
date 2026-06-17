import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'
import { normalizarTexto, valorDaColuna } from './util-linhas'
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
const COLUNA_DATA = 'data'

// Calcula todas as métricas de tarefas.
// MENSAL → uma entrada com o total do período inteiro.
// SEMANAL → uma entrada por semana (detectada pela coluna "Data").
export function calcularMetricasTarefas(
  linhas: LinhaPlanilha[],
  modo: 'mensal' | 'semanal'
): MetricaIndividual[] {
  if (modo === 'mensal') {
    return [calcularParaGrupo('mensal', linhas)]
  }

  // Agrupa por semana (segunda a domingo), preservando ordem cronológica
  const mapa = new Map<string, { label: string; linhas: LinhaPlanilha[] }>()
  const ordem: string[] = []

  for (const linha of linhas) {
    const { chave, label } = semanaDeData(linha)
    if (!mapa.has(chave)) {
      mapa.set(chave, { label, linhas: [] })
      ordem.push(chave)
    }
    mapa.get(chave)!.linhas.push(linha)
  }

  ordem.sort()

  return ordem.map((chave) => {
    const grupo = mapa.get(chave)!
    return calcularParaGrupo(grupo.label, grupo.linhas)
  })
}

// Extrai chave de ordenação e rótulo legível da semana de uma linha.
function semanaDeData(linha: LinhaPlanilha): { chave: string; label: string } {
  const dataRaw = valorDaColuna(linha, COLUNA_DATA)
  if (!dataRaw) return { chave: '00000000', label: 'Sem data' }

  const str = String(dataRaw)
  const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (!m) return { chave: '00000000', label: 'Sem data' }

  const [, d, mo, a] = m
  const date = new Date(Number(a), Number(mo) - 1, Number(d))

  // Segunda-feira da semana
  const dow = date.getDay() || 7
  const seg = new Date(date)
  seg.setDate(date.getDate() - dow + 1)

  const dom = new Date(seg)
  dom.setDate(seg.getDate() + 6)

  const fmt = (dt: Date) =>
    `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`

  const chave = `${a}${String(seg.getMonth() + 1).padStart(2, '0')}${String(seg.getDate()).padStart(2, '0')}`
  const label = `${fmt(seg)} a ${fmt(dom)}/${a}`

  return { chave, label }
}

function calcularParaGrupo(colaborador: string, linhas: LinhaPlanilha[]): MetricaIndividual {
  const contar = (def: DefinicaoMetricaContagem) => contarCompromissos(linhas, def.compromissos)

  const v: Record<string, number> = {}

  // Reuniões
  for (const def of METRICAS_REUNIAO) v[def.rotulo] = contar(def)
  const totalReunioes = somarRotulos(v, METRICAS_REUNIAO)

  const remarcadas = contar(METRICA_REMARCADAS)
  v[METRICA_REMARCADAS.rotulo] = remarcadas

  const totalAgendado = totalReunioes + remarcadas
  v['Taxa de Cancelamento Reuniões (%)'] =
    totalAgendado > 0 ? (remarcadas / totalAgendado) * 100 : 0

  // Revisões
  v[METRICA_REVISOES_DE_CONTAS.rotulo] = contar(METRICA_REVISOES_DE_CONTAS)

  // Oportunidades
  for (const def of METRICAS_OPORTUNIDADE) v[def.rotulo] = contar(def)
  const totalOps = somarRotulos(v, METRICAS_OPORTUNIDADE)

  v[METRICA_FECHAMENTOS.rotulo] = contar(METRICA_FECHAMENTOS)
  v['Taxa de Conversão Ops (%)'] =
    totalOps > 0 ? (v[METRICA_FECHAMENTOS.rotulo] / totalOps) * 100 : 0

  // Retenção via tarefas
  for (const def of METRICAS_CHURN_VIA_TAREFAS) v[def.rotulo] = contar(def)

  return { colaborador, origem: 'planilha', valores: v }
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
