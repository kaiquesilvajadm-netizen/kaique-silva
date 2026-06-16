'use client'

import { useMemo, useState } from 'react'
import Cabecalho from '@/components/Cabecalho'
import UploadPlanilha from '@/components/UploadPlanilha'
import FormularioMetricasIndividuais from '@/components/FormularioMetricasIndividuais'
import DashboardMetricas from '@/components/DashboardMetricas'
import { importarPlanilha } from '@/agents/importacao'
import { limparTabela } from '@/agents/limpeza'
import { calcularMetricasTarefas } from '@/agents/metricas-tarefas'
import { calcularMetricasKing } from '@/agents/metricas-king'
import { montarRelatorio } from '@/agents/relatorio'
import { ROTULOS_PERMITEM_MANUAL_TAREFAS } from '@/agents/dicionario-tarefas'
import type { MetricaIndividual } from '@/types/metricas'

// Duas planilhas de entrada diferentes, uma por aba, cada uma com sua
// própria coluna-âncora usada para localizar o cabeçalho real:
// KING -> Planilha King (churn), âncora "ID da conta"
// TAREFAS -> Planilha de Tarefas (compromissos), âncora "Compromisso"
const FUNCOES = [
  { id: 'king', label: 'KING', icone: '⛏️', titulo: 'King', badge: 'Métricas · Planilha King (Churn)', ancora: 'ID da conta' },
  { id: 'tarefas', label: 'TAREFAS', icone: '📊', titulo: 'Tarefas', badge: 'Métricas · Planilha de Tarefas', ancora: 'Compromisso' },
] as const

type FuncaoId = (typeof FUNCOES)[number]['id']

interface EstadoFuncao {
  metricasDaPlanilha: MetricaIndividual[]
  metricasManuais: MetricaIndividual[]
  erro: string | null
}

function estadoFuncaoVazio(): EstadoFuncao {
  return { metricasDaPlanilha: [], metricasManuais: [], erro: null }
}

export default function Home() {
  const [funcaoAtiva, setFuncaoAtiva] = useState<FuncaoId>('king')
  const [estadoPorFuncao, setEstadoPorFuncao] = useState<Record<FuncaoId, EstadoFuncao>>({
    king: estadoFuncaoVazio(),
    tarefas: estadoFuncaoVazio(),
  })

  const estadoAtual = estadoPorFuncao[funcaoAtiva]
  const funcaoInfo = FUNCOES.find((funcao) => funcao.id === funcaoAtiva)!

  const linhasDashboard = useMemo(
    () => montarRelatorio([...estadoAtual.metricasDaPlanilha, ...estadoAtual.metricasManuais]),
    [estadoAtual]
  )

  const colaboradoresDisponiveis = linhasDashboard.map((linha) => linha.colaborador)
  const metricasPermitidas = funcaoAtiva === 'tarefas' ? ROTULOS_PERMITEM_MANUAL_TAREFAS : []

  function atualizarFuncaoAtiva(parcial: Partial<EstadoFuncao>) {
    setEstadoPorFuncao((atual) => ({
      ...atual,
      [funcaoAtiva]: { ...atual[funcaoAtiva], ...parcial },
    }))
  }

  async function processarArquivoDaFuncaoAtiva(arquivo: File): Promise<MetricaIndividual[]> {
    const abas = await importarPlanilha(arquivo)
    const linhasPlanilha = limparTabela(abas[0]?.matriz ?? [], funcaoInfo.ancora)
    return funcaoAtiva === 'tarefas' ? calcularMetricasTarefas(linhasPlanilha) : calcularMetricasKing(linhasPlanilha)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <Cabecalho
          funcaoAtiva={funcaoAtiva}
          funcoes={FUNCOES}
          onMudarFuncao={(id) => setFuncaoAtiva(id as FuncaoId)}
        />

        <div key={funcaoAtiva} className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 pb-4">
            <span className="text-xl">{funcaoInfo.icone}</span>
            <h2 className="text-lg font-semibold text-slate-900">{funcaoInfo.titulo}</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {funcaoInfo.badge}
            </span>
          </div>
          <hr className="border-slate-200" />

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <UploadPlanilha
              aoProcessar={processarArquivoDaFuncaoAtiva}
              onResultado={(metricas) => atualizarFuncaoAtiva({ metricasDaPlanilha: metricas })}
              onErro={(mensagem) => atualizarFuncaoAtiva({ erro: mensagem })}
            />
            <FormularioMetricasIndividuais
              key={colaboradoresDisponiveis.join(',')}
              colaboradoresDisponiveis={colaboradoresDisponiveis}
              metricasPermitidas={metricasPermitidas}
              onAdicionar={(metrica) =>
                atualizarFuncaoAtiva({ metricasManuais: [...estadoAtual.metricasManuais, metrica] })
              }
            />
          </div>

          {estadoAtual.erro && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{estadoAtual.erro}</p>
          )}

          {linhasDashboard.length > 0 && (
            <span className="mt-6 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              📋 RELATÓRIO {funcaoInfo.label}
            </span>
          )}

          <div className="mt-4">
            <DashboardMetricas linhas={linhasDashboard} />
          </div>
        </div>

        <footer className="text-center text-xs text-slate-400">
          <p>ADVBOX · Painel de métricas - CULTIVAÇÃO</p>
          <p>Desenvolvido por: Time de Configuração</p>
        </footer>
      </div>
    </div>
  )
}
