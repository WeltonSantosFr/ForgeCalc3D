import React, { useState } from 'react';
import { Plus, Trash2, PackagePlus, UserCheck } from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

export const LaborAndExtras: React.FC = () => {
  const { input, setInput, addExtraCost, removeExtraCost } = useCalculatorStore();

  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState('');

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(newCost);
    if (!newDesc.trim() || isNaN(costNum) || costNum <= 0) return;

    addExtraCost(newDesc.trim(), costNum);
    setNewDesc('');
    setNewCost('');
  };

  const extrasTotal = (input.extraCosts || []).reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const laborCostCalculated = ((input.laborMinutes || 0) / 60) * (input.laborRatePerHour || 0);

  return (
    <Card
      title="3. Mão de Obra & Insumos Extras"
      subtitle="Tempo do operador (setup/acabamento) e materiais adicionais"
    >
      <div className="space-y-5">
        {/* Seção Mão de Obra */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700">
            <UserCheck className="w-4 h-4 text-[#065F46]" />
            <span>Mão de Obra do Operador</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tempo de Trabalho"
              type="number"
              step="1"
              min="0"
              suffixText="min"
              value={input.laborMinutes || ''}
              onChange={(e) =>
                setInput({ laborMinutes: parseInt(e.target.value, 10) || 0 })
              }
              placeholder="Ex: 15"
              helperText="Remover suportes, acabamento, fatiamento"
            />
            <Input
              label="Valor da sua Hora"
              type="number"
              step="1"
              min="0"
              prefixText="R$"
              suffixText="/h"
              value={input.laborRatePerHour || ''}
              onChange={(e) =>
                setInput({ laborRatePerHour: parseFloat(e.target.value) || 0 })
              }
              placeholder="30.00"
              helperText="Configuração padrão nas Settings"
            />
          </div>

          <div className="mt-2 text-right">
            <span className="text-xs text-slate-500">Custo calculado da mão de obra: </span>
            <span className="text-xs font-bold text-slate-900">
              {formatCurrency(laborCostCalculated)}
            </span>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Seção Insumos Extras */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <PackagePlus className="w-4 h-4 text-[#065F46]" />
              <span>Insumos Adicionais & Embalagem</span>
            </div>
            {extrasTotal > 0 && (
              <span className="text-xs font-bold text-[#065F46]">
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
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs group"
                >
                  <span className="font-medium text-slate-800">{extra.description}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      {formatCurrency(extra.cost)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExtraCost(extra.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Remover insumo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic mb-3">
              Nenhum insumo extra adicionado (parafusos, insertos, ímãs, caixas, cola, etc.)
            </p>
          )}

          {/* Formulário rápido para adicionar item extra */}
          <form onSubmit={handleAddExtra} className="grid grid-cols-12 gap-2">
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
                step="0.10"
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
