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
import { Button } from '../common/Button';
import { PrinterModal } from './PrinterModal';
import { formatCurrency } from '../../utils/formatters';

export const PrinterList: React.FC = () => {
  const printers = useLiveQuery(() => db.printers.toArray()) || [];
  const { setInput, setActiveTab } = useCalculatorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printerToEdit, setPrinterToEdit] = useState<Printer | null>(null);

  const handleEdit = (printer: Printer) => {
    setPrinterToEdit(printer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir a impressora "${name}"?`)) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <PrinterIcon className="w-6 h-6 text-[#065F46]" />
            Gestão de Impressoras 3D
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre suas máquinas e configure potência média e reservas de manutenção
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setPrinterToEdit(null);
            setIsModalOpen(true);
          }}
        >
          Nova Impressora
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
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <PrinterIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h2 className="font-heading text-[16px] font-bold text-slate-900 leading-snug mb-3">
                    {p.name}
                  </h2>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Potência:
                      </span>
                      <span className="font-semibold text-slate-900">
                        {p.powerWatts} W
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Tarifa de Energia:</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(p.energyRateKwh)}/kWh
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        Desgaste / Hora:
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(p.maintenanceRatePerHour)}/h
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="font-semibold text-[#065F46]">
                        Custo Máquina / Hora:
                      </span>
                      <span className="font-extrabold text-[#065F46] text-sm">
                        {formatCurrency(totalMachineHourCost)}/h
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
                  Usar na Calculadora
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#065F46] flex items-center justify-center mx-auto mb-3">
            <PrinterIcon className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-1">
            Nenhuma impressora cadastrada ainda
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Cadastre suas impressoras 3D para salvar potência em Watts e custo de manutenção/hora e carregar automaticamente no cálculo.
          </p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setPrinterToEdit(null);
              setIsModalOpen(true);
            }}
          >
            Cadastrar Primeira Impressora
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
