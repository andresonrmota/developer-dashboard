import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface DownloadLayoutProps {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  footerNote: string;
}

/**
 * Moldura comum às páginas de download: cabeçalho com "voltar", hero com ícone
 * e título, e uma nota de rodapé. Existe para as páginas de cada projeto não
 * duplicarem o mesmo header/footer — só o conteúdo do meio muda.
 */
export function DownloadLayout({ icon, title, description, children, footerNote }: DownloadLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 text-slate-800 dark:bg-[#0a0e1a] dark:text-slate-200">
      <header className="border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <a href="/" className="flex items-center gap-2 text-sm font-medium hover:text-blue-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Dashboard
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 mb-6">
            {icon}
          </div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{description}</p>
        </div>

        {children}

        <div className="mt-16 text-center text-sm text-slate-500">
          <p>{footerNote}</p>
        </div>
      </main>
    </div>
  );
}
