import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Layers, Plus, AlertCircle } from 'lucide-react';
import { db } from '../../db/db';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatCurrency } from '../../utils/formatters';

export const FilamentSelector: React.FC = () => {
  const { input, setInput, setActiveTab } = useCalculatorStore();
  const filaments = useLiveQuery(() => db.filaments.toArray()) || [];

  const selectedFilament = filaments.find((f) => f.id === input.filamentId);

  // Calcula custo por grama em tempo real
  const spoolPrice = selectedFilament ? selectedFilament.spoolPrice : (input.manualSpoolPrice ?? 110);
  const spoolWeight = selectedFilament ? selectedFilament.spoolWeightGrams : (input.manualSpoolWeightGrams ?? 1000);
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
      title="1. Filamento & Material"
      subtitle="Defina o carretel e a quantidade fatiada"
      action={
        <button
          onClick={() => setActiveTab('filaments')}
          className="text-xs font-semibold text-[#065F46] hover:text-[#047857] inline-flex items-center gap-1 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          Gerenciar
        </button>
      }
    >
      <div className="space-y-4">
        {filaments.length > 0 ? (
          <div>
            <Select
              label="Filamento Cadastrado"
              value={input.filamentId || 'manual'}
              onChange={handleFilamentChange}
              options={[
                { value: 'manual', label: 'Personalizado / Entrada Manual' },
                ...filaments.map((f) => ({
                  value: f.id,
                  label: `${f.name} (${f.material})`,
                  sublabel: `${formatCurrency(f.spoolPrice)} / ${f.spoolWeightGrams}g`,
                })),
              ]}
            />
          </div>
        ) : (
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Nenhum filamento cadastrado.</span>
              <p className="mt-0.5 text-amber-700">
                Você pode usar os campos manuais abaixo ou{' '}
                <button
                  onClick={() => setActiveTab('filaments')}
                  className="font-bold underline hover:text-amber-950"
                >
                  cadastrar seus filamentos
                </button>{' '}
                para reutilizá-los.
              </p>
            </div>
          </div>
        )}

        {/* Campos manuais se não selecionou nenhum do banco */}
        {!selectedFilament && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <Input
              label="Preço do Carretel"
              type="number"
              step="0.01"
              min="0"
              prefixText="R$"
              value={input.manualSpoolPrice ?? ''}
              onChange={(e) =>
                setInput({ manualSpoolPrice: parseFloat(e.target.value) || 0 })
              }
              placeholder="110.00"
            />
            <Input
              label="Peso do Carretel"
              type="number"
              step="1"
              min="1"
              suffixText="g"
              value={input.manualSpoolWeightGrams ?? ''}
              onChange={(e) =>
                setInput({ manualSpoolWeightGrams: parseFloat(e.target.value) || 0 })
              }
              placeholder="1000"
            />
          </div>
        )}

        {/* Custo por grama estimado */}
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs">
          <span className="text-slate-600 flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-[#065F46]" />
            Custo por grama calculado:
          </span>
          <span className="font-bold text-[#065F46]">
            {formatCurrency(costPerGram)}/g
          </span>
        </div>

        {/* Peso da peça e Margem de perda */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Peso da Peça (Slicer)"
            type="number"
            step="0.1"
            min="0"
            suffixText="g"
            value={input.filamentWeightGrams || ''}
            onChange={(e) =>
              setInput({ filamentWeightGrams: parseFloat(e.target.value) || 0 })
            }
            placeholder="Ex: 85"
            helperText="Peso indicado no fatiador"
          />
          <Input
            label="Margem de Perda"
            type="number"
            step="1"
            min="0"
            max="100"
            suffixText="%"
            value={input.lossMarginPercent ?? 5}
            onChange={(e) =>
              setInput({ lossMarginPercent: parseFloat(e.target.value) || 0 })
            }
            placeholder="5"
            helperText="Purgas, brim, falhas (padrão 5%)"
          />
        </div>
      </div>
    </Card>
  );
};
