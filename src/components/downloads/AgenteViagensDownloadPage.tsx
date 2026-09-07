import { Plane, Monitor, Apple, ExternalLink, HelpCircle } from 'lucide-react';
import { DownloadLayout } from './DownloadLayout';
import { PlatformCard } from './PlatformCard';

const VERSION = '1.0.2';
const RELEASE_URL = 'https://github.com/andresonrmota/developer-dashboard/releases/tag/v1.0.2av';
const DOWNLOAD_WINDOWS =
  'https://github.com/andresonrmota/developer-dashboard/releases/download/v1.0.2av/AgenteViagens-Setup-v1.0.2.exe';
const DOWNLOAD_MACOS =
  'https://github.com/andresonrmota/developer-dashboard/releases/download/v1.0.2av/AgenteViagens-1.0.2-macos-arm64.zip';

/**
 * Página de download do Agente de Viagens.
 *
 * Oferece instaladores nativos para Windows (x64) e macOS (Apple Silicon).
 */
export function AgenteViagensDownloadPage() {
  return (
    <DownloadLayout
      icon={<Plane className="w-8 h-8" />}
      title="Download do Agente Viagens"
      description="Automação desktop assistida para envio de mensagens de aniversário e relacionamento com clientes via WhatsApp Web. Escolha a versão adequada para o seu sistema operacional."
      footerNote={`Versão oficial: v${VERSION} (Windows x64 e macOS Apple Silicon)`}
    >
      <div className="grid md:grid-cols-2 gap-8">
        <PlatformCard
          icon={<Monitor className="w-16 h-16 text-blue-500" />}
          title="Windows"
          description="Instalador oficial compatível com Windows 10 e Windows 11 (64-bits)."
          links={[
            {
              label: 'Baixar Instalador Windows (.exe)',
              href: DOWNLOAD_WINDOWS,
              variant: 'primary',
            },
          ]}
        />

        <PlatformCard
          icon={<Apple className="w-16 h-16 text-slate-800 dark:text-slate-200" />}
          title="macOS"
          description="Pacote otimizado para Apple Silicon (chips M1, M2, M3 e M4)."
          links={[
            {
              label: 'Baixar para macOS (.zip)',
              href: DOWNLOAD_MACOS,
              variant: 'primary',
            },
          ]}
        />
      </div>

      {/* Dicas de Primeiro Acesso */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 shadow-sm text-sm text-slate-600 dark:text-slate-400">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          Orientações de Primeiro Acesso
        </h3>
        <ul className="space-y-2 list-disc list-inside">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">No Windows:</strong> Se o SmartScreen exibir a mensagem <em>"O Windows protegeu o seu computador"</em>, clique no link <u>Mais informações</u> e depois em <u>Executar assim mesmo</u>.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">No macOS:</strong> Descompacte o arquivo ZIP e arraste o aplicativo para a pasta <em>Aplicativos</em>. Na primeira abertura, se solicitado pelo Gatekeeper, clique com o botão direito no app pelo Finder e escolha <u>Abrir</u>.
          </li>
        </ul>
      </div>

      {/* Link para Release no GitHub */}
      <div className="mt-8 text-center">
        <a
          href={RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-all shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Ver notas da versão {VERSION} no GitHub
        </a>
      </div>
    </DownloadLayout>
  );
}
