import React, { useState } from 'react';
import { Plus, Trash2, PackagePlus, UserCheck } from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { parseNumericInput, parseIntegerInput } from '../../utils/inputs';

export const LaborAndExtras: React.FC = () => {
  const { input, setInput, addExtraCost, removeExtraCost } = useCalculatorStore();
  const { t, language } = useTranslation();

  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState('');

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = Number(parseNumericInput(newCost));
    if (!newDesc.trim() || isNaN(costNum) || costNum <= 0) return;

    addExtraCost(newDesc.trim(), costNum);
    setNewDesc('');
    setNewCost('');
  };

  const extrasTotal = (input.extraCosts || []).reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const laborCostCalculated = ((Number(input.laborMinutes) || 0) / 60) * (Number(input.laborRatePerHour) || 0);

  return (
    <Card
      title={t('calc.laborSectionTitle')}
      subtitle={t('calc.laborSectionSubtitle')}
    >
      <div className="space-y-5">
        {/* Seção Mão de Obra */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <UserCheck className="w-4 h-4 text-[#065F46] dark:text-emerald-400" />
            <span>{t('calc.operatorLabor')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('calc.laborTime')}
              labelClassName="min-h-[2rem] sm:min-h-0"
              type="number"
              step="1"
              min="0"
              suffixText="min"
              value={input.laborMinutes ?? ''}
              onChange={(e) =>
                setInput({ laborMinutes: parseIntegerInput(e.target.value) })
              }
              placeholder="Ex: 15"
              helperText={t('calc.laborTimeHelper')}
              error={
                typeof input.laborMinutes === 'number' && input.laborMinutes < 0
                  ? t('calc.priceNonNegative')
                  : undefined
              }
            />
            <Input
              label={`${t('calc.laborRate')} (${t('common.currencyPerHour')})`}
              labelClassName="min-h-[2rem] sm:min-h-0"
              type="number"
              step="any"
              min="0"
              prefixText={t('common.currencyPrefix')}
              suffixText="/h"
              value={input.laborRatePerHour ?? ''}
              onChange={(e) =>
                setInput({ laborRatePerHour: parseNumericInput(e.target.value) })
              }
              placeholder="30.00"
              error={
                typeof input.laborRatePerHour === 'number' && input.laborRatePerHour < 0
                  ? t('calc.priceNonNegative')
                  : undefined
              }
            />
          </div>

          <div className="mt-2 text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('calc.laborCost')}: </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {formatCurrency(laborCostCalculated, language)}
            </span>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Seção Insumos Extras */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <PackagePlus className="w-4 h-4 text-[#065F46] dark:text-emerald-400" />
              <span>{t('calc.extraCostsTitle')}</span>
            </div>
            {extrasTotal > 0 && (
              <span className="text-xs font-bold text-[#065F46] dark:text-emerald-400">
                Total: {formatCurrency(extrasTotal, language)}
              </span>
            )}
          </div>

          {/* Lista de extras já adicionados */}
          {input.extraCosts && input.extraCosts.length > 0 ? (
            <div className="space-y-2 mb-3">
              {input.extraCosts.map((extra) => (
                <div
                  key={extra.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs group"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{extra.description}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(extra.cost, language)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExtraCost(extra.id)}
                      className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-3">
              {t('calc.noExtrasAdded')}
            </p>
          )}

          {/* Formulário rápido para adicionar item extra */}
          <form noValidate onSubmit={handleAddExtra} className="grid grid-cols-12 gap-2">
            <div className="col-span-6 sm:col-span-7">
              <Input
                type="text"
                placeholder={t('calc.descriptionPlaceholder')}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="col-span-4 sm:col-span-3">
              <Input
                type="number"
                step="any"
                min="0"
                prefixText={t('common.currencyPrefix')}
                placeholder="2.50"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                fullWidth
                disabled={!newDesc.trim() || !newCost}
                icon={<Plus className="w-4 h-4" />}
                aria-label={t('calc.addExtra')}
              />
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
};
