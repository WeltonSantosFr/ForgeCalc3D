import React, { useEffect } from 'react';
import { useCalculatorStore } from './store/useCalculatorStore';
import { useThemeStore } from './store/useThemeStore';
import { useLanguageStore } from './store/useLanguageStore';
import { ensureDefaultSettings } from './db/db';
import { Header } from './components/layout/Header';
import { SidebarDrawer } from './components/layout/SidebarDrawer';
import { BottomNav } from './components/layout/BottomNav';
import { CalculatorView } from './components/calculator/CalculatorView';
import { FilamentList } from './components/filaments/FilamentList';
import { PrinterList } from './components/printers/PrinterList';
import { SavedCalculations } from './components/history/SavedCalculations';
import { SettingsView } from './components/settings/SettingsView';

export const App: React.FC = () => {
  const { activeTab, applySettingsDefaults } = useCalculatorStore();
  const { initTheme } = useThemeStore();
  const { initLanguage } = useLanguageStore();

  useEffect(() => {
    // Inicializa o tema ativo (localStorage / preferências do sistema)
    initTheme();

    // Inicializa o idioma ativo (localStorage / preferências do sistema)
    initLanguage();

    // Inicializa as configurações padrão no IndexedDB caso ainda não existam
    ensureDefaultSettings().then((settings) => {
      applySettingsDefaults(settings);
    });
  }, [applySettingsDefaults, initTheme, initLanguage]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Barra de Topo */}
      <Header />

      {/* Menu Lateral Retrátil (Mobile Drawer) */}
      <SidebarDrawer />

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto py-5 sm:py-7 main-content-padding pl-[calc(0.875rem+var(--safe-area-left))] pr-[calc(0.875rem+var(--safe-area-right))] min-[360px]:pl-[calc(1rem+var(--safe-area-left))] min-[360px]:pr-[calc(1rem+var(--safe-area-right))] sm:pl-[calc(1.5rem+var(--safe-area-left))] sm:pr-[calc(1.5rem+var(--safe-area-right))]">
        {activeTab === 'calculator' && <CalculatorView />}
        {activeTab === 'filaments' && <FilamentList />}
        {activeTab === 'printers' && <PrinterList />}
        {activeTab === 'history' && <SavedCalculations />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Navegação Inferior para Mobile */}
      <BottomNav />
    </div>
  );
};

export default App;
