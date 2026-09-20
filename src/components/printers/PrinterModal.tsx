import React, { useState, useEffect } from 'react';
import type { Printer } from '../../types';
import { db } from '../../db/db';
import { useTranslation } from '../../i18n';
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
  const { t, language } = useTranslation();
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
    }
  }, [printerToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t('printers.nameRequired'));
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
      title={printerToEdit ? t('printers.editPrinter') : t('printers.newPrinter')}
      subtitle={language === 'pt' ? 'Defina o consumo elétrico e taxa de desgaste por hora' : 'Set electrical power consumption and hourly wear rate'}
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {/* Sugestões rápidas para novos cadastros */}
        {!printerToEdit && (
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              {language === 'pt' ? 'Modelos comuns (preenchimento rápido):' : 'Common models (quick fill):'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRINTERS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-[#065F46] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 border border-slate-200 transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label={`${t('printers.name')} *`}
          placeholder={t('printers.namePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError || undefined}
          required
          autoFocus
        />

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {/* Row 1: Labels */}
          <label
            htmlFor="printer-power-watts"
            className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-4 flex items-end"
          >
            {t('printers.powerWatts')} *
          </label>
          <label
            htmlFor="printer-energy-rate"
            className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-4 flex items-end"
          >
            {t('printers.energyRate')} ({t('common.currencyPerKwh')}) *
          </label>

          {/* Row 2: Inputs */}
          <Input
            id="printer-power-watts"
            type="number"
            step="1"
            min="1"
            suffixText="W"
            value={powerWatts ?? ''}
            onChange={(e) => setPowerWatts(parseNumericInput(e.target.value))}
            placeholder="150"
            required
            error={
              typeof powerWatts === 'number' && powerWatts <= 0
                ? 'Watts > 0'
                : undefined
            }
          />
          <Input
            id="printer-energy-rate"
            type="number"
            step="any"
            min="0"
            prefixText={t('common.currencyPrefix')}
            suffixText="/kWh"
            value={energyRateKwh ?? ''}
            onChange={(e) => setEnergyRateKwh(parseNumericInput(e.target.value))}
            placeholder="0.85"
            required
            error={
              typeof energyRateKwh === 'number' && energyRateKwh < 0
                ? t('calc.priceNonNegative')
                : undefined
            }
          />

          {/* Row 3: Helper Texts */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
            {t('printers.powerWattsHelper')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
            {t('printers.energyRateHelper')}
          </p>
        </div>

        <div>
          <Input
            label={`${t('printers.maintenanceRate')} (${t('common.currencyPerHour')}) *`}
            type="number"
            step="any"
            min="0"
            prefixText={t('common.currencyPrefix')}
            suffixText="/h"
            value={maintenanceRatePerHour ?? ''}
            onChange={(e) => setMaintenanceRatePerHour(parseNumericInput(e.target.value))}
            placeholder="1.50"
            helperText={t('printers.maintenanceRateHelper')}
            required
            error={
              typeof maintenanceRatePerHour === 'number' && maintenanceRatePerHour < 0
                ? t('calc.priceNonNegative')
                : undefined
            }
          />
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>{language === 'pt' ? 'Custo de energia por hora:' : 'Hourly electricity cost:'}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {formatCurrency((((Number(powerWatts) || 0) / 1000) * (Number(energyRateKwh) || 0)), language)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'pt' ? 'Custo total de máquina por hora:' : 'Total machine cost per hour:'}</span>
            <span className="font-bold text-[#065F46] dark:text-emerald-400">
              {formatCurrency(
                ((Number(powerWatts) || 0) / 1000) * (Number(energyRateKwh) || 0) +
                  (Number(maintenanceRatePerHour) || 0),
                language
              )}/h
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="leading-tight py-1.5 sm:py-2">
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="leading-tight py-1.5 sm:py-2">
            {printerToEdit ? (language === 'pt' ? 'Salvar Alterações' : 'Save Changes') : (language === 'pt' ? 'Cadastrar Impressora' : 'Register Printer')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
