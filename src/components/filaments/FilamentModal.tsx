import React, { useState, useEffect } from 'react';
import type { Filament } from '../../types';
import { db } from '../../db/db';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

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
  const [material, setMaterial] = useState('PLA');
  const [spoolWeightGrams, setSpoolWeightGrams] = useState(1000);
  const [spoolPrice, setSpoolPrice] = useState(110.0);
  const [defaultLossMarginPercent, setDefaultLossMarginPercent] = useState(5);
  const [colorHex, setColorHex] = useState('#0F172A');

  useEffect(() => {
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

  const costPerGram = spoolWeightGrams > 0 ? spoolPrice / spoolWeightGrams : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const filamentData: Filament = {
      id: filamentToEdit ? filamentToEdit.id : `fil-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      material: material.trim() || 'PLA',
      spoolWeightGrams: Math.max(1, spoolWeightGrams),
      spoolPrice: Math.max(0, spoolPrice),
      defaultLossMarginPercent: Math.max(0, defaultLossMarginPercent),
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome / Marca do Filamento *"
          placeholder="Ex: PLA Preto - Voolt3D"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        {/* Tipo de Material com chips rápidos */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
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
                    ? 'bg-[#065F46] text-white border-[#065F46] font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
            type="number"
            step="0.01"
            min="0"
            prefixText="R$"
            value={spoolPrice || ''}
            onChange={(e) => setSpoolPrice(parseFloat(e.target.value) || 0)}
            placeholder="110.00"
            required
          />
          <Input
            label="Peso Total Líquido *"
            type="number"
            step="1"
            min="1"
            suffixText="g"
            value={spoolWeightGrams || ''}
            onChange={(e) => setSpoolWeightGrams(parseFloat(e.target.value) || 0)}
            placeholder="1000"
            required
          />
        </div>

        {/* Margem de Perda e Cor */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Margem de Perda Padrão"
            type="number"
            step="1"
            min="0"
            max="100"
            suffixText="%"
            value={defaultLossMarginPercent}
            onChange={(e) =>
              setDefaultLossMarginPercent(parseFloat(e.target.value) || 0)
            }
            helperText="Padrão recomendado: 5%"
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Cor de Referência
            </label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-slate-200 bg-white">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
              />
              <span className="text-xs text-slate-600 uppercase font-mono">
                {colorHex}
              </span>
            </div>
          </div>
        </div>

        {/* Custo Calculado por Grama */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Custo por grama estimado:</span>
          <span className="font-bold text-[#065F46] text-sm">
            {formatCurrency(costPerGram)}/g
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {filamentToEdit ? 'Salvar Alterações' : 'Cadastrar Filamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
