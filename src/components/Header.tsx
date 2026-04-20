import { LayoutGrid, Zap, CheckCircle2, Code2 } from 'lucide-react'
import type { Project, ProjectStatus } from '../types'

interface MetricCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  accent?: string
}

function MetricCard({ label, value, icon, accent = 'text-blue-400' }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 bg-slate-800/20 border border-slate-700/30 rounded-xl px-3 py-2 min-w-[100px] flex-shrink-0 transition-all hover:bg-slate-800/40">
      <div className={`${accent} opacity-70 scale-90`}>{icon}</div>
      <div>
        <p className={`text-lg font-bold font-mono ${accent} leading-none`}>{value}</p>
        <p className="text-slate-500 text-[10px] mt-0.5 leading-none uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function countByStatus(projects: Project[], status: ProjectStatus): number {
  return projects.filter((p) => p.status === status).length
}

export function MetricsBar({ projects }: { projects: Project[] }) {
  const total = projects.length
  const inProduction = countByStatus(projects, 'production')
  const inDevelopment = countByStatus(projects, 'development') + countByStatus(projects, 'beta')
  
  const allStacks = projects.flatMap((p) => p.stack)
  const uniqueStacks = new Set(allStacks.map((s) => s.toLowerCase())).size

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MetricCard
        label="Total"
        value={total}
        icon={<LayoutGrid size={16} />}
        accent="text-blue-400"
      />
      <MetricCard
        label="Produção"
        value={inProduction}
        icon={<CheckCircle2 size={16} />}
        accent="text-emerald-400"
      />
      <MetricCard
        label="Dev"
        value={inDevelopment}
        icon={<Zap size={16} />}
        accent="text-amber-400"
      />
      <MetricCard
        label="Stacks"
        value={uniqueStacks}
        icon={<Code2 size={16} />}
        accent="text-violet-400"
      />
    </div>
  )
}

export function Header() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-[#0a0e1a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Code2 size={16} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-slate-100 font-semibold text-lg leading-none tracking-tight">
                Dev Portal
              </h1>
              <p className="text-slate-600 text-[11px] font-mono mt-0.5">
                Internal Developer Dashboard
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            {dateStr}
          </div>
        </div>
      </div>
    </header>
  )
}
