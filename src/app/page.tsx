'use client'

import { useMemo, useState } from 'react'
import UploadPlanilha from '@/components/UploadPlanilha'
import FormularioMetricasIndividuais from '@/components/FormularioMetricasIndividuais'
import DashboardMetricas from '@/components/DashboardMetricas'
import { montarRelatorio } from '@/agents/relatorio'
import type { MetricaIndividual } from '@/types/metricas'

export default function Home() {
  const [metricasDaPlanilha, setMetricasDaPlanilha] = useState<MetricaIndividual[]>([])
  const [metricasManuais, setMetricasManuais] = useState<MetricaIndividual[]>([])
  const [erro, setErro] = useState<string | null>(null)

  const linhasDashboard = useMemo(
    () => montarRelatorio([...metricasDaPlanilha, ...metricasManuais]),
    [metricasDaPlanilha, metricasManuais]
  )

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header>
          <h1 className="text-3xl font-semibold text-zinc-900">CS Metrics</h1>
          <p className="mt-1 text-zinc-600">
            Análise de métricas da equipe: envie a planilha e/ou preencha métricas individuais.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          <UploadPlanilha onImportar={setMetricasDaPlanilha} onErro={setErro} />
          <FormularioMetricasIndividuais
            onAdicionar={(metrica) => setMetricasManuais((atuais) => [...atuais, metrica])}
          />
        </section>

        {erro && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

        <DashboardMetricas linhas={linhasDashboard} />
      </div>
    </div>
  )
}
