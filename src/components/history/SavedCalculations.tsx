import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  History,
  Trash2,
  Share2,
  Calculator,
  Search,
  Check,
  Calendar,
} from 'lucide-react';
import { db } from '../../db/db';
import type { SavedCalculation } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency, formatGrams } from '../../utils/formatters';

export const SavedCalculations: React.FC = () => {
  const calculations =
    useLiveQuery(() => db.savedCalculations.orderBy('createdAt').reverse().toArray()) || [];
  const { loadSavedCalculation, setActiveTab } = useCalculatorStore();
  const { t, language } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = calculations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(t('history.deleteConfirmDesc', { name }))) {
      await db.savedCalculations.delete(id);
    }
  };

  const handleCopy = async (calc: SavedCalculation) => {
    const text = `
🎯 *${language === 'pt' ? 'ORÇAMENTO DE IMPRESSÃO 3D - FORGECALC3D' : '3D PRINT QUOTATION - FORGECALC3D'}*
📦 ${language === 'pt' ? 'Peça' : 'Part'}: *${calc.name}*
📅 ${language === 'pt' ? 'Data' : 'Date'}: ${new Date(calc.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}
───────────────
🧵 ${language === 'pt' ? 'Filamento' : 'Filament'}: ${calc.filamentName || (language === 'pt' ? 'Manual' : 'Custom')} (${formatGrams(calc.result.filamentWeightWithLoss, language)})
⏱️ ${language === 'pt' ? 'Tempo de Impressão' : 'Print Time'}: ${calc.input.printHours || 0}h ${calc.input.printMinutes || 0}m
⚡ ${language === 'pt' ? 'Impressora' : 'Printer'}: ${calc.printerName || (language === 'pt' ? 'Manual' : 'Custom')}

📊 *${t('calc.costBreakdown')}:*
• ${t('calc.filamentCost')}: ${formatCurrency(calc.result.filamentCost, language)}
• ${t('calc.energyCost')}: ${formatCurrency(calc.result.energyCost, language)}
• ${t('calc.operatorLabor')}: ${formatCurrency(calc.result.laborCost, language)}
• ${t('calc.maintenanceCost')}: ${formatCurrency(calc.result.maintenanceCost, language)}
• ${t('calc.extrasTotal')}: ${formatCurrency(calc.result.extraCostsTotal, language)}
───────────────
💰 *${t('calc.totalCost')}: ${formatCurrency(calc.result.totalCost, language)}*

🏷️ *${t('calc.wholesalePrice')} (${calc.input.resellerMultiplier}x): ${formatCurrency(calc.result.resellerPrice, language)}*
⭐ *${t('calc.retailPrice')} (${calc.input.retailMultiplier}x): ${formatCurrency(calc.result.retailPrice, language)}*
${calc.notes ? `\n📝 ${t('calc.notes')}: ${calc.notes}` : ''}
`.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(calc.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-[#065F46] dark:text-emerald-400 shrink-0" />
            <span>{t('history.title')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto sm:mx-0">
            {t('history.subtitle')}
          </p>
        </div>
      </div>

      {/* Busca */}
      {calculations.length > 0 && (
        <div className="max-w-md mx-auto sm:mx-0">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder={language === 'pt' ? 'Buscar por nome da peça ou notas...' : 'Search by part name or notes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Grid de Orçamentos */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((calc) => (
            <div
              key={calc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(calc.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(calc)}
                      className="p-1.5 text-slate-400 hover:text-[#065F46] hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                      title={language === 'pt' ? 'Copiar texto do orçamento' : 'Copy quote summary'}
                    >
                      {copiedId === calc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(calc.id, calc.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="font-heading text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-2">
                  {calc.name}
                </h2>

                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex flex-wrap gap-x-2 gap-y-1">
                  <span>🧵 {calc.filamentName || (language === 'pt' ? 'Manual' : 'Custom')}</span>
                  <span>•</span>
                  <span>⏱️ {calc.input.printHours || 0}h{calc.input.printMinutes || 0}m</span>
                </div>

                {calc.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg italic mb-3 border border-slate-100 dark:border-slate-800">
                    "{calc.notes}"
                  </p>
                )}

                {/* Preços */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 mb-4 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 dark:text-slate-400">{t('calc.totalCost')}:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {formatCurrency(calc.result.totalCost, language)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 dark:text-slate-400">{t('calc.retailPrice')}:</span>
                    <span className="font-bold text-[#065F46] dark:text-emerald-400 text-sm">
                      {formatCurrency(calc.result.retailPrice, language)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Calculator className="w-3.5 h-3.5" />}
                onClick={() => loadSavedCalculation(calc)}
              >
                {t('history.reloadInCalculator')}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#065F46] dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            {searchTerm ? (language === 'pt' ? 'Nenhum orçamento encontrado' : 'No quotes found') : t('history.empty')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {t('history.emptyDesc')}
          </p>
          <Button
            variant="primary"
            icon={<Calculator className="w-4 h-4" />}
            onClick={() => setActiveTab('calculator')}
          >
            {t('history.goToCalculator')}
          </Button>
        </div>
      )}
    </div>
  );
};
