import { Download, Monitor, Apple } from 'lucide-react';
import { DownloadLayout } from './DownloadLayout';
import { PlatformCard } from './PlatformCard';
import { CommandSnippet, InstallNote, InstallNotes } from './InstallNotes';

const VERSION = '1.6.0';

/**
 * Página de download do AutoMove — mesmo conteúdo que já existia em
 * DownloadsPage.tsx, só reorganizado para a moldura compartilhada.
 */
export function AutoMoveDownloadPage() {
  return (
    <DownloadLayout
      icon={<Download className="w-8 h-8" />}
      title="Download do AutoMove"
      description="Automatize seus lançamentos da MV de forma rápida e segura. Escolha a versão adequada para o seu sistema operacional."
      footerNote={`Versão atual: ${VERSION} Windows e ${VERSION} macOS`}
    >
      <div className="grid md:grid-cols-2 gap-8">
        <PlatformCard
          icon={<Monitor className="w-16 h-16 text-blue-500" />}
          title="Windows"
          description="Compatível com Windows 10 e Windows 11 (64-bits)."
          links={[
            {
              label: 'Baixar para Windows',
              href: `https://github.com/andresonrmota/automove/releases/download/v${VERSION}/AutoMove.Setup.${VERSION}.exe`,
            },
          ]}
        />

        <PlatformCard
          icon={<Apple className="w-16 h-16 text-slate-800 dark:text-slate-200" />}
          title="macOS"
          description="Compatível com macOS Monterey ou superior."
          links={[
            {
              label: 'Apple Silicon',
              href: `https://github.com/andresonrmota/automove/releases/download/v${VERSION}/AutoMove-${VERSION}-arm64.dmg`,
              variant: 'secondary',
            },
            {
              label: 'Processador Intel',
              href: `https://github.com/andresonrmota/automove/releases/download/v${VERSION}/AutoMove-${VERSION}.dmg`,
              variant: 'secondary',
            },
          ]}
        />
      </div>

      <InstallNotes>
        <InstallNote title="Navegador obrigatório">
          <p>
            A automação usa o <strong>Google Chrome</strong> ou o <strong>Microsoft Edge</strong>. Tenha um deles
            instalado antes de abrir o AutoMove.
          </p>
        </InstallNote>

        <InstallNote title="Windows: aviso do SmartScreen">
          <p>
            Se aparecer <em>“O Windows protegeu o computador”</em>, clique em <strong>Mais informações</strong> e depois
            em <strong>Executar assim mesmo</strong>.
          </p>
        </InstallNote>

        <InstallNote title="macOS: “o app está danificado” ou “não pode ser aberto”">
          <p>
            O app ainda não é assinado pela Apple, então o macOS bloqueia a primeira abertura. Depois de arrastar o
            AutoMove para <strong>Aplicativos</strong>, abra o Terminal e rode:
          </p>
          <CommandSnippet command="xattr -cr /Applications/AutoMove.app" />
        </InstallNote>

        <InstallNote title="macOS: sem usar o Terminal">
          <p>
            Tente abrir o app uma vez, vá em <strong>Ajustes do Sistema → Privacidade e Segurança</strong>, role até o
            aviso sobre o AutoMove e clique em <strong>Abrir Mesmo Assim</strong>.
          </p>
        </InstallNote>
      </InstallNotes>
    </DownloadLayout>
  );
}
