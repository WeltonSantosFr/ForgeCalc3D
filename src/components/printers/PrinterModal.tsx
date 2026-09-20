import React, { useState, useEffect } from 'react';
import type { Printer } from '../../types';
import { db } from '../../db/db';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { parseNumericInput } from '../../utils/inputs';

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
  const [nameError, setNameError] = useState('');
  const [powerWatts, setPowerWatts] = useState<number | ''>(150);
  const [energyRateKwh, setEnergyRateKwh] = useState<number | ''>(0.85);
  const [maintenanceRatePerHour, setMaintenanceRatePerHour] = useState<number | ''>(1.5);

  useEffect(() => {
    setNameError('');
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
    if (!name.trim()) {
      setNameError('Nome / Modelo da máquina é obrigatório');
      return;
    }
    setNameError('');

    const printerData: Printer = {
      id: printerToEdit ? printerToEdit.id : `prt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      powerWatts: Math.max(1, Number(powerWatts) || 150),
      energyRateKwh: Math.max(0, Number(energyRateKwh) || 0),
      maintenanceRatePerHour: Math.max(0, Number(maintenanceRatePerHour) || 0),
      createdAt: printerToEdit ? printerToEdit.createdAt : new Date().toISOString(),
    };

    await db.printers.put(printerData);
    onClose();
  };

  const handleApplyPreset = (preset: (typeof PRESET_PRINTERS)[0]) => {
    setName(preset.name);
    setNameError('');
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
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {/* Sugestões rápidas para novos cadastros */}
        {!printerToEdit && (
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Modelos comuns (preenchimento rápido):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRINTERS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-[#065F46] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 border border-slate-200 transition-colors"
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
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError || undefined}
          required
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Consumo Médio (Watts) *"
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="1"
            min="1"
            suffixText="W"
            value={powerWatts ?? ''}
            onChange={(e) => setPowerWatts(parseNumericInput(e.target.value))}
            placeholder="150"
            helperText="Potência média em funcionamento"
            required
            error={
              typeof powerWatts === 'number' && powerWatts <= 0
                ? 'Potência deve ser maior que 0W'
                : undefined
            }
          />
          <Input
            label="Tarifa de Energia (R$/kWh) *"
            labelClassName="min-h-[2rem] sm:min-h-0"
            type="number"
            step="any"
            min="0"
            prefixText="R$"
            suffixText="/kWh"
            value={energyRateKwh ?? ''}
            onChange={(e) => setEnergyRateKwh(parseNumericInput(e.target.value))}
            placeholder="0.85"
            helperText="Valor do kWh da concessionária"
            required
            error={
              typeof energyRateKwh === 'number' && energyRateKwh < 0
                ? 'Tarifa não pode ser negativa'
                : undefined
            }
          />
        </div>

        <div>
          <Input
            label="Custo de Desgaste / Manutenção (R$/h) *"
            type="number"
            step="any"
            min="0"
            prefixText="R$"
            suffixText="/h"
            value={maintenanceRatePerHour ?? ''}
            onChange={(e) => setMaintenanceRatePerHour(parseNumericInput(e.target.value))}
            placeholder="1.50"
            helperText="Reserva por hora para bicos, correias, ventoinhas e depreciação"
            required
            error={
              typeof maintenanceRatePerHour === 'number' && maintenanceRatePerHour < 0
                ? 'Taxa não pode ser negativa'
                : undefined
            }
          />
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Custo de energia por hora:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {formatCurrency((((Number(powerWatts) || 0) / 1000) * (Number(energyRateKwh) || 0)))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Custo total de máquina por hora:</span>
            <span className="font-bold text-[#065F46] dark:text-emerald-400">
              {formatCurrency(
                ((Number(powerWatts) || 0) / 1000) * (Number(energyRateKwh) || 0) +
                  (Number(maintenanceRatePerHour) || 0)
              )}/h
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="leading-tight py-1.5 sm:py-2">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="leading-tight py-1.5 sm:py-2">
            {printerToEdit ? 'Salvar Alterações' : 'Cadastrar Impressora'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
