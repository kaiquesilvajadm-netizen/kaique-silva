'use client'

import { useMemo, useRef, useState } from 'react'
import Cabecalho from '@/components/Cabecalho'
import UploadPlanilha from '@/components/UploadPlanilha'
import DashboardMetricas from '@/components/DashboardMetricas'
import ModalSelecionarColaborador from '@/components/ModalSelecionarColaborador'
import { importarPlanilha } from '@/agents/importacao'
import { limparTabela } from '@/agents/limpeza'
import { calcularMetricasTarefas } from '@/agents/metricas-tarefas'
import { calcularMetricasKing } from '@/agents/metricas-king'
import { montarRelatorio } from '@/agents/relatorio'
import { colaboradorAutorizado, normalizarNomeColaborador } from '@/agents/colaboradores-autorizados'
import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'

const FUNCOES = [
  { id: 'king', label: 'KING', icone: '⛏️', titulo: 'King', badge: 'Métricas · Planilha King (Churn)' },
  { id: 'tarefas', label: 'TAREFAS', icone: '📊', titulo: 'Tarefas', badge: 'Métricas · Planilha de Tarefas' },
] as const

type FuncaoId = (typeof FUNCOES)[number]['id']
type ModoTarefas = 'mensal' | 'semanal'

// ── Estado KING ──────────────────────────────────────────────────────────────
interface EstadoKing {
  metricasDaPlanilha: MetricaIndividual[]
  colaboradorSelecionado: string | null
  mostrarSeletor: boolean
  erro: string | null
}

function kingVazio(): EstadoKing {
  return { metricasDaPlanilha: [], colaboradorSelecionado: null, mostrarSeletor: false, erro: null }
}

// ── Estado TAREFAS ────────────────────────────────────────────────────────────
interface EstadoTarefas {
  metricasDaPlanilha: MetricaIndividual[]
  modo: ModoTarefas
  erro: string | null
}

function tarefasVazio(): EstadoTarefas {
  return { metricasDaPlanilha: [], modo: 'mensal', erro: null }
}

export default function Home() {
  const [funcaoAtiva, setFuncaoAtiva] = useState<FuncaoId>('king')
  const [king, setKing] = useState<EstadoKing>(kingVazio)
  const [tarefas, setTarefas] = useState<EstadoTarefas>(tarefasVazio)

  // Armazena as linhas brutas da última planilha de tarefas para reprocessar
  // ao trocar de modo (MENSAL ↔ SEMANAL) sem precisar reenviar o arquivo.
  const linhasBrutasTarefas = useRef<LinhaPlanilha[]>([])

  const funcaoInfo = FUNCOES.find((f) => f.id === funcaoAtiva)!
  const ehKing = funcaoAtiva === 'king'

  // ── Dashboard KING ──────────────────────────────────────────────────────────
  const linhasKing = useMemo(() => {
    const filtradas = king.colaboradorSelecionado
      ? king.metricasDaPlanilha.filter((m) => m.colaborador === king.colaboradorSelecionado)
      : []
    return montarRelatorio(filtradas)
  }, [king])

  const todosColaboradoresKing = useMemo(
    () => [...new Set(king.metricasDaPlanilha.map((m) => m.colaborador))].sort(),
    [king.metricasDaPlanilha]
  )

  // ── Dashboard TAREFAS ───────────────────────────────────────────────────────
  const linhasTarefas = useMemo(
    () => montarRelatorio(tarefas.metricasDaPlanilha),
    [tarefas]
  )

  // ── Processamento ───────────────────────────────────────────────────────────
  async function processarArquivoKing(arquivo: File): Promise<MetricaIndividual[]> {
    const abas = await importarPlanilha(arquivo)
    return calcularMetricasKing(limparTabela(abas[0]?.matriz ?? [], 'ID da conta'))
  }

  async function processarArquivoTarefas(arquivo: File): Promise<MetricaIndividual[]> {
    const abas = await importarPlanilha(arquivo)
    const linhas = limparTabela(abas[0]?.matriz ?? [], 'Compromisso')
    linhasBrutasTarefas.current = linhas
    return calcularMetricasTarefas(linhas, tarefas.modo)
  }

  function aoReceberKing(metricas: MetricaIndividual[]) {
    setKing((prev) => ({
      ...prev,
      metricasDaPlanilha: metricas
        .filter((m) => colaboradorAutorizado(m.colaborador))
        .map((m) => ({ ...m, colaborador: normalizarNomeColaborador(m.colaborador) })),
      colaboradorSelecionado: null,
      mostrarSeletor: true,
      erro: null,
    }))
  }

  function aoReceberTarefas(metricas: MetricaIndividual[]) {
    setTarefas((prev) => ({ ...prev, metricasDaPlanilha: metricas, erro: null }))
  }

  function mudarModoTarefas(novoModo: ModoTarefas) {
    const linhas = linhasBrutasTarefas.current
    setTarefas((prev) => ({
      ...prev,
      modo: novoModo,
      metricasDaPlanilha: linhas.length > 0 ? calcularMetricasTarefas(linhas, novoModo) : [],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <Cabecalho
          funcaoAtiva={funcaoAtiva}
          funcoes={FUNCOES}
          onMudarFuncao={(id) => setFuncaoAtiva(id as FuncaoId)}
        />

        {/* ── ABA KING ─────────────────────────────────────────────────── */}
        {ehKing && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 pb-4">
              <span className="text-xl">{funcaoInfo.icone}</span>
              <h2 className="text-lg font-semibold text-slate-900">{funcaoInfo.titulo}</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {funcaoInfo.badge}
              </span>
            </div>
            <hr className="border-slate-200" />

            {king.colaboradorSelecionado && (
              <div className="mt-5 flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-slate-400">👤</span>
                <span className="flex-1 text-sm font-medium text-slate-800">
                  {king.colaboradorSelecionado}
                </span>
                <button
                  type="button"
                  onClick={() => setKing((prev) => ({ ...prev, mostrarSeletor: true }))}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
                >
                  Trocar
                </button>
              </div>
            )}

            <div className="mt-6">
              <UploadPlanilha
                aoProcessar={processarArquivoKing}
                onResultado={aoReceberKing}
                onErro={(msg) => setKing((prev) => ({ ...prev, erro: msg }))}
              />
            </div>

            {king.erro && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{king.erro}</p>
            )}

            {linhasKing.length > 0 && (
              <span className="mt-6 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                📋 RELATÓRIO KING
              </span>
            )}
            <div className="mt-4">
              <DashboardMetricas linhas={linhasKing} ocultarNome={false} />
            </div>
          </div>
        )}

        {/* ── ABA TAREFAS ──────────────────────────────────────────────── */}
        {!ehKing && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xl">{funcaoInfo.icone}</span>
                <h2 className="text-lg font-semibold text-slate-900">{funcaoInfo.titulo}</h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {funcaoInfo.badge}
                </span>
              </div>

              {/* Toggle MENSAL / SEMANAL */}
              <div className="flex gap-1 rounded-full bg-slate-100 p-1">
                {(['mensal', 'semanal'] as ModoTarefas[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => mudarModoTarefas(m)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      tarefas.modo === m
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {m === 'mensal' ? 'Mensal' : 'Semanal'}
                  </button>
                ))}
              </div>
            </div>
            <hr className="border-slate-200" />

            <div className="mt-6">
              <UploadPlanilha
                aoProcessar={processarArquivoTarefas}
                onResultado={aoReceberTarefas}
                onErro={(msg) => setTarefas((prev) => ({ ...prev, erro: msg }))}
              />
            </div>

            {tarefas.erro && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{tarefas.erro}</p>
            )}

            {linhasTarefas.length > 0 && (
              <span className="mt-6 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                📋 RELATÓRIO TAREFAS · {tarefas.modo === 'mensal' ? 'MENSAL' : 'SEMANAL'}
              </span>
            )}
            <div className="mt-4">
              <DashboardMetricas
                linhas={linhasTarefas}
                ocultarNome={true}
              />
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-slate-400">
          <p>ADVBOX · PAINEL DE MÉTRICAS - CULTIVAÇÃO</p>
        </footer>
      </div>

      {/* Modal de seleção de colaborador — apenas na aba KING */}
      {ehKing && king.mostrarSeletor && todosColaboradoresKing.length > 0 && (
        <ModalSelecionarColaborador
          nomes={todosColaboradoresKing}
          onSelecionar={(nome) =>
            setKing((prev) => ({ ...prev, colaboradorSelecionado: nome, mostrarSeletor: false }))
          }
        />
      )}
    </div>
  )
}
