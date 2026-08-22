import type { ReactNode } from 'react';
import { Download } from 'lucide-react';

interface DownloadLink {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

interface PlatformCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  links: DownloadLink[];
}

const VARIANT_CLASSES: Record<'primary' | 'secondary', string> = {
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white',
  secondary:
    'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700',
};

/** Um cartão de plataforma (Windows, macOS...) com um ou mais botões de download. */
export function PlatformCard({ icon, title, description, links }: PlatformCardProps) {
  return (
    <div className="flex flex-col items-center p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-16 h-16 mb-6 flex items-center justify-center">{icon}</div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-slate-500 text-center mb-8">{description}</p>
      <div className="w-full mt-auto flex flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`w-full flex items-center justify-center gap-2 font-medium py-3 px-6 rounded-xl transition-colors ${VARIANT_CLASSES[link.variant ?? 'primary']}`}
          >
            <Download className="w-5 h-5" />
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Mesmo cartão, mas sem link nenhum ainda — para quando o instalador não foi publicado. */
export function PendingPlatformCard({
  icon,
  title,
  description,
  note = 'Disponível em breve',
}: {
  icon: ReactNode;
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm opacity-70">
      <div className="w-16 h-16 mb-6 flex items-center justify-center">{icon}</div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-slate-500 text-center mb-8">{description}</p>
      <div
        aria-disabled="true"
        className="w-full mt-auto flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 font-medium py-3 px-6 rounded-xl cursor-not-allowed select-none"
      >
        <Download className="w-5 h-5" />
        {note}
      </div>
    </div>
  );
}
