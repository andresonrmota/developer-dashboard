import { useState, useMemo, useCallback, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './lib/firebase'
import type { FilterState, Project, ProjectStatus } from './types'
import portfolioData from './data/portfolio.json'
import { Header, MetricsBar } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { ProjectCard } from './components/ProjectCard'
import { EmptyState } from './components/EmptyState'
import { Loader2 } from 'lucide-react'

// Cyclic status order for toggling
const STATUS_CYCLE: ProjectStatus[] = ['production', 'beta', 'development']

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterState>({
    query: '',
    status: 'all',
    sortField: 'lastUpdated', // We'll map this to updatedAt internally
    sortOrder: 'desc',
  })

  // Real-time synchronization
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('name', 'asc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsList: Project[] = []
      snapshot.forEach((doc) => {
        projectsList.push({ id: doc.id, ...doc.data() } as Project)
      })
      
      setProjects(projectsList)
      setLoading(false)

      // Seed data if collection is empty
      if (snapshot.empty && loading) {
        seedData()
      }
    })

    return () => unsubscribe()
  }, [])

  // Function to seed initial data from JSON to Firestore
  const seedData = async () => {
    console.log('Seeding initial data to Firestore...')
    for (const project of (portfolioData as any[])) {
      const { id, ...data } = project
      await setDoc(doc(db, 'projects', id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }

  // Toggle a project's status directly in Firestore
  const handleStatusToggle = useCallback(async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    const currentIndex = STATUS_CYCLE.indexOf(project.status)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % STATUS_CYCLE.length
    const nextStatus = STATUS_CYCLE[nextIndex]

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }, [projects])

  // Update any field(s) of a project directly in Firestore
  const handleProjectUpdate = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error updating project:', err)
    }
  }, [])

  const filteredProjects = useMemo(() => {
    const q = filter.query.toLowerCase().trim()

    return projects
      .filter((project) => {
        // Status filter
        if (filter.status !== 'all' && project.status !== filter.status) {
          return false
        }

        // Search filter — match name, description, stack, category, owner
        if (q) {
          const searchable = [
            project.name,
            project.description,
            project.category ?? '',
            project.owner ?? '',
            ...project.stack,
          ]
            .join(' ')
            .toLowerCase()
          return searchable.includes(q)
        }

        return true
      })
      .sort((a, b) => {
        const { sortField, sortOrder } = filter
        let cmp = 0

        if (sortField === 'name') {
          cmp = a.name.localeCompare(b.name)
        } else if (sortField === 'lastUpdated') {
          // Use updatedAt timestamp for sorting
          const timeA = a.updatedAt?.seconds ?? 0
          const timeB = b.updatedAt?.seconds ?? 0
          cmp = timeA - timeB
        } else if (sortField === 'status') {
          const order = ['production', 'beta', 'development', 'maintenance', 'archived']
          cmp = order.indexOf(a.status) - order.indexOf(b.status)
        }

        return sortOrder === 'asc' ? cmp : -cmp
      })
  }, [filter, projects])

  const hasActiveFilter = filter.query !== '' || filter.status !== 'all'

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a] text-blue-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-mono animate-pulse">Conectando ao Firestore...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Bar: Metrics + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 transition-all hover:bg-slate-900/60">
          <MetricsBar projects={projects} />
          
          <div className="flex-1 max-w-2xl w-full">
            <SearchBar
              filter={filter}
              onFilterChange={setFilter}
              totalCount={projects.length}
              filteredCount={filteredProjects.length}
            />
          </div>
        </div>

        {/* Sort controls */}
        {projects.length > 0 && (
          <div className="flex items-center gap-2 mb-5 text-xs text-slate-500">
            <span>Ordenar por:</span>
            {(
              [
                { field: 'lastUpdated', label: 'Atualização' },
                { field: 'name',        label: 'Nome' },
                { field: 'status',      label: 'Status' },
              ] as const
            ).map(({ field, label }) => (
              <button
                key={field}
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    sortField: field,
                    sortOrder:
                      prev.sortField === field && prev.sortOrder === 'desc'
                        ? 'asc'
                        : 'desc',
                  }))
                }
                className={`
                  px-2.5 py-1 rounded-md border transition-all duration-150
                  ${
                    filter.sortField === field
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700/50 hover:border-slate-600 text-slate-500 hover:text-slate-400'
                  }
                `}
              >
                {label}
                {filter.sortField === field && (
                  <span className="ml-1 opacity-70">
                    {filter.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onStatusToggle={handleStatusToggle}
                onProjectUpdate={handleProjectUpdate}
              />
            ))
          ) : (
            <EmptyState hasFilter={hasActiveFilter} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-600">
          <span>Dev Portal · Real-time Dashboard</span>
          <span className="font-mono">
            {projects.length} projeto{projects.length !== 1 ? 's' : ''} sincronizado{projects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
