import React, { useEffect } from 'react';
import {
  Calculator,
  Layers,
  Printer,
  History,
  Settings as SettingsIcon,
  X,
  HardDrive,
  Globe,
} from 'lucide-react';
import { useCalculatorStore, type ActiveTab } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';
import { Select } from '../common/Select';
import type { LanguageMode } from '../../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const SidebarDrawer: React.FC = () => {
  const { activeTab, setActiveTab, isDrawerOpen, setDrawerOpen } = useCalculatorStore();
  const { t, languageMode, setLanguageMode } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setDrawerOpen]);

  const navItems: NavItem[] = [
    {
      id: 'calculator',
      label: t('nav.calculator'),
      description: t('nav.calculatorDesc'),
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      id: 'filaments',
      label: t('nav.filaments'),
      description: t('nav.filamentsDesc'),
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'printers',
      label: t('nav.printers'),
      description: t('nav.printersDesc'),
      icon: <Printer className="w-5 h-5" />,
    },
    {
      id: 'history',
      label: t('nav.history'),
      description: t('nav.historyDesc'),
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      description: t('nav.settingsDesc'),
      icon: <SettingsIcon className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform safe-area-pl ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label={t('common.openNavMenu')}
      >
        {/* Header do Drawer */}
        <div className="px-4 pb-4 pt-[calc(1rem+var(--safe-area-top))] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="ForgeCalc3D"
              className="w-9 h-9 rounded-xl object-contain shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
            />
            <div>
              <h1 className="font-heading font-extrabold text-[18px] text-slate-900 dark:text-white leading-tight">
                ForgeCalc<span className="text-[#065F46] dark:text-emerald-400">3D</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('common.appSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label={t('common.closeNavMenu')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#065F46] dark:text-emerald-300 font-semibold shadow-2xs border border-emerald-200/70 dark:border-emerald-800/60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-[#065F46] dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-medium leading-snug">
                    {item.label}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Seletor de Idioma (Logo acima do Rodapé) */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Globe className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
            <span>{t('common.language')}</span>
          </div>
          <Select
            id="sidebar-language-select"
            value={languageMode}
            onChange={(e) => setLanguageMode(e.target.value as LanguageMode)}
            options={[
              { value: 'system', label: t('common.langAuto') },
              { value: 'pt', label: 'Português' },
              { value: 'en', label: 'English' },
            ]}
            className="text-xs py-1.5"
          />
        </div>

        {/* Rodapé do Drawer */}
        <div className="px-4 pt-4 pb-[calc(1rem+var(--safe-area-bottom))] border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <HardDrive className="w-4 h-4 text-[#065F46] dark:text-emerald-400" />
            <span>{t('common.localDbInfo')}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            {t('common.allRightsReserved')}
          </div>
        </div>
      </aside>
    </>
  );
};
