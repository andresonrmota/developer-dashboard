import { PackageOpen, Plus } from 'lucide-react'

interface EmptyStateProps {
  hasFilter: boolean
}

export function EmptyState({ hasFilter }: EmptyStateProps) {
  if (hasFilter) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
          <PackageOpen size={24} className="text-slate-500" />
        </div>
        <p className="text-slate-400 font-medium">Nenhum projeto encontrado</p>
        <p className="text-slate-600 text-sm mt-1">
          Tente ajustar os filtros de busca
        </p>
      </div>
    )
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
        <Plus size={28} className="text-blue-400" />
      </div>
      <p className="text-slate-300 font-semibold text-lg">
        Seu portfólio está vazio
      </p>
      <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
        Adicione seus projetos em{' '}
        <code className="text-blue-400 text-xs bg-blue-500/10 px-1.5 py-0.5 rounded font-mono">
          src/data/portfolio.json
        </code>{' '}
        para começar.
      </p>
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/40 text-blue-400 rounded-lg text-sm font-medium transition-all duration-200"
      >
        Ver exemplo de schema
      </a>
    </div>
  )
}
