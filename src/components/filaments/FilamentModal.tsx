import React, { useState, useEffect } from 'react';
import type { Filament } from '../../types';
import { db } from '../../db/db';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { parseNumericInput, parseIntegerInput } from '../../utils/inputs';

interface FilamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  filamentToEdit?: Filament | null;
}

const COMMON_MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resina', 'ASA', 'Nylon', 'PC'];

export const FilamentModal: React.FC<FilamentModalProps> = ({
  isOpen,
  onClose,
  filamentToEdit,
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [material, setMaterial] = useState('PLA');
  const [spoolWeightGrams, setSpoolWeightGrams] = useState<number | ''>(1000);
  const [spoolPrice, setSpoolPrice] = useState<number | ''>(110.0);
  const [defaultLossMarginPercent, setDefaultLossMarginPercent] = useState<number | ''>(5);
  const [colorHex, setColorHex] = useState('#0F172A');

  useEffect(() => {
    setNameError('');
    if (filamentToEdit) {
      setName(filamentToEdit.name);
      setMaterial(filamentToEdit.material);
      setSpoolWeightGrams(filamentToEdit.spoolWeightGrams);
      setSpoolPrice(filamentToEdit.spoolPrice);
      setDefaultLossMarginPercent(filamentToEdit.defaultLossMarginPercent);
      setColorHex(filamentToEdit.colorHex || '#0F172A');
    } else {
      setName('');
      setMaterial('PLA');
      setSpoolWeightGrams(1000);
      setSpoolPrice(110.0);
      setDefaultLossMarginPercent(5);
      setColorHex('#0F172A');
    }
  }, [filamentToEdit, isOpen]);

  const costPerGram =
    (Number(spoolWeightGrams) || 0) > 0 ? (Number(spoolPrice) || 0) / Number(spoolWeightGrams) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Nome / Marca do filamento é obrigatório');
      return;
    }
    setNameError('');

    const filamentData: Filament = {
      id: filamentToEdit ? filamentToEdit.id : `fil-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      material: material.trim() || 'PLA',
      spoolWeightGrams: Math.max(1, Number(spoolWeightGrams) || 1000),
      spoolPrice: Math.max(0, Number(spoolPrice) || 0),
      defaultLossMarginPercent: Math.max(0, Number(defaultLossMarginPercent) || 0),
      colorHex,
      createdAt: filamentToEdit ? filamentToEdit.createdAt : new Date().toISOString(),
    };

    await db.filaments.put(filamentData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={filamentToEdit ? 'Editar Filamento' : 'Novo Filamento'}
      subtitle="Cadastre o carretel para cálculos precisos e reutilizáveis"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome / Marca do Filamento *"
          placeholder="Ex: PLA Preto - Voolt3D"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError || undefined}
          required
          autoFocus
        />

        {/* Tipo de Material com chips rápidos */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            Tipo de Material *
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_MATERIALS.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMaterial(m)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  material.toUpperCase() === m
                    ? 'bg-[#065F46] dark:bg-emerald-600 text-white border-[#065F46] dark:border-emerald-600 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Input
            placeholder="Outro material (ex: PETG-CF, Madeira...)"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            required
          />
        </div>

        {/* Peso do Carretel e Preço Pago */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Preço do Carretel (R$) *"
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="any"
            min="0"
            prefixText="R$"
            value={spoolPrice ?? ''}
            onChange={(e) => setSpoolPrice(parseNumericInput(e.target.value))}
            placeholder="110.00"
            required
            error={
              typeof spoolPrice === 'number' && spoolPrice < 0
                ? 'Preço não pode ser negativo'
                : undefined
            }
          />
          <Input
            label="Peso Total Líquido *"
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="1"
            min="1"
            suffixText="g"
            value={spoolWeightGrams ?? ''}
            onChange={(e) => setSpoolWeightGrams(parseIntegerInput(e.target.value))}
            placeholder="1000"
            required
            error={
              typeof spoolWeightGrams === 'number' && spoolWeightGrams <= 0
                ? 'Peso deve ser maior que 0g'
                : undefined
            }
          />
        </div>

        {/* Margem de Perda e Cor */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Margem de Perda Padrão"
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="any"
            min="0"
            max="100"
            suffixText="%"
            value={defaultLossMarginPercent ?? ''}
            onChange={(e) =>
              setDefaultLossMarginPercent(parseNumericInput(e.target.value))
            }
            helperText="Padrão recomendado: 5%"
            error={
              typeof defaultLossMarginPercent === 'number' &&
              (defaultLossMarginPercent < 0 || defaultLossMarginPercent > 100)
                ? 'Margem deve estar entre 0% e 100%'
                : undefined
            }
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5 leading-4 min-h-[2rem] sm:min-h-0">
              Cor de Referência
            </label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 uppercase font-mono">
                {colorHex}
              </span>
            </div>
          </div>
        </div>

        {/* Custo Calculado por Grama */}
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium">Custo por grama estimado:</span>
          <span className="font-bold text-[#065F46] dark:text-emerald-400 text-sm">
            {formatCurrency(costPerGram)}/g
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="leading-tight py-1.5 sm:py-2">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="leading-tight py-1.5 sm:py-2">
            {filamentToEdit ? 'Salvar Alterações' : 'Cadastrar Filamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
