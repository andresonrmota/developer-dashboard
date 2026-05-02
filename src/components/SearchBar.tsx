import { Search, X, SlidersHorizontal } from 'lucide-react'
import type { FilterState, ProjectStatus } from '../types'

interface SearchBarProps {
  filter: FilterState
  onFilterChange: (filter: FilterState) => void
  totalCount: number
  filteredCount: number
}

const STATUS_OPTIONS: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'Todos os status' },
  { value: 'production',  label: 'Produção' },
  { value: 'beta',        label: 'Beta' },
  { value: 'development', label: 'Desenvolvimento' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'archived',    label: 'Arquivados' },
]

export function SearchBar({
  filter,
  onFilterChange,
  totalCount,
  filteredCount,
}: SearchBarProps) {
  const hasActiveFilter = filter.query !== '' || filter.status !== 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar por nome ou tecnologia..."
          value={filter.query}
          onChange={(e) =>
            onFilterChange({ ...filter, query: e.target.value })
          }
          className="
            w-full bg-slate-50 dark:bg-[#111827]/80 border border-slate-200 dark:border-slate-700/60 rounded-lg
            pl-10 pr-10 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600
            focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
            transition-all duration-200
          "
        />
        {filter.query && (
          <button
            onClick={() => onFilterChange({ ...filter, query: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="relative flex items-center gap-2">
        <SlidersHorizontal size={14} className="text-slate-500" />
        <select
          value={filter.status}
          onChange={(e) =>
            onFilterChange({
              ...filter,
              status: e.target.value as ProjectStatus | 'all',
            })
          }
          className="
            bg-slate-50 dark:bg-[#111827]/80 border border-slate-200 dark:border-slate-700/60 rounded-lg
            px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300
            focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
            transition-all duration-200 appearance-none pr-8 cursor-pointer
          "
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <div className="text-xs text-slate-500 whitespace-nowrap">
        {hasActiveFilter ? (
          <span>
            <span className="text-blue-400 font-medium">{filteredCount}</span>
            {' / '}{totalCount} projetos
          </span>
        ) : (
          <span>
            <span className="text-slate-400 font-medium">{totalCount}</span>
            {' '}projetos
          </span>
        )}
      </div>
    </div>
  )
}
