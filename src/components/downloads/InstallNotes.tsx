import { useState, type ReactNode } from 'react';
import { Check, Copy, Info } from 'lucide-react';

/**
 * Bloco de "antes de instalar" abaixo dos cartões de plataforma. Os instaladores
 * não são assinados, então o sistema bloqueia a primeira abertura — isto diz ao
 * usuário como liberar em vez de ele achar que o arquivo veio corrompido.
 */
export function InstallNotes({ children }: { children: ReactNode }) {
  return (
    <section className="mt-12 p-6 sm:p-8 rounded-3xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-6 text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 shrink-0" />
        Antes de instalar
      </h2>
      <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700 dark:text-slate-300">{children}</div>
    </section>
  );
}

export function InstallNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </div>
  );
}

/** Comando de terminal com botão de copiar. */
export function CommandSnippet({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão de clipboard: o usuário ainda pode selecionar o texto.
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-900 text-slate-100 pl-4 pr-2 py-2">
      <code className="flex-1 min-w-0 break-all text-xs sm:text-sm">{command}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copiado' : 'Copiar comando'}
        className="shrink-0 p-2 rounded-lg hover:bg-slate-700 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
