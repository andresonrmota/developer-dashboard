import { useState } from 'react'
import { ExternalLink, GitBranch, Clock, Tag, Settings, Folder } from 'lucide-react'
import type { Project } from '../types'
import { StatusBadge } from './StatusBadge'
import { StackBadge } from './StackBadge'
import { EditModal } from './EditModal'
import { sanitizeUrl } from '../lib/sanitize'

interface ProjectCardProps {
  project: Project
  isModified?: boolean
  isOwner?: boolean
  onStatusToggle?: (projectId: string) => void
  onProjectUpdate?: (projectId: string, updates: Partial<Project>) => void
}

import { formatDateTime } from '../lib/format'

/** Data do último commit: a do GitHub; se não houver, a do mapeamento; por último, a do Firestore. */
function commitIso(project: Project): string | undefined {
  if (project.lastCommitAt) return project.lastCommitAt
  if (project.lastUpdated) return project.lastUpdated
  const ts = project.updatedAt
  if (ts?.toDate) return ts.toDate().toISOString()
  return undefined
}

function hasMetadata(project: Project): boolean {
  return !!(
    project.hostingAccount ||
    project.firebaseLogin ||
    project.vercelLogin ||
    project.notes ||
    project.modules ||
    project.entities
  )
}

export function ProjectCard({ project, isModified = false, isOwner = false, onStatusToggle, onProjectUpdate }: ProjectCardProps) {
  const [showModal, setShowModal] = useState(false)
  const hasMeta = hasMetadata(project)

  // Sanitize URLs before rendering
  const safeUrl = sanitizeUrl(project.url)
  const safeRepoUrl = sanitizeUrl(project.repoUrl)

  return (
    <>
      <article
        className={`
          card-glass rounded-xl p-5 flex flex-col gap-4
          transition-all duration-300 cursor-default group relative
          animate-slide-up h-full min-h-[220px]
          ${isModified ? 'card-modified' : ''}
        `}
      >
        {/* Edit button — only visible for owner */}
        {isOwner && (
          <button
            onClick={() => setShowModal(true)}
            className={`
              absolute top-3 right-3 p-1.5 rounded-lg
              transition-all duration-200 z-10
              ${hasMeta
                ? 'text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10'
                : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-400 hover:bg-slate-700/50'
              }
            `}
            title="Editar metadados"
          >
            <Settings size={14} />
          </button>
        )}

        <div className="flex-1 flex flex-col gap-4">
          {/* Top Row: Name + Status */}
          <div className={`flex items-start justify-between gap-3 ${isOwner ? 'pr-6' : ''}`}>
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                {project.name}
              </h3>
              {(project.category || project.group) && (
                <span className="flex items-center gap-2 mt-0.5 text-slate-400 dark:text-slate-500 text-xs">
                  {project.group && (
                    <span className="flex items-center gap-1" title="Pasta em ProjetosIA">
                      <Folder size={10} />
                      {project.group}
                    </span>
                  )}
                  {project.category && (
                    <span className="flex items-center gap-1">
                      <Tag size={10} />
                      {project.category}
                    </span>
                  )}
                </span>
              )}
            </div>
            <StatusBadge
              status={project.status}
              interactive={isOwner && !!onStatusToggle}
              onClick={isOwner && onStatusToggle ? () => onStatusToggle(project.id) : undefined}
            />
          </div>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {project.description}
          </p>

          {/* Metadata indicators */}
          {hasMeta && (
            <div className="flex flex-wrap gap-1.5">
              {project.hostingAccount && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-500 border border-slate-200 dark:border-slate-700/40">
                  📧 {project.hostingAccount.split('@')[0]}
                </span>
              )}
              {project.firebaseLogin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/5 text-amber-500/70 border border-amber-500/15">
                  🔥 Firebase
                </span>
              )}
              {project.vercelLogin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/40">
                  ▲ Vercel
                </span>
              )}
              {project.modules && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/5 text-blue-400/70 border border-blue-500/15">
                  🧩 {project.modules.split(',').length} Módulos
                </span>
              )}
              {project.entities && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-500/5 text-violet-400/70 border border-violet-500/15">
                  🗄️ {project.entities.split(',').length} Entidades
                </span>
              )}
            </div>
          )}

          {/* Stack Badges */}
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <StackBadge key={tech} tech={tech} />
            ))}
          </div>
        </div>

        {/* Footer: Version + Date + Links */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-mono text-slate-500 dark:text-slate-400">
              <GitBranch size={11} className="text-blue-600 dark:text-blue-400" />
              v{project.version}
            </span>
            <span className="flex items-center gap-1" title={project.lastCommitAt ? 'Último commit (lido do GitHub)' : 'Último commit (mapeamento local)'}>
              <Clock size={11} />
              {formatDateTime(commitIso(project))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {safeRepoUrl && (
              <a
                href={safeRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-700/50"
                title="Repositório"
                onClick={(e) => e.stopPropagation()}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
            {safeUrl && (
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-blue-400 transition-colors p-1 rounded hover:bg-blue-500/10"
                title="Abrir projeto"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </article>

      {/* Edit Modal — only renders for owner */}
      {isOwner && showModal && (
        <EditModal
          project={project}
          onSave={(id, updates) => {
            onProjectUpdate?.(id, updates)
            setShowModal(false)
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
