import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Layers, Plus, AlertCircle } from 'lucide-react';
import { db } from '../../db/db';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatCurrency } from '../../utils/formatters';
import { parseNumericInput, parseIntegerInput } from '../../utils/inputs';

export const FilamentSelector: React.FC = () => {
  const { input, setInput, setActiveTab } = useCalculatorStore();
  const { t, language } = useTranslation();
  const filaments = useLiveQuery(() => db.filaments.toArray()) || [];

  const selectedFilament = filaments.find((f) => f.id === input.filamentId);

  // Calcula custo por grama em tempo real
  const spoolPrice = selectedFilament ? selectedFilament.spoolPrice : (Number(input.manualSpoolPrice) || 0);
  const spoolWeight = selectedFilament ? selectedFilament.spoolWeightGrams : (Number(input.manualSpoolWeightGrams) || 0);
  const costPerGram = spoolWeight > 0 ? spoolPrice / spoolWeight : 0;

  const handleFilamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === 'manual') {
      setInput({
        filamentId: '',
        lossMarginPercent: 5,
      });
      return;
    }

    const filament = filaments.find((f) => f.id === id);
    if (filament) {
      setInput({
        filamentId: filament.id,
        lossMarginPercent: filament.defaultLossMarginPercent ?? 5,
      });
    }
  };

  return (
    <Card
      title={t('calc.filamentSectionTitle')}
      subtitle={t('calc.filamentSectionSubtitle')}
      action={
        <button
          onClick={() => setActiveTab('filaments')}
          className="text-xs font-semibold text-[#065F46] dark:text-emerald-400 hover:text-[#047857] dark:hover:text-emerald-300 inline-flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('common.manage')}
        </button>
      }
    >
      <div className="space-y-4">
        {filaments.length > 0 ? (
          <div>
            <Select
              label={t('calc.registeredFilament')}
              value={input.filamentId || 'manual'}
              onChange={handleFilamentChange}
              options={[
                { value: 'manual', label: t('common.customManual') },
                ...filaments.map((f) => ({
                  value: f.id,
                  label: `${f.name} (${f.material})`,
                  sublabel: `${formatCurrency(f.spoolPrice, language)} / ${f.spoolWeightGrams}g`,
                })),
              ]}
            />
          </div>
        ) : (
          <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                {t('calc.noFilamentRegistered')}
              </p>
            </div>
          </div>
        )}

        {/* Campos manuais se não selecionou nenhum do banco */}
        {!selectedFilament && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <Input
              label={t('calc.spoolPrice')}
              labelClassName="min-h-[2rem] sm:min-h-0"
              type="number"
              step="any"
              min="0"
              prefixText={t('common.currencyPrefix')}
              value={input.manualSpoolPrice ?? ''}
              onChange={(e) =>
                setInput({ manualSpoolPrice: parseNumericInput(e.target.value) })
              }
              placeholder="110.00"
              error={
                typeof input.manualSpoolPrice === 'number' && input.manualSpoolPrice < 0
                  ? t('calc.priceNonNegative')
                  : undefined
              }
            />
            <Input
              label={t('calc.spoolWeight')}
              labelClassName="min-h-[2rem] sm:min-h-0"
              type="number"
              step="1"
              min="1"
              suffixText="g"
              value={input.manualSpoolWeightGrams ?? ''}
              onChange={(e) =>
                setInput({ manualSpoolWeightGrams: parseIntegerInput(e.target.value) })
              }
              placeholder="1000"
              error={
                typeof input.manualSpoolWeightGrams === 'number' && input.manualSpoolWeightGrams <= 0
                  ? t('calc.spoolWeightPositive')
                  : undefined
              }
            />
          </div>
        )}

        {/* Custo por grama estimado */}
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-lg text-xs">
          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
            {t('calc.costPerGram')}:
          </span>
          <span className="font-bold text-[#065F46] dark:text-emerald-400">
            {formatCurrency(costPerGram, language)}/g
          </span>
        </div>

        {/* Peso da peça e Margem de perda */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('calc.pieceWeight')}
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="any"
            min="0"
            suffixText="g"
            value={input.filamentWeightGrams ?? ''}
            onChange={(e) =>
              setInput({ filamentWeightGrams: parseNumericInput(e.target.value) })
            }
            placeholder="Ex: 85"
            helperText={
              typeof input.filamentWeightGrams === 'number' &&
              spoolWeight > 0 &&
              input.filamentWeightGrams > spoolWeight
                ? 'Aviso: Peso da peça maior que o carretel total'
                : undefined
            }
            error={
              typeof input.filamentWeightGrams === 'number' && input.filamentWeightGrams < 0
                ? t('calc.priceNonNegative')
                : undefined
            }
          />
          <Input
            label={t('calc.lossMargin')}
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="any"
            min="0"
            max="100"
            suffixText="%"
            value={input.lossMarginPercent ?? ''}
            onChange={(e) =>
              setInput({ lossMarginPercent: parseNumericInput(e.target.value) })
            }
            placeholder="5"
            helperText={t('calc.lossMarginHelper')}
            error={
              typeof input.lossMarginPercent === 'number' &&
              (input.lossMarginPercent < 0 || input.lossMarginPercent > 100)
                ? '0% - 100%'
                : undefined
            }
          />
        </div>
      </div>
    </Card>
  );
};
