import { Video, Monitor } from 'lucide-react';
import { DownloadLayout } from './DownloadLayout';
import { PendingPlatformCard } from './PlatformCard';

const VERSION = '0.9';

/**
 * Página de download do Video Downloader.
 *
 * Só Windows por enquanto, de propósito: a versão macOS não passa por aqui —
 * um .app baixado pelo navegador ganha o atributo de quarentena e, sem
 * assinatura Apple Developer, o Gatekeeper bloqueia mesmo (não é só um aviso
 * contornável). No Mac o caminho é compilar localmente a partir do
 * repositório (ver README do projeto).
 *
 * O link do Windows ainda não existe — vira um botão real assim que o
 * primeiro Release com o .exe for publicado no GitHub. Basta trocar o
 * PendingPlatformCard abaixo por um PlatformCard com o href do asset,
 * seguindo o mesmo padrão de AutoMoveDownloadPage.tsx.
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
          <PendingPlatformCard
            icon={<Monitor className="w-16 h-16 text-blue-500" />}
            title="Windows"
            description="Compatível com Windows 10 e Windows 11 (64-bits)."
          />
        </div>
      </div>
    </DownloadLayout>
  );
}
