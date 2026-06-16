import { colunasDeMetricas, type LinhaDashboard } from '@/agents/relatorio'

interface Props {
  linhas: LinhaDashboard[]
}

export default function DashboardMetricas({ linhas }: Props) {
  if (linhas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
        Nenhum dado ainda. Envie uma planilha ou preencha o formulário acima.
      </div>
    )
  }

  const colunas = colunasDeMetricas(linhas)

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-700">Jogador</th>
            {colunas.map((coluna) => (
              <th key={coluna} className="px-4 py-3 text-left font-medium text-zinc-700">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {linhas.map((linha) => (
            <tr key={linha.jogador}>
              <td className="px-4 py-3 font-medium text-zinc-900">{linha.jogador}</td>
              {colunas.map((coluna) => (
                <td key={coluna} className="px-4 py-3 text-zinc-700">
                  {linha.valores[coluna] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
