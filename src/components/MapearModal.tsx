import { useEffect, useState } from 'react'
import { X, FolderSync, Loader2, RefreshCw, Terminal } from 'lucide-react'
import { CommandSnippet } from './downloads/InstallNotes'

/** Relatório devolvido por scripts/mapear-projetos.mjs --json */
interface Relatorio {
  base: string
  total: number
  github: boolean
  novos: { id: string; name: string; folder: string; version: string; description: string }[]
  atualizados: { id: string; name: string; mudancas: string[] }[]
  inalterados: string[]
  semPasta: string[]
  terceiros: string[]
  semRemoto: string[]
}

/**
 * O mesmo processo, para quando o botão não estiver à mão (outra máquina, sem
 * dev server): cola no Claude Code aberto na pasta do dashboard.
 */
export const PROMPT_CLAUDE = [
  'Na pasta do developer-dashboard, rode `npm run mapear` e leia o relatório.',
  'Para cada projeto em NOVOS, revise em src/data/portfolio.json a descrição (uma frase, o que o projeto faz) e o status (production se tem versão >= 1.0 e está em uso; beta se está em validação; development se não).',
  'Confira os SEM PASTA LOCAL: mantenha só os que ainda existem.',
  'Rode `npm run build`, faça commit e push.',
  'Depois abra o dashboard logado como owner: o Smart Sync envia as mudanças ao Firestore sozinho.',
].join(' ')

type Estado = { fase: 'rodando' } | { fase: 'ok'; rel: Relatorio } | { fase: 'erro'; msg: string }

export function MapearModal({ onClose }: { onClose: () => void }) {
  const [estado, setEstado] = useState<Estado>({ fase: 'rodando' })

  useEffect(() => {
    const ctrl = new AbortController()
    fetch('/__mapear', { method: 'POST', signal: ctrl.signal })
      .then(async (r) => {
        const body = await r.json()
        if (!r.ok) throw new Error(body.error ?? `HTTP ${r.status}`)
        setEstado({ fase: 'ok', rel: body })
      })
      .catch((e: Error) => { if (e.name !== 'AbortError') setEstado({ fase: 'erro', msg: e.message }) })
    return () => ctrl.abort()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/60 animate-modal-in text-slate-200">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0f172a]/95 backdrop-blur-sm rounded-t-2xl">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-100">
            <FolderSync size={16} className="text-amber-400" />
            Mapear projetos
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 text-sm">
          {estado.fase === 'rodando' && (
            <p className="flex items-center gap-2 text-slate-400 py-6 justify-center">
              <Loader2 size={16} className="animate-spin" /> Lendo a pasta de projetos…
            </p>
          )}

          {estado.fase === 'erro' && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-red-300">
              <p className="font-semibold mb-1">O mapeamento falhou</p>
              <pre className="text-xs whitespace-pre-wrap break-words text-red-200/80">{estado.msg}</pre>
            </div>
          )}

          {estado.fase === 'ok' && <RelatorioView rel={estado.rel} />}

          <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4 space-y-2">
            <p className="flex items-center gap-2 font-semibold text-slate-300">
              <Terminal size={14} className="text-slate-500" /> Sem o botão? Peça ao Claude
            </p>
            <p className="text-xs text-slate-500">Em outra máquina ou sem o dev server, cole isto no Claude Code aberto na pasta do dashboard:</p>
            <CommandSnippet command={PROMPT_CLAUDE} />
          </div>
        </div>

        {estado.fase === 'ok' && (
          <div className="sticky bottom-0 px-6 py-4 border-t border-slate-800/80 bg-[#0f172a]/95 backdrop-blur-sm rounded-b-2xl flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-slate-700/50 hover:text-slate-300 hover:border-slate-600 transition-all">
              Fechar
            </button>
            <button onClick={() => window.location.reload()} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-slate-100 hover:bg-blue-500 transition-all">
              <RefreshCw size={14} /> Recarregar e sincronizar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Lista({ titulo, itens, tom }: { titulo: string; itens: string[]; tom: string }) {
  if (itens.length === 0) return null
  return (
    <div>
      <p className={`font-semibold mb-1.5 ${tom}`}>{titulo} ({itens.length})</p>
      <ul className="space-y-1 text-xs text-slate-400 font-mono">
        {itens.map((i) => <li key={i} className="break-words">{i}</li>)}
      </ul>
    </div>
  )
}

function RelatorioView({ rel }: { rel: Relatorio }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500 font-mono break-all">
        {rel.base} · {rel.total} projetos no JSON · GitHub {rel.github ? 'consultado' : 'indisponível'}
      </p>
      <Lista
        titulo="Novos — revise descrição e status no portfolio.json"
        tom="text-emerald-400"
        itens={rel.novos.map((n) => `${n.id}  [${n.folder}]  v${n.version}${n.description ? '' : '  (sem descrição)'}`)}
      />
      <Lista titulo="Atualizados" tom="text-blue-400" itens={rel.atualizados.map((a) => `${a.id}: ${a.mudancas.join('; ')}`)} />
      <Lista titulo="Sem pasta local — ainda valem?" tom="text-amber-400" itens={rel.semPasta} />
      <Lista titulo="Ignorados (outro dono)" tom="text-slate-500" itens={rel.terceiros} />
      <Lista titulo="Ignorados (sem remoto)" tom="text-slate-500" itens={rel.semRemoto} />
      {rel.inalterados.length > 0 && <p className="text-xs text-slate-500">Inalterados: {rel.inalterados.length}</p>}
      <p className="text-xs text-slate-400 border-t border-slate-800 pt-3">
        O JSON já foi gravado. Ao recarregar, o Smart Sync envia nome, descrição, versão, stack, repositório, categoria, pasta e data ao Firestore.
        Status, URL e notas continuam sendo editados aqui no app.
      </p>
    </div>
  )
}
