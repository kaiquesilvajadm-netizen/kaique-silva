// Dicionário de métricas calculadas a partir da Planilha de Tarefas.
// Transcrito da planilha de instruções (aba "Página2"): cada métrica de
// contagem soma quantas linhas têm a coluna "Compromisso" igual a um dos
// nomes listados (quando há mais de um, separados por ";" na planilha
// original).
export interface DefinicaoMetricaContagem {
  rotulo: string
  icone: string
  compromissos: string[]
  // Só true para a métrica que a planilha de instruções marca como
  // aceitando ajuste manual ("DAR OPÇÃO DE INSERIR VALOR MANUAL"). O
  // formulário de métricas individuais só oferece estas como opção.
  permiteManual?: boolean
}

export const METRICAS_REUNIAO: DefinicaoMetricaContagem[] = [
  {
    rotulo: 'Reunião de Implantação Elite',
    icone: '🤝',
    compromissos: ['CULTI REUNIÃO DE IMPLANTAÇÃO ELITE'],
  },
  {
    rotulo: 'Reunião de Kick-Off',
    icone: '🚀',
    compromissos: ['REUNIÃO INICIAL KICKOFF DE CULTIVAÇÃO'],
  },
  {
    rotulo: 'Reunião de Engajamento',
    icone: '💬',
    compromissos: ['CSC REUNIÃO ENGAJAMENTO'],
  },
  {
    rotulo: 'Reunião de Pipe de Risco',
    icone: '⚠️',
    compromissos: ['CS REUNIÃO CONTA PIPE DE RISCO'],
  },
  {
    rotulo: 'Reunião de IA & Automações',
    icone: '🤖',
    compromissos: [
      'CS REUNIÃO DE IA E AUTOMAÇÕES',
      'CSA REUNIÃO DONN@ E JUSTIN-E',
      'CSA REUNIÃO AGENTE DE PETICIONAMENTO',
      'CSA REUNIÃO FLOWTERS + API',
    ],
  },
  {
    rotulo: 'Diagnóstico Radar',
    icone: '📡',
    compromissos: ['CSA DEVOLUTIVA RADAR'],
  },
]

export const METRICA_REMARCADAS: DefinicaoMetricaContagem = {
  rotulo: 'Reuniões Remarcadas / Canceladas',
  icone: '🔁',
  compromissos: ['CS REMARCAR REUNIAO CULTIVACAO'],
}

// TODO: a planilha de instruções diz "soma de todas as tarefas de reuniões
// feitas E [estes itens]" para esta métrica, mas o nome dela ("Checklist SEM
// reunião") sugere que reuniões não deveriam entrar na soma — parece ter
// sobrado da fórmula de cancelamento na célula de cima. Por ora somamos só
// os itens de plano de ação / cobertura sem reunião listados abaixo.
// Confirmar com o time qual das duas leituras está certa.
export const METRICA_REVISOES_DE_CONTAS: DefinicaoMetricaContagem = {
  rotulo: 'Revisões de Contas (Checklist s/ reunião)',
  icone: '📝',
  compromissos: [
    'PLANO DE AÇÃO - OTIMIZAÇÃO',
    'CSC PLANO DE AÇÃO - ENGAJAMENTO',
    'CSC PLANO DE AÇÃO - CULTIVAÇÃO INICIADA',
    'CSC PLANO DE AÇÃO - ADOÇÃO',
    'CSC COBERTURA DE BASE SEM REUNIÃO',
  ],
}

export const METRICAS_OPORTUNIDADE: DefinicaoMetricaContagem[] = [
  {
    rotulo: 'Upgrades de Plano',
    icone: '⬆️',
    compromissos: [
      'CULTI OPORTUNIDADE DE UPGRADE',
      'OPORTUNIDADE UPGRADE',
      'OPORTUNIDADE UPGRADE ELITE',
      'CS OPORTUNIDADE DEGUSTAÇÃO ELITE',
    ],
  },
  {
    rotulo: 'Cross-Sell (Consultorias / BigBoss)',
    icone: '🧩',
    compromissos: ['OPORTUNIDADE BIG BOSS'],
  },
  {
    rotulo: 'Ativações de IA (Justine/Dona/Flowter)',
    icone: '🤖',
    compromissos: [
      'OPORTUNIDADE JUSTINE',
      'OPORTUNIDADE DONNA',
      'OPORTUNIDADE AGENTE',
      'OPORTUNIDADE FLOWTER/API',
      'OPORTUNIDADE PACOTE INTELIGENTE',
      'OPORTUNIDADE PREVIDIA',
    ],
  },
  {
    rotulo: 'Ativações de API (pagas)',
    icone: '🔌',
    compromissos: ['CS OPORTUNIDADE API'],
  },
  {
    rotulo: 'Eventos / Comunidade / Parceiros',
    icone: '🎉',
    compromissos: [
      'CS INDICAÇÃO ALAN HONJOYA',
      'CS INDICAÇÃO CRIS ADV10X',
      'CS INDICAÇÃO EURO JR',
      'CS INDICAÇÃO FLAVIA MARINHO',
      'CS INDICAÇÃO FRED PATARO',
      'CS INDICAÇÃO RAFAEL MOTA',
      'CS INDICAÇÃO RICCIARDI',
      'CS INDICAÇÃO VALERIA GUI',
    ],
  },
]

// "DAR OPÇÃO DE INSERIR VALOR MANUAL E SOMAR COM AS TAREFAS" — por isso o
// formulário manual soma (em vez de sobrescrever) o que vier da planilha.
export const METRICA_FECHAMENTOS: DefinicaoMetricaContagem = {
  rotulo: 'Fechamentos de Ops no Mês',
  icone: '💰',
  permiteManual: true,
  compromissos: [
    'fechamento oportunidade pacote inteligente',
    'fechamento oportunidade Flowter',
    'fechamento oportunidade IA',
    'fechamento oportunidade previdia',
    'CULTI UPGRADE BJ FECHADO',
    'CULTI UPGRADE BMAX FECHADO',
    'CULTI UPGRADE ELITE FECHADO',
  ],
}

// Estas duas aparecem na categoria "Retenção & Churn" mas, segundo a
// planilha de instruções, vêm da Planilha de Tarefas (não da Planilha King).
export const METRICAS_CHURN_VIA_TAREFAS: DefinicaoMetricaContagem[] = [
  {
    rotulo: 'Churns Resgatados',
    icone: '🛟',
    compromissos: ['CS RESGATE DE CHURN EFETUADO'],
  },
  {
    rotulo: 'Inadimplentes Resgatados',
    icone: '💳',
    compromissos: ['Cs Resgate de Atrasados e Inadimplentes'],
  },
]

// Rótulos das métricas que aceitam ajuste manual no menu Tarefas. Hoje a
// planilha de instruções só marca "Fechamentos de Ops no Mês" — o menu King
// não tem nenhuma métrica marcada para entrada manual.
export const ROTULOS_PERMITEM_MANUAL_TAREFAS: string[] = [METRICA_FECHAMENTOS].filter(
  (definicao) => definicao.permiteManual
).map((definicao) => definicao.rotulo)
