'use client'

import { useState } from 'react'
import { importarPlanilha } from '@/agents/importacao'
import { limparLinhas } from '@/agents/limpeza'
import { calcularMetricas } from '@/agents/metricas'
import type { MetricaIndividual } from '@/types/metricas'

interface Props {
  onImportar: (metricas: MetricaIndividual[]) => void
  onErro: (mensagem: string | null) => void
}

export default function UploadPlanilha({ onImportar, onErro }: Props) {
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function handleArquivoSelecionado(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    setNomeArquivo(arquivo.name)
    setCarregando(true)
    onErro(null)

    try {
      const abas = await importarPlanilha(arquivo)
      const todasAsLinhas = abas.flatMap((aba) => aba.linhas)
      const linhasLimpas = limparLinhas(todasAsLinhas)
      onImportar(calcularMetricas(linhasLimpas))
    } catch (erro) {
      console.error(erro)
      onErro('Não foi possível ler essa planilha. Verifique se o arquivo é .xlsx, .xls ou .csv.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-medium text-zinc-900">Planilha da equipe</h2>
      <p className="mt-1 text-sm text-zinc-500">Formatos aceitos: .xlsx, .xls, .csv</p>

      <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-600 hover:border-zinc-400">
        {carregando ? 'Lendo planilha...' : nomeArquivo ?? 'Clique para selecionar o arquivo'}
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleArquivoSelecionado}
        />
      </label>
    </div>
  )
}
