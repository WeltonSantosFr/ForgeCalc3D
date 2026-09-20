import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';

export const Header: React.FC = () => {
  const { setDrawerOpen } = useCalculatorStore();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs safe-area-pt safe-area-pl safe-area-pr transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-3.5 min-[360px]:px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors focus:outline-none"
            aria-label={t('common.openNavMenu')}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="ForgeCalc3D"
              className="w-8 h-8 rounded-lg object-contain shadow-xs border border-slate-200/80 dark:border-slate-700 shrink-0"
            />
            <div>
              <span className="font-heading font-extrabold text-[17px] text-slate-900 dark:text-white tracking-tight block leading-tight">
                ForgeCalc<span className="text-[#065F46] dark:text-emerald-400">3D</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 block -mt-0.5">
                {t('common.costsAndPricing')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge 100% Offline */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-[#065F46] dark:text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
            <span className="hidden sm:inline">{t('common.offlineBadge')}</span>
            <span className="sm:hidden">{t('common.offlineShort')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
