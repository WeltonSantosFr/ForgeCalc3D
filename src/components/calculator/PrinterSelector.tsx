import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, AlertCircle, Zap, Clock } from 'lucide-react';
import { db } from '../../db/db';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { parseNumericInput, parseIntegerInput } from '../../utils/inputs';

export const PrinterSelector: React.FC = () => {
  const { input, setInput, setActiveTab } = useCalculatorStore();
  const printers = useLiveQuery(() => db.printers.toArray()) || [];

  const selectedPrinter = printers.find((p) => p.id === input.printerId);

  const powerWatts = selectedPrinter ? selectedPrinter.powerWatts : (Number(input.manualPowerWatts) || 0);

  const decimalHours = (Number(input.printHours) || 0) + (Number(input.printMinutes) || 0) / 60;
  const estimatedKwh = (powerWatts / 1000) * decimalHours;

  const handlePrinterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === 'manual') {
      setInput({ printerId: '' });
      return;
    }

    const printer = printers.find((p) => p.id === id);
    if (printer) {
      setInput({
        printerId: printer.id,
      });
    }
  };

  return (
    <Card
      title="2. Impressora & Tempo de Impressão"
      subtitle="Consumo de energia elétrica e depreciação da máquina"
      action={
        <button
          onClick={() => setActiveTab('printers')}
          className="text-xs font-semibold text-[#065F46] hover:text-[#047857] inline-flex items-center gap-1 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          Gerenciar
        </button>
      }
    >
      <div className="space-y-4">
        {printers.length > 0 ? (
          <div>
            <Select
              label="Impressora Cadastrada"
              value={input.printerId || 'manual'}
              onChange={handlePrinterChange}
              options={[
                { value: 'manual', label: 'Personalizado / Entrada Manual' },
                ...printers.map((p) => ({
                  value: p.id,
                  label: p.name,
                  sublabel: `${p.powerWatts}W • Manut: ${formatCurrency(p.maintenanceRatePerHour)}/h`,
                })),
              ]}
            />
          </div>
        ) : (
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Nenhuma impressora cadastrada.</span>
              <p className="mt-0.5 text-amber-700">
                Usando parâmetros manuais ou{' '}
                <button
                  onClick={() => setActiveTab('printers')}
                  className="font-bold underline hover:text-amber-950"
                >
                  cadastre suas impressoras
                </button>{' '}
                para reutilizar potência e tarifas.
              </p>
            </div>
          </div>
        )}

        {/* Campos manuais se não selecionou do banco */}
        {!selectedPrinter && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <Input
              label="Consumo Médio"
              type="number"
              step="1"
              min="0"
              suffixText="W"
              value={input.manualPowerWatts ?? ''}
              onChange={(e) =>
                setInput({ manualPowerWatts: parseNumericInput(e.target.value) })
              }
              placeholder="150"
              helperText="Potência típica (ex: 150W)"
              error={
                typeof input.manualPowerWatts === 'number' && input.manualPowerWatts < 0
                  ? 'Potência não pode ser negativa'
                  : undefined
              }
            />
            <Input
              label="Tarifa de Energia"
              type="number"
              step="any"
              min="0"
              prefixText="R$"
              suffixText="/kWh"
              value={input.manualEnergyRateKwh ?? ''}
              onChange={(e) =>
                setInput({ manualEnergyRateKwh: parseNumericInput(e.target.value) })
              }
              placeholder="0.85"
              helperText="Preço do kWh da sua conta"
              error={
                typeof input.manualEnergyRateKwh === 'number' && input.manualEnergyRateKwh < 0
                  ? 'Tarifa não pode ser negativa'
                  : undefined
              }
            />
            <Input
              label="Desgaste/Manutenção"
              type="number"
              step="any"
              min="0"
              prefixText="R$"
              suffixText="/h"
              value={input.manualMaintenanceRatePerHour ?? ''}
              onChange={(e) =>
                setInput({ manualMaintenanceRatePerHour: parseNumericInput(e.target.value) })
              }
              placeholder="1.50"
              helperText="Depreciação e peças por hora"
              error={
                typeof input.manualMaintenanceRatePerHour === 'number' && input.manualMaintenanceRatePerHour < 0
                  ? 'Taxa não pode ser negativa'
                  : undefined
              }
            />
          </div>
        )}

        {/* Tempo de impressão: Horas e Minutos */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Horas de Impressão"
            type="number"
            step="1"
            min="0"
            suffixText="h"
            value={input.printHours ?? ''}
            onChange={(e) =>
              setInput({ printHours: parseIntegerInput(e.target.value) })
            }
            placeholder="0"
            error={
              typeof input.printHours === 'number' && input.printHours < 0
                ? 'Horas não podem ser negativas'
                : undefined
            }
          />
          <Input
            label="Minutos de Impressão"
            type="number"
            step="1"
            min="0"
            max="59"
            suffixText="min"
            value={input.printMinutes ?? ''}
            onChange={(e) =>
              setInput({ printMinutes: parseIntegerInput(e.target.value) })
            }
            placeholder="0"
            error={
              typeof input.printMinutes === 'number' &&
              (input.printMinutes < 0 || input.printMinutes > 59)
                ? 'Minutos devem estar entre 0 e 59'
                : undefined
            }
          />
        </div>

        {/* Resumo do Tempo e Consumo */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Tempo total:
            </span>
            <span className="font-semibold text-slate-800">
              {formatNumber(decimalHours, 2)} h
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Consumo est.:
            </span>
            <span className="font-semibold text-slate-800">
              {formatNumber(estimatedKwh, 3)} kWh
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
