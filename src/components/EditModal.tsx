import { useState, useEffect, useRef } from 'react'
import { X, Globe, Mail, Flame, Triangle, FileText, ExternalLink, Component, Database, LayoutPanelTop } from 'lucide-react'
import type { Project } from '../types'

interface EditModalProps {
  project: Project
  onSave: (projectId: string, updates: Partial<Project>) => void
  onClose: () => void
}

interface FormField {
  key: keyof Project
  label: string
  icon: React.ReactNode
  placeholder: string
  type: 'text' | 'textarea'
}

const FORM_FIELDS: FormField[] = [
  {
    key: 'url',
    label: 'URL de Produção',
    icon: <Globe size={14} />,
    placeholder: 'https://meu-app.vercel.app',
    type: 'text',
  },
  {
    key: 'hostingAccount',
    label: 'Conta de E-mail Responsável',
    icon: <Mail size={14} />,
    placeholder: 'usuario@gmail.com',
    type: 'text',
  },
  {
    key: 'firebaseLogin',
    label: 'Identificador Firebase',
    icon: <Flame size={14} />,
    placeholder: 'projeto-id ou email@gmail.com',
    type: 'text',
  },
  {
    key: 'vercelLogin',
    label: 'Identificador Vercel',
    icon: <Triangle size={14} />,
    placeholder: 'username ou email@gmail.com',
    type: 'text',
  },
  {
    key: 'modules',
    label: 'Módulos de Negócio',
    icon: <Component size={14} />,
    placeholder: 'Login, Dashboard, Financeiro, Relatórios...',
    type: 'textarea',
  },
  {
    key: 'entities',
    label: 'Entidades de Dados',
    icon: <Database size={14} />,
    placeholder: 'Usuários, Produtos, Transações, Logs...',
    type: 'textarea',
  },
  {
    key: 'notes',
    label: 'Notas Adicionais',
    icon: <FileText size={14} />,
    placeholder: 'Observações sobre infraestrutura, domínios, etc...',
    type: 'textarea',
  },
]

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  if (!value) return null

  const isUrl = value.startsWith('http')

  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span className="text-slate-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">{label}</p>
        {isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 break-all"
          >
            {value}
            <ExternalLink size={10} className="flex-shrink-0" />
          </a>
        ) : (
          <p className="text-sm text-slate-300 break-words leading-relaxed whitespace-pre-wrap">{value}</p>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3 mt-2">
      <span className="text-blue-500/70">{icon}</span>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</h3>
    </div>
  )
}

export function EditModal({ project, onSave, onClose }: EditModalProps) {
  const [formData, setFormData] = useState({
    url: project.url ?? '',
    hostingAccount: project.hostingAccount ?? '',
    firebaseLogin: project.firebaseLogin ?? '',
    vercelLogin: project.vercelLogin ?? '',
    modules: project.modules ?? '',
    entities: project.entities ?? '',
    notes: project.notes ?? '',
  })

  const [isEditing, setIsEditing] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose()
  }

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onSave(project.id, formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      url: project.url ?? '',
      hostingAccount: project.hostingAccount ?? '',
      firebaseLogin: project.firebaseLogin ?? '',
      vercelLogin: project.vercelLogin ?? '',
      modules: project.modules ?? '',
      entities: project.entities ?? '',
      notes: project.notes ?? '',
    })
    setIsEditing(false)
  }

  const hasHostingData = formData.url || formData.hostingAccount || formData.firebaseLogin || formData.vercelLogin
  const hasDimData = formData.modules || formData.entities
  const hasAnyData = hasHostingData || hasDimData || formData.notes

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div
        ref={modalRef}
        className="
          w-full max-w-2xl max-h-[90vh] overflow-y-auto
          bg-[#0f172a] border border-slate-700/50
          rounded-2xl shadow-2xl shadow-black/60
          animate-modal-in flex flex-col
        "
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-slate-800/80 bg-[#0f172a]/95 backdrop-blur-sm rounded-t-2xl">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-100 truncate">{project.name}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 uppercase tracking-wide font-mono">
              <LayoutPanelTop size={12} className="text-blue-500" />
              Arquitetura &amp; Infraestrutura
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700/50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6 flex-1">
          {/* Info View (read-only) */}
          {!isEditing && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Infrastructure Column */}
                <div className="space-y-4">
                  <SectionTitle label="Infraestrutura" icon={<Globe size={13} />} />
                  <div className="space-y-1">
                    <InfoRow label="Produção" value={formData.url} icon={<Globe size={13} />} />
                    <InfoRow label="E-mail" value={formData.hostingAccount} icon={<Mail size={13} />} />
                    <InfoRow label="Firebase" value={formData.firebaseLogin} icon={<Flame size={13} />} />
                    <InfoRow label="Vercel" value={formData.vercelLogin} icon={<Triangle size={13} />} />
                  </div>
                </div>

                {/* Dimension Column */}
                <div className="space-y-4">
                  <SectionTitle label="Dimensão do Projeto" icon={<Component size={13} />} />
                  <div className="space-y-1">
                    <InfoRow label="Módulos" value={formData.modules} icon={<Component size={13} />} />
                    <InfoRow label="Entidades" value={formData.entities} icon={<Database size={13} />} />
                  </div>
                </div>
              </div>

              {formData.notes && (
                <div className="pt-2">
                  <SectionTitle label="Notas" icon={<FileText size={13} />} />
                  <InfoRow label="Observações" value={formData.notes} icon={<FileText size={13} />} />
                </div>
              )}

              {!hasAnyData && (
                <p className="text-sm text-slate-600 italic py-6 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                  Nenhuma especificação técnica cadastrada para este projeto.
                </p>
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="
                  w-full mt-4 px-5 py-3 rounded-xl text-sm font-semibold
                  bg-blue-600/10 text-blue-400 border border-blue-500/20
                  hover:bg-blue-600/20 hover:border-blue-400/40
                  active:scale-[0.98] transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                ✏️ Editar Configurações
              </button>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FORM_FIELDS.map(({ key, label, icon, placeholder, type }) => (
                  <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                      <span className="text-blue-500/60">{icon}</span>
                      {label}
                    </label>
                    {type === 'textarea' ? (
                      <textarea
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="
                          w-full px-4 py-3 rounded-xl text-sm
                          bg-slate-900/60 border border-slate-700/40
                          text-slate-200 placeholder:text-slate-700
                          focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20
                          focus:outline-none transition-all duration-200
                          resize-none
                        "
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="
                          w-full px-4 py-3 rounded-xl text-sm
                          bg-slate-900/60 border border-slate-700/40
                          text-slate-200 placeholder:text-slate-700
                          focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20
                          focus:outline-none transition-all duration-200
                        "
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <button
                  onClick={handleCancel}
                  className="
                    flex-1 px-5 py-3 rounded-xl text-sm font-medium
                    text-slate-400 border border-slate-700/50
                    hover:text-slate-300 hover:border-slate-600 hover:bg-slate-800/60
                    active:scale-[0.98] transition-all duration-200
                  "
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="
                    flex-1 px-5 py-3 rounded-xl text-sm font-bold
                    bg-blue-600 text-slate-100 shadow-lg shadow-blue-900/20
                    hover:bg-blue-500 hover:scale-[1.01]
                    active:scale-[0.98] transition-all duration-200
                  "
                >
                  Confirmar Alterações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
