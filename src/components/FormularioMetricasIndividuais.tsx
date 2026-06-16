'use client'

import { useState } from 'react'
import type { MetricaIndividual } from '@/types/metricas'

interface ParMetrica {
  nome: string
  valor: string
}

interface Props {
  onAdicionar: (metrica: MetricaIndividual) => void
}

const PAR_VAZIO: ParMetrica = { nome: '', valor: '' }

export default function FormularioMetricasIndividuais({ onAdicionar }: Props) {
  const [jogador, setJogador] = useState('')
  // Campos livres por enquanto: quando a planilha de instruções chegar, dá
  // pra trocar isso por campos fixos com os nomes reais das métricas
  // individuais da equipe (ex: "vitórias", "presença", "nota técnica"...).
  const [pares, setPares] = useState<ParMetrica[]>([PAR_VAZIO])

  function atualizarPar(indice: number, campo: keyof ParMetrica, valor: string) {
    setPares((atuais) => atuais.map((par, i) => (i === indice ? { ...par, [campo]: valor } : par)))
  }

  function adicionarPar() {
    setPares((atuais) => [...atuais, PAR_VAZIO])
  }

  function removerPar(indice: number) {
    setPares((atuais) => atuais.filter((_, i) => i !== indice))
  }

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault()
    if (!jogador.trim()) return

    const valores: Record<string, number> = {}
    for (const par of pares) {
      const numero = Number(par.valor.replace(',', '.'))
      if (par.nome.trim() && !Number.isNaN(numero) && par.valor.trim() !== '') {
        valores[par.nome.trim()] = numero
      }
    }

    onAdicionar({ jogador: jogador.trim(), origem: 'manual', valores })
    setJogador('')
    setPares([PAR_VAZIO])
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-medium text-zinc-900">Métricas individuais</h2>
      <p className="mt-1 text-sm text-zinc-500">Preencha manualmente as métricas de um jogador/membro.</p>

      <div className="mt-4 flex flex-col gap-3">
        <input
          value={jogador}
          onChange={(evento) => setJogador(evento.target.value)}
          placeholder="Nome do jogador"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          required
        />

        {pares.map((par, indice) => (
          <div key={indice} className="flex gap-2">
            <input
              value={par.nome}
              onChange={(evento) => atualizarPar(indice, 'nome', evento.target.value)}
              placeholder="Métrica (ex: vitórias)"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              value={par.valor}
              onChange={(evento) => atualizarPar(indice, 'valor', evento.target.value)}
              placeholder="Valor"
              className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            {pares.length > 1 && (
              <button
                type="button"
                onClick={() => removerPar(indice)}
                className="px-2 text-zinc-400 hover:text-red-600"
                aria-label="Remover métrica"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={adicionarPar}
          className="self-start text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          + Adicionar métrica
        </button>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Salvar
        </button>
      </div>
    </form>
  )
}
