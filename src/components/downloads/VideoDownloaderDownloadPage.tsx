import { Video, Monitor } from 'lucide-react';
import { DownloadLayout } from './DownloadLayout';
import { PlatformCard } from './PlatformCard';

const VERSION = '1.0.0';

/**
 * Página de download do Video Downloader.
 *
 * Só Windows por enquanto, de propósito: a versão macOS não passa por aqui —
 * um .app baixado pelo navegador ganha o atributo de quarentena e, sem
 * assinatura Apple Developer, o Gatekeeper bloqueia mesmo (não é só um aviso
 * contornável). No Mac o caminho é compilar localmente a partir do
 * repositório (ver README do projeto).
 */
export function VideoDownloaderDownloadPage() {
  return (
    <DownloadLayout
      icon={<Video className="w-8 h-8" />}
      title="Download do Video Downloader"
      description="Baixe vídeos e áudios do YouTube colando um link — sem terminal, sem instalar nada. Escolha a versão adequada para o seu sistema operacional."
      footerNote={`Versão atual: ${VERSION} (Windows)`}
    >
      <div className="grid place-items-center">
        <div className="w-full max-w-sm">
          <PlatformCard
            icon={<Monitor className="w-16 h-16 text-blue-500" />}
            title="Windows"
            description="Compatível com Windows 10 e Windows 11 (64-bits)."
            links={[
              {
                label: 'Baixar para Windows',
                href: 'https://github.com/andresonrmota/developer-dashboard/releases/download/v1.0.0/VideoDownloader-1.0.0-windows-x64-installer.exe',
              },
            ]}
          />
        </div>
      </div>
    </DownloadLayout>
  );
}
