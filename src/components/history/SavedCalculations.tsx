import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  History,
  Trash2,
  Share2,
  Calculator,
  Search,
  Check,
  Calendar,
} from 'lucide-react';
import { db } from '../../db/db';
import type { SavedCalculation } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency, formatGrams } from '../../utils/formatters';

export const SavedCalculations: React.FC = () => {
  const calculations =
    useLiveQuery(() => db.savedCalculations.orderBy('createdAt').reverse().toArray()) || [];
  const { loadSavedCalculation, setActiveTab } = useCalculatorStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = calculations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o orçamento da peça "${name}"?`)) {
      await db.savedCalculations.delete(id);
    }
  };

  const handleCopy = async (calc: SavedCalculation) => {
    const text = `
🎯 *ORÇAMENTO DE IMPRESSÃO 3D - FORGECALC3D*
📦 Peça: *${calc.name}*
📅 Data: ${new Date(calc.createdAt).toLocaleDateString('pt-BR')}
───────────────
🧵 Filamento: ${calc.filamentName || 'Manual'} (${formatGrams(calc.result.filamentWeightWithLoss)})
⏱️ Tempo de Impressão: ${calc.input.printHours || 0}h ${calc.input.printMinutes || 0}m
⚡ Impressora: ${calc.printerName || 'Manual'}

📊 *Composição de Custos:*
• Filamento: ${formatCurrency(calc.result.filamentCost)}
• Energia Elétrica: ${formatCurrency(calc.result.energyCost)}
• Mão de Obra: ${formatCurrency(calc.result.laborCost)}
• Manutenção: ${formatCurrency(calc.result.maintenanceCost)}
• Insumos Extras: ${formatCurrency(calc.result.extraCostsTotal)}
───────────────
💰 *Custo Total de Produção: ${formatCurrency(calc.result.totalCost)}*

🏷️ *Preço Revendedor (${calc.input.resellerMultiplier}x): ${formatCurrency(calc.result.resellerPrice)}*
⭐ *Preço Consumidor Final (${calc.input.retailMultiplier}x): ${formatCurrency(calc.result.retailPrice)}*
${calc.notes ? `\n📝 Observações: ${calc.notes}` : ''}
`.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(calc.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-[#065F46] dark:text-emerald-400 shrink-0" />
            <span>Orçamentos Salvos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto sm:mx-0">
            Consulte históricos, recarregue parâmetros na calculadora ou envie para clientes
          </p>
        </div>
      </div>

      {/* Busca */}
      {calculations.length > 0 && (
        <div className="max-w-md mx-auto sm:mx-0">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Buscar por nome da peça ou notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Grid de Orçamentos */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((calc) => (
            <div
              key={calc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(calc.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(calc)}
                      className="p-1.5 text-slate-400 hover:text-[#065F46] hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                      title="Copiar texto do orçamento"
                    >
                      {copiedId === calc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(calc.id, calc.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Excluir orçamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="font-heading text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-2">
                  {calc.name}
                </h2>

                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex flex-wrap gap-x-2 gap-y-1">
                  <span>🧵 {calc.filamentName || 'Manual'}</span>
                  <span>•</span>
                  <span>⏱️ {calc.input.printHours || 0}h{calc.input.printMinutes || 0}m</span>
                </div>

                {calc.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg italic mb-3 border border-slate-100 dark:border-slate-800">
                    "{calc.notes}"
                  </p>
                )}

                {/* Preços */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 mb-4 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 dark:text-slate-400">Custo Total:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {formatCurrency(calc.result.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 dark:text-slate-400">Preço Consumidor Final:</span>
                    <span className="font-bold text-[#065F46] dark:text-emerald-400 text-sm">
                      {formatCurrency(calc.result.retailPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Calculator className="w-3.5 h-3.5" />}
                onClick={() => loadSavedCalculation(calc)}
              >
                Recarregar na Calculadora
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#065F46] dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            {searchTerm ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento salvo ainda'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            Ao realizar cálculos na aba Calculadora, clique em "Salvar Orçamento" para arquivar os valores da peça e poder consultá-los a qualquer momento.
          </p>
          <Button
            variant="primary"
            icon={<Calculator className="w-4 h-4" />}
            onClick={() => setActiveTab('calculator')}
          >
            Ir para a Calculadora
          </Button>
        </div>
      )}
    </div>
  );
};
