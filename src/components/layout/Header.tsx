import React from 'react';
import { Menu, ShieldCheck, Flame } from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';

export const Header: React.FC = () => {
  const { setDrawerOpen } = useCalculatorStore();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#065F46] flex items-center justify-center text-white shadow-xs">
              <Flame className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-[17px] text-slate-900 tracking-tight block leading-tight">
                ForgeCalc<span className="text-[#065F46]">3D</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">
                Custos & Precificação
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge 100% Offline */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#065F46] text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#065F46]" />
            <span className="hidden sm:inline">100% Offline</span>
            <span className="sm:hidden">Offline</span>
          </div>
        </div>
      </div>
    </header>
  );
};
