import type { ReactNode } from 'react';

interface DownloadLayoutProps {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  footerNote: string;
}

/**
 * Moldura comum às páginas de download: hero com ícone e título, conteúdo e uma
 * nota de rodapé. Existe para as páginas de cada projeto não duplicarem o mesmo
 * header/footer — só o conteúdo do meio muda.
 *
 * Sem barra de topo e com espaçamento enxuto de propósito: as instruções de
 * instalação ficam abaixo dos cartões e precisam caber na primeira tela, senão
 * ninguém rola e todo mundo acha que o instalador veio quebrado.
 */
export function DownloadLayout({ icon, title, description, children, footerNote }: DownloadLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 text-slate-800 dark:bg-[#0a0e1a] dark:text-slate-200">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 mb-4">
            {icon}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto">{description}</p>
        </div>

        {children}

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>{footerNote}</p>
        </div>
      </main>
    </div>
  );
}
