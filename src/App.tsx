import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './lib/firebase'
import { useAuth } from './hooks/useAuth'
import { fetchGithubInfo } from './lib/githubVersions'
import type { FilterState, Project, ProjectStatus } from './types'
import portfolioData from './data/portfolio.json'
import { Header, MetricsBar } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { ProjectCard } from './components/ProjectCard'
import { EmptyState } from './components/EmptyState'
import { AutoMoveDownloadPage } from './components/downloads/AutoMoveDownloadPage'
import { VideoDownloaderDownloadPage } from './components/downloads/VideoDownloaderDownloadPage'
import { AgenteConectaDownloadPage } from './components/downloads/AgenteConectaDownloadPage'
import { MapearModal } from './components/MapearModal'
import { Loader2 } from 'lucide-react'
import pkg from '../package.json'

// Cyclic status order for toggling
const STATUS_CYCLE: ProjectStatus[] = ['production', 'beta', 'development']

/**
 * Campos cuja fonte de verdade é o src/data/portfolio.json (gerado por
 * `npm run mapear`). O Smart Sync empurra qualquer diferença neles pro
 * Firestore. Os demais (status, url, hostingAccount, modules, notes…) vivem
 * no Firestore e são editados no próprio app — o JSON nunca os sobrescreve.
 */
const JSON_OWNED_FIELDS = ['name', 'description', 'version', 'stack', 'repoUrl', 'category', 'group', 'lastUpdated'] as const

const localProjects = portfolioData as unknown as Project[]

/** Data da última mudança: o último commit quando o mapeamento informou, senão o updatedAt do Firestore. */
function lastChangeSeconds(p: Project): number {
  if (p.lastUpdated) return Date.parse(p.lastUpdated) / 1000
  return p.updatedAt?.seconds ?? 0
}

function App() {
  const { user, isOwner, login, loginGithub, githubToken, logout, loading: authLoading } = useAuth()
  // Versões lidas do GitHub no login com GitHub (só owner, só em memória)
  const [githubVersions, setGithubVersions] = useState<Record<string, string>>({})
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })
  const [filter, setFilter] = useState<FilterState>({
    query: '',
    status: 'all',
    sortField: 'lastUpdated', // We'll map this to updatedAt internally
    sortOrder: 'desc',
  })
  const [lastSyncDate, setLastSyncDate] = useState<string>(new Date().toLocaleString('pt-BR').replace(', ', ' - '))
  const [showMapear, setShowMapear] = useState(false)

  // Roteamento simples por pathname
  const normalizedPath = window.location.pathname.replace(/\/+$/, '')
  if (normalizedPath === '/downloads') {
    return <AutoMoveDownloadPage />
  }
  if (normalizedPath === '/downloads/video-downloader') {
    return <VideoDownloaderDownloadPage />
  }
  if (
    normalizedPath === '/downloads/agente-conecta' ||
    normalizedPath === '/downloads/agente-viagens' ||
    normalizedPath === '/downloads/agente-de-viagens'
  ) {
    return <AgenteConectaDownloadPage />
  }

  // Real-time synchronization (read-only for all users)
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('name', 'asc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsList: Project[] = []
      snapshot.forEach((doc) => {
        projectsList.push({ id: doc.id, ...doc.data() } as Project)
      })
      
      setProjects(projectsList)
      setLoading(false)

      // Seed data if collection is empty (only owner can do this)
      if (snapshot.empty && loading && isOwner) {
        seedData()
      }
    })

    return () => unsubscribe()
  }, [loading, isOwner])

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  // Versões do GitHub: lidas ao conectar e pelo botão "Atualizar do GitHub".
  // Quando a versão muda, grava a nova versão e a data/hora da integração no Firestore.
  const projectsRef = useRef<Project[]>([])
  useEffect(() => {
    projectsRef.current = projects
  }, [projects])

  const readGithubVersions = useCallback(async (token: string) => {
    const info = await fetchGithubInfo(localProjects, token)
    setGithubVersions(
      Object.fromEntries(Object.entries(info).flatMap(([id, i]) => (i.version ? [[id, i.version]] : []))),
    )
    const now = new Date().toISOString()
    for (const [id, i] of Object.entries(info)) {
      const current = projectsRef.current.find((p) => p.id === id)
      const versionChanged = !!i.version && current?.version !== i.version
      const commitChanged = !!i.lastCommitAt && current?.lastCommitAt !== i.lastCommitAt
      // Primeira leitura de um projeto também registra a integração
      const firstRead = !!i.version && !current?.githubSyncedAt
      if (!versionChanged && !commitChanged && !firstRead) continue

      const data: Record<string, unknown> = { updatedAt: serverTimestamp() }
      if (i.version) data.version = i.version
      if (i.lastCommitAt) data.lastCommitAt = i.lastCommitAt
      if (versionChanged || firstRead) data.githubSyncedAt = now
      try {
        await updateDoc(doc(db, 'projects', id), data)
      } catch (e) {
        console.error('GitHub sync error:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (isOwner && githubToken) readGithubVersions(githubToken)
  }, [isOwner, githubToken, readGithubVersions])

  // Última integração via GitHub entre todos os projetos (mostrada no cabeçalho)
  const lastGithubSync = useMemo(() => {
    let latest: string | undefined
    for (const p of projects) {
      if (p.githubSyncedAt && (!latest || p.githubSyncedAt > latest)) latest = p.githubSyncedAt
    }
    return latest
  }, [projects])

  // Botão do cabeçalho: conecta (se preciso) ou relê as versões
  const handleGithubClick = useCallback(() => {
    if (githubToken) readGithubVersions(githubToken)
    else loginGithub()
  }, [githubToken, readGithubVersions, loginGithub])

  // Versão do GitHub prevalece sobre a do portfolio.json quando disponível
  const effectiveLocal = useMemo(
    () => localProjects.map((p) => (githubVersions[p.id] ? { ...p, version: githubVersions[p.id] } : p)),
    [githubVersions],
  )

  // Smart Sync: o que o JSON manda (ver JSON_OWNED_FIELDS) vai pro Firestore; projetos novos são criados (owner only)
  useEffect(() => {
    if (!isOwner || projects.length === 0) return

    effectiveLocal.forEach(async (local) => {
      const remote = projects.find(p => p.id === local.id)

      if (remote) {
        const updates: Record<string, unknown> = {}
        for (const field of JSON_OWNED_FIELDS) {
          // Versão já integrada pelo GitHub não volta para a do portfolio.json
          if (field === 'version' && remote.githubSyncedAt) continue
          if (local[field] !== undefined && JSON.stringify(local[field]) !== JSON.stringify(remote[field])) {
            updates[field] = local[field]
          }
        }
        if (Object.keys(updates).length > 0) {
          console.log(`Smart Sync: ${local.name} → ${Object.keys(updates).join(', ')}`)
          try {
            await updateDoc(doc(db, 'projects', local.id), { ...updates, updatedAt: serverTimestamp() })
          } catch (e) {
            console.error("Sync error (update):", e)
          }
        }
      } else {
        // Add missing project
        console.log(`Smart Sync: Adicionando novo projeto ${local.name} ao Firestore`)
        try {
          const { id, ...data } = local
          await setDoc(doc(db, 'projects', id), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        } catch (e) {
          console.error("Sync error (add):", e)
        }
      }
    })
    
    // Update last sync visual indicator
    setLastSyncDate(new Date().toLocaleString('pt-BR').replace(', ', ' - '))
  }, [isOwner, projects, effectiveLocal])

  // Function to seed initial data from JSON to Firestore (owner only)
  const seedData = async () => {
    if (!isOwner) return
    console.log('Seeding initial data to Firestore...')
    for (const project of localProjects) {
      const { id, ...data } = project
      await setDoc(doc(db, 'projects', id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }

  // Toggle a project's status directly in Firestore (owner only)
  const handleStatusToggle = useCallback(async (projectId: string) => {
    if (!isOwner) return

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
  }, [projects, isOwner])

  // Update any field(s) of a project directly in Firestore (owner only)
  const handleProjectUpdate = useCallback(async (projectId: string, updates: Partial<Project>) => {
    if (!isOwner) return

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error updating project:', err)
    }
  }, [isOwner])

  const filteredProjects = useMemo(() => {
    const q = filter.query.toLowerCase().trim()

    return projects
      .filter((project) => {
        // Status filter
        if (filter.status !== 'all' && project.status !== filter.status) {
          return false
        }

        // Search filter — match name, description, stack, category, group, owner
        if (q) {
          const searchable = [
            project.name,
            project.description,
            project.category ?? '',
            project.group ?? '',
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
          cmp = lastChangeSeconds(a) - lastChangeSeconds(b)
        } else if (sortField === 'status') {
          const order = ['production', 'beta', 'development', 'maintenance', 'archived']
          cmp = order.indexOf(a.status) - order.indexOf(b.status)
        }

        return sortOrder === 'asc' ? cmp : -cmp
      })
  }, [filter, projects])

  const hasActiveFilter = filter.query !== '' || filter.status !== 'all'

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a] text-blue-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-mono animate-pulse">Conectando ao Firestore...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-slate-50'}`}>
      <Header 
        user={user} 
        isOwner={isOwner} 
        onLogin={login} 
        onLogout={logout}
        onLoginGithub={handleGithubClick}
        githubConnected={!!githubToken}
        lastGithubSync={lastGithubSync}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        onMapear={isOwner && import.meta.env.DEV ? () => setShowMapear(true) : undefined}
      />

      {showMapear && <MapearModal onClose={() => setShowMapear(false)} />}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Bar: Metrics + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 transition-all hover:shadow-md dark:hover:bg-slate-900/60">
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
            <span className="dark:text-slate-500 text-slate-400">Ordenar por:</span>
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
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isOwner={isOwner}
                onStatusToggle={isOwner ? handleStatusToggle : undefined}
                onProjectUpdate={isOwner ? handleProjectUpdate : undefined}
              />
            ))
          ) : (
            <EmptyState hasFilter={hasActiveFilter} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-600">
          <span className="order-2 md:order-1">Dev Portal v{pkg.version} · Real-time Dashboard</span>
          
          <div className="order-1 md:order-2 flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/40 rounded-full border border-slate-200 dark:border-slate-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              Último Scan: <span className="text-slate-700 dark:text-slate-400">{lastSyncDate}</span>
            </span>
          </div>

          <span className="order-3 font-mono">
            {projects.length} projeto{projects.length !== 1 ? 's' : ''} sincronizado{projects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
