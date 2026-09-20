import React from 'react';
import { Calculator, Layers, Printer, History, Settings } from 'lucide-react';
import { useCalculatorStore, type ActiveTab } from '../../store/useCalculatorStore';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useCalculatorStore();

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'calculator', label: 'Cálculo', icon: <Calculator className="w-5 h-5" /> },
    { id: 'filaments', label: 'Filamentos', icon: <Layers className="w-5 h-5" /> },
    { id: 'printers', label: 'Máquinas', icon: <Printer className="w-5 h-5" /> },
    { id: 'history', label: 'Salvos', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Ajustes', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 safe-area-pb shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-around h-14 px-1 safe-area-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? 'text-[#065F46] dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? 'font-bold' : 'font-normal'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
