import React, { useState, useEffect } from 'react';
import type { Printer } from '../../types';
import { db } from '../../db/db';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

interface PrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  printerToEdit?: Printer | null;
}

const PRESET_PRINTERS = [
  { name: 'Bambu Lab A1 / P1S', watts: 150, maintenance: 1.5 },
  { name: 'Creality Ender 3 / V3', watts: 120, maintenance: 1.2 },
  { name: 'Creality K1 / K1 Max', watts: 220, maintenance: 2.0 },
  { name: 'Impressora Resina (MSLA)', watts: 60, maintenance: 2.5 },
];

export const PrinterModal: React.FC<PrinterModalProps> = ({
  isOpen,
  onClose,
  printerToEdit,
}) => {
  const [name, setName] = useState('');
  const [powerWatts, setPowerWatts] = useState(150);
  const [energyRateKwh, setEnergyRateKwh] = useState(0.85);
  const [maintenanceRatePerHour, setMaintenanceRatePerHour] = useState(1.5);

  useEffect(() => {
    if (printerToEdit) {
      setName(printerToEdit.name);
      setPowerWatts(printerToEdit.powerWatts);
      setEnergyRateKwh(printerToEdit.energyRateKwh);
      setMaintenanceRatePerHour(printerToEdit.maintenanceRatePerHour);
    } else {
      setName('');
      setPowerWatts(150);
      setEnergyRateKwh(0.85);
      setMaintenanceRatePerHour(1.5);
    }
  }, [printerToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const printerData: Printer = {
      id: printerToEdit ? printerToEdit.id : `prt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      powerWatts: Math.max(1, powerWatts),
      energyRateKwh: Math.max(0, energyRateKwh),
      maintenanceRatePerHour: Math.max(0, maintenanceRatePerHour),
      createdAt: printerToEdit ? printerToEdit.createdAt : new Date().toISOString(),
    };

    await db.printers.put(printerData);
    onClose();
  };

  const handleApplyPreset = (preset: (typeof PRESET_PRINTERS)[0]) => {
    setName(preset.name);
    setPowerWatts(preset.watts);
    setMaintenanceRatePerHour(preset.maintenance);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={printerToEdit ? 'Editar Impressora' : 'Nova Impressora'}
      subtitle="Defina o consumo elétrico e taxa de desgaste por hora"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sugestões rápidas para novos cadastros */}
        {!printerToEdit && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Modelos comuns (preenchimento rápido):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRINTERS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-[#065F46] border border-slate-200 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Nome / Modelo da Máquina *"
          placeholder="Ex: Bambu Lab A1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Consumo Médio (Watts) *"
            type="number"
            step="5"
            min="1"
            suffixText="W"
            value={powerWatts || ''}
            onChange={(e) => setPowerWatts(parseFloat(e.target.value) || 0)}
            placeholder="150"
            helperText="Potência média em funcionamento"
            required
          />
          <Input
            label="Tarifa de Energia (R$/kWh) *"
            type="number"
            step="0.01"
            min="0"
            prefixText="R$"
            suffixText="/kWh"
            value={energyRateKwh || ''}
            onChange={(e) => setEnergyRateKwh(parseFloat(e.target.value) || 0)}
            placeholder="0.85"
            helperText="Valor do kWh da concessionária"
            required
          />
        </div>

        <div>
          <Input
            label="Custo de Desgaste / Manutenção (R$/h) *"
            type="number"
            step="0.10"
            min="0"
            prefixText="R$"
            suffixText="/h"
            value={maintenanceRatePerHour || ''}
            onChange={(e) => setMaintenanceRatePerHour(parseFloat(e.target.value) || 0)}
            placeholder="1.50"
            helperText="Reserva por hora para bicos, correias, ventoinhas e depreciação"
            required
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1 text-slate-600">
          <div className="flex justify-between">
            <span>Custo de energia por hora:</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(((powerWatts / 1000) * energyRateKwh))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Custo total de máquina por hora:</span>
            <span className="font-bold text-[#065F46]">
              {formatCurrency(((powerWatts / 1000) * energyRateKwh) + maintenanceRatePerHour)}/h
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {printerToEdit ? 'Salvar Alterações' : 'Cadastrar Impressora'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
