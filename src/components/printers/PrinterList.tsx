import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Printer as PrinterIcon,
  Zap,
  Wrench,
  Edit2,
  Trash2,
  Calculator,
} from 'lucide-react';
import { db } from '../../db/db';
import type { Printer } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';
import { PrinterModal } from './PrinterModal';
import { formatCurrency } from '../../utils/formatters';

export const PrinterList: React.FC = () => {
  const printers = useLiveQuery(() => db.printers.toArray()) || [];
  const { setInput, setActiveTab } = useCalculatorStore();
  const { t, language } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printerToEdit, setPrinterToEdit] = useState<Printer | null>(null);

  const handleEdit = (printer: Printer) => {
    setPrinterToEdit(printer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(t('printers.deleteConfirmDesc', { name }))) {
      await db.printers.delete(id);
    }
  };

  const handleUseInCalculator = (printer: Printer) => {
    setInput({
      printerId: printer.id,
    });
    setActiveTab('calculator');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <PrinterIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#065F46] dark:text-emerald-400 shrink-0" />
            <span>{t('printers.title')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto sm:mx-0">
            {t('printers.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4 shrink-0" />}
          className="w-full sm:w-auto justify-center shrink-0"
          onClick={() => {
            setPrinterToEdit(null);
            setIsModalOpen(true);
          }}
        >
          {t('printers.newPrinter')}
        </Button>
      </div>

      {/* Grid de Cards */}
      {printers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {printers.map((p) => {
            const energyCostPerHour = (p.powerWatts / 1000) * p.energyRateKwh;
            const totalMachineHourCost = energyCostPerHour + p.maintenanceRatePerHour;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <PrinterIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={t('common.edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h2 className="font-heading text-[16px] font-bold text-slate-900 dark:text-white leading-snug mb-3">
                    {p.name}
                  </h2>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        {language === 'pt' ? 'Potência' : 'Power'}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {p.powerWatts} W
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">{t('printers.energyRate')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(p.energyRateKwh, language)}/kWh
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {language === 'pt' ? 'Desgaste / Hora' : 'Wear / Hour'}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(p.maintenanceRatePerHour, language)}/h
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <span className="font-semibold text-[#065F46] dark:text-emerald-400">
                        {language === 'pt' ? 'Custo Máquina / Hora:' : 'Machine Cost / Hour:'}
                      </span>
                      <span className="font-extrabold text-[#065F46] dark:text-emerald-400 text-sm">
                        {formatCurrency(totalMachineHourCost, language)}/h
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<Calculator className="w-3.5 h-3.5" />}
                  onClick={() => handleUseInCalculator(p)}
                >
                  {t('calc.useInCalculator')}
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#065F46] dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <PrinterIcon className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-1">
            {t('printers.empty')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {t('printers.emptyDesc')}
          </p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setPrinterToEdit(null);
              setIsModalOpen(true);
            }}
          >
            {language === 'pt' ? 'Cadastrar Primeira Impressora' : 'Register First Printer'}
          </Button>
        </div>
      )}

      {/* Modal de Impressora */}
      <PrinterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        printerToEdit={printerToEdit}
      />
    </div>
  );
};
