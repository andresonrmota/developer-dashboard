import { Download, Monitor, Apple, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function DownloadsPage() {
  const [isDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0e1a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
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
            <Download className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Download do AutoMove</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Automatize seus lançamentos da MV de forma rápida e segura. Escolha a versão adequada para o seu sistema operacional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Windows Card */}
          <div className="flex flex-col items-center p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
            <Monitor className="w-16 h-16 text-blue-500 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Windows</h2>
            <p className="text-slate-500 text-center mb-8">
              Compatível com Windows 10 e Windows 11 (64-bits).
            </p>
            <a
              href="https://github.com/andresonrmota/automove/releases/download/v1.6.0/AutoMove.Setup.1.6.0.exe"
              className="w-full my-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              Baixar para Windows
            </a>
          </div>

          {/* macOS Card */}
          <div className="flex flex-col items-center p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
            <Apple className="w-16 h-16 text-slate-800 dark:text-slate-200 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">macOS</h2>
            <p className="text-slate-500 text-center mb-8">
              Compatível com macOS Monterey ou superior.
            </p>
            <div className="w-full mt-auto flex flex-col gap-3">
              <a
                href="https://github.com/andresonrmota/automove/releases/download/v1.6.0/AutoMove-1.6.0-arm64.dmg"
                className="w-full flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-200 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 font-medium py-3 px-6 rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
                Apple Silicon
              </a>
              <a
                href="https://github.com/andresonrmota/automove/releases/download/v1.6.0/AutoMove-1.6.0.dmg"
                className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium py-3 px-6 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Download className="w-5 h-5" />
                Processador Intel
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-slate-500">
          <p>Versão atual: 1.6.0 Windows e 1.6.0 MacOs</p>
        </div>
      </main>
    </div>
  );
}
