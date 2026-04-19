import type { ProjectStatus } from '../types'

interface StatusBadgeProps {
  status: ProjectStatus
  size?: 'sm' | 'md'
  onClick?: () => void
  interactive?: boolean
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; dot: string; badge: string }
> = {
  production: {
    label: 'Produção',
    dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  },
  beta: {
    label: 'Beta',
    dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  },
  development: {
    label: 'Dev',
    dot: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.7)]',
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
  },
  maintenance: {
    label: 'Manutenção',
    dot: 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.7)]',
    badge: 'bg-orange-500/10 text-orange-400 border border-orange-500/25',
  },
  archived: {
    label: 'Arquivado',
    dot: 'bg-slate-500',
    badge: 'bg-slate-700/50 text-slate-400 border border-slate-600/40',
  },
}

export function StatusBadge({ status, size = 'md', onClick, interactive = false }: StatusBadgeProps) {
  const config = statusConfig[status]
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:scale-105 hover:ring-2 hover:ring-white/10 active:scale-95 select-none'
    : ''

  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      title={interactive ? 'Clique para alternar o status' : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() } : undefined}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200
        ${textSize} ${padding} ${config.badge} ${interactiveClasses}
      `}
    >
      <span className={`rounded-full animate-pulse-slow ${dotSize} ${config.dot}`} />
      {config.label}
    </span>
  )
}
