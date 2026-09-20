import React, { useEffect } from 'react';
import {
  Calculator,
  Layers,
  Printer,
  History,
  Settings as SettingsIcon,
  X,
  HardDrive,
} from 'lucide-react';
import { useCalculatorStore, type ActiveTab } from '../../store/useCalculatorStore';

interface NavItem {
  id: ActiveTab;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const SidebarDrawer: React.FC = () => {
  const { activeTab, setActiveTab, isDrawerOpen, setDrawerOpen } = useCalculatorStore();

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
      label: 'Calculadora',
      description: 'Orçamento rápido de peças',
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      id: 'filaments',
      label: 'Filamentos',
      description: 'Cadastro e custos por grama',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'printers',
      label: 'Impressoras',
      description: 'Consumo (W) e taxas de desgaste',
      icon: <Printer className="w-5 h-5" />,
    },
    {
      id: 'history',
      label: 'Orçamentos Salvos',
      description: 'Histórico e compartilhamento',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Configurações & Backup',
      description: 'Tarifas, margens e dados JSON',
      icon: <SettingsIcon className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform safe-area-pl ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu principal"
      >
        {/* Header do Drawer */}
        <div className="px-4 pb-4 pt-[calc(1rem+var(--safe-area-top))] border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="ForgeCalc3D"
              className="w-9 h-9 rounded-xl object-contain shadow-sm border border-slate-200/80 shrink-0"
            />
            <div>
              <h1 className="font-heading font-extrabold text-[18px] text-slate-900 leading-tight">
                ForgeCalc<span className="text-[#065F46]">3D</span>
              </h1>
              <p className="text-[11px] text-slate-500">
                Calculadora & Precificação 3D
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Fechar menu"
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
                    ? 'bg-emerald-50 text-[#065F46] font-semibold shadow-2xs border border-emerald-200/70'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-[#065F46] text-white'
                      : 'bg-slate-100 text-slate-500'
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
                      isActive ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Rodapé do Drawer */}
        <div className="px-4 pt-4 pb-[calc(1rem+var(--safe-area-bottom))] border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HardDrive className="w-4 h-4 text-[#065F46]" />
            <span>Dados gravados localmente (IndexedDB)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            ForgeCalc3D v1.0 • Operação 100% Offline
          </div>
        </div>
      </aside>
    </>
  );
};
