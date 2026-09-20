import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, AlertCircle, Zap, Clock } from 'lucide-react';
import { db } from '../../db/db';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { parseNumericInput, parseIntegerInput } from '../../utils/inputs';

export const PrinterSelector: React.FC = () => {
  const { input, setInput, setActiveTab } = useCalculatorStore();
  const { t, language } = useTranslation();
  const printers = useLiveQuery(() => db.printers.toArray()) || [];

  const selectedPrinter = printers.find((p) => p.id === input.printerId);

  const powerWatts = selectedPrinter ? selectedPrinter.powerWatts : (Number(input.manualPowerWatts) || 0);

  const decimalHours = (Number(input.printHours) || 0) + (Number(input.printMinutes) || 0) / 60;
  const estimatedKwh = (powerWatts / 1000) * decimalHours;

  const handlePrinterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === 'manual') {
      setInput({ printerId: '' });
      return;
    }

    const printer = printers.find((p) => p.id === id);
    if (printer) {
      setInput({
        printerId: printer.id,
      });
    }
  };

  return (
    <Card
      title={t('calc.printerSectionTitle')}
      subtitle={t('calc.printerSectionSubtitle')}
      action={
        <button
          onClick={() => setActiveTab('printers')}
          className="text-xs font-semibold text-[#065F46] dark:text-emerald-400 hover:text-[#047857] dark:hover:text-emerald-300 inline-flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('common.manage')}
        </button>
      }
    >
      <div className="space-y-4">
        {printers.length > 0 ? (
          <div>
            <Select
              label={t('calc.registeredPrinter')}
              value={input.printerId || 'manual'}
              onChange={handlePrinterChange}
              options={[
                { value: 'manual', label: t('common.customManual') },
                ...printers.map((p) => ({
                  value: p.id,
                  label: p.name,
                  sublabel: `${p.powerWatts}W • ${formatCurrency(p.maintenanceRatePerHour, language)}/h`,
                })),
              ]}
            />
          </div>
        ) : (
          <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                {t('calc.noPrinterRegistered')}
              </p>
            </div>
          </div>
        )}

        {/* Campos manuais se não selecionou do banco */}
        {!selectedPrinter && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <Input
              label={t('calc.powerWatts')}
              type="number"
              step="1"
              min="0"
              suffixText="W"
              value={input.manualPowerWatts ?? ''}
              onChange={(e) =>
                setInput({ manualPowerWatts: parseNumericInput(e.target.value) })
              }
              placeholder="150"
              error={
                typeof input.manualPowerWatts === 'number' && input.manualPowerWatts < 0
                  ? t('calc.priceNonNegative')
                  : undefined
              }
            />
            <Input
              label={`${t('calc.energyRate')} (${t('common.currencyPerKwh')})`}
              type="number"
              step="any"
              min="0"
              prefixText={t('common.currencyPrefix')}
              suffixText="/kWh"
              value={input.manualEnergyRateKwh ?? ''}
              onChange={(e) =>
                setInput({ manualEnergyRateKwh: parseNumericInput(e.target.value) })
              }
              placeholder="0.85"
              error={
                typeof input.manualEnergyRateKwh === 'number' && input.manualEnergyRateKwh < 0
                  ? t('calc.priceNonNegative')
                  : undefined
              }
            />
            <Input
              label={`${t('calc.maintenanceRate')} (${t('common.currencyPerHour')})`}
              type="number"
              step="any"
              min="0"
              prefixText={t('common.currencyPrefix')}
              suffixText="/h"
              value={input.manualMaintenanceRatePerHour ?? ''}
              onChange={(e) =>
                setInput({ manualMaintenanceRatePerHour: parseNumericInput(e.target.value) })
              }
              placeholder="1.50"
              error={
                typeof input.manualMaintenanceRatePerHour === 'number' && input.manualMaintenanceRatePerHour < 0
                  ? t('calc.priceNonNegative')
                  : undefined
              }
            />
          </div>
        )}

        {/* Tempo de impressão: Horas e Minutos */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('calc.printHours')}
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="1"
            min="0"
            suffixText="h"
            value={input.printHours ?? ''}
            onChange={(e) =>
              setInput({ printHours: parseIntegerInput(e.target.value) })
            }
            placeholder="0"
            error={
              typeof input.printHours === 'number' && input.printHours < 0
                ? t('calc.priceNonNegative')
                : undefined
            }
          />
          <Input
            label={t('calc.printMinutes')}
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="1"
            min="0"
            max="59"
            suffixText="min"
            value={input.printMinutes ?? ''}
            onChange={(e) =>
              setInput({ printMinutes: parseIntegerInput(e.target.value) })
            }
            placeholder="0"
            error={
              typeof input.printMinutes === 'number' &&
              (input.printMinutes < 0 || input.printMinutes > 59)
                ? '0 - 59'
                : undefined
            }
          />
        </div>

        {/* Resumo do Tempo e Consumo */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col justify-center gap-0.5 min-w-0">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium text-[11px] truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
              <span className="truncate">{t('calc.totalTime')}:</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">
              {formatNumber(decimalHours, 2, language)} h
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col justify-center gap-0.5 min-w-0">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium text-[11px] truncate">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{t('calc.estimatedKwh')}:</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">
              {formatNumber(estimatedKwh, 3, language)} kWh
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
