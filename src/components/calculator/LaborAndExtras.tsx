import React, { useState } from 'react';
import { Plus, Trash2, PackagePlus, UserCheck } from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { parseNumericInput, parseIntegerInput } from '../../utils/inputs';

export const LaborAndExtras: React.FC = () => {
  const { input, setInput, addExtraCost, removeExtraCost } = useCalculatorStore();

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
      title="3. Mão de Obra & Insumos Extras"
      subtitle="Tempo do operador (setup/acabamento) e materiais adicionais"
    >
      <div className="space-y-5">
        {/* Seção Mão de Obra */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <UserCheck className="w-4 h-4 text-[#065F46] dark:text-emerald-400" />
            <span>Mão de Obra do Operador</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tempo de Trabalho"
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
              helperText="Remover suportes, acabamento, fatiamento"
              error={
                typeof input.laborMinutes === 'number' && input.laborMinutes < 0
                  ? 'Tempo não pode ser negativo'
                  : undefined
              }
            />
            <Input
              label="Valor da sua Hora"
              labelClassName="min-h-[2rem] sm:min-h-0"
              type="number"
              step="any"
              min="0"
              prefixText="R$"
              suffixText="/h"
              value={input.laborRatePerHour ?? ''}
              onChange={(e) =>
                setInput({ laborRatePerHour: parseNumericInput(e.target.value) })
              }
              placeholder="30.00"
              helperText="Configuração padrão nas Settings"
              error={
                typeof input.laborRatePerHour === 'number' && input.laborRatePerHour < 0
                  ? 'Valor da hora não pode ser negativo'
                  : undefined
              }
            />
          </div>

          <div className="mt-2 text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">Custo calculado da mão de obra: </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {formatCurrency(laborCostCalculated)}
            </span>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Seção Insumos Extras */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <PackagePlus className="w-4 h-4 text-[#065F46] dark:text-emerald-400" />
              <span>Insumos Adicionais & Embalagem</span>
            </div>
            {extrasTotal > 0 && (
              <span className="text-xs font-bold text-[#065F46] dark:text-emerald-400">
                Total: {formatCurrency(extrasTotal)}
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
                      {formatCurrency(extra.cost)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExtraCost(extra.id)}
                      className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                      title="Remover insumo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-3">
              Nenhum insumo extra adicionado (parafusos, insertos, ímãs, caixas, cola, etc.)
            </p>
          )}

          {/* Formulário rápido para adicionar item extra */}
          <form noValidate onSubmit={handleAddExtra} className="grid grid-cols-12 gap-2">
            <div className="col-span-6 sm:col-span-7">
              <Input
                type="text"
                placeholder="Ex: 4 Parafusos M3"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="col-span-4 sm:col-span-3">
              <Input
                type="number"
                step="any"
                min="0"
                prefixText="R$"
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
                aria-label="Adicionar insumo extra"
              />
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
};
