import { formatarValorMetrica, type LinhaDashboard } from '@/agents/relatorio'

interface Props {
  linhas: LinhaDashboard[]
}

export default function DashboardMetricas({ linhas }: Props) {
  if (linhas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        Nenhum dado ainda. Envie uma planilha ou preencha o formulário acima.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {linhas.map((linha) => (
        <div key={linha.colaborador} className="rounded-xl border-l-4 border-blue-500 bg-slate-50 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span>📊</span>
            <span>{linha.colaborador.toUpperCase()}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {linha.metricas.map((metrica) => (
              <div key={metrica.rotulo} className="min-w-[170px] flex-1 rounded-lg bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <span>{metrica.icone}</span>
                  <span>{metrica.rotulo}</span>
                </div>
                <div className="mt-1 text-xl font-bold text-slate-900">
                  {formatarValorMetrica(metrica.rotulo, metrica.valor)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
