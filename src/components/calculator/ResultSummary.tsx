import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Share2,
  BookmarkCheck,
  RotateCcw,
  Check,
  Percent,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { db } from '../../db/db';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';
import { computeCalculation } from '../../utils/calculations';
import { formatCurrency, formatGrams, formatPercent } from '../../utils/formatters';
import { parseNumericInput } from '../../utils/inputs';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';

export const ResultSummary: React.FC = () => {
  const {
    input,
    setInput,
    pieceName,
    setPieceName,
    resetCalculator,
  } = useCalculatorStore();

  const { t, language } = useTranslation();

  const filaments = useLiveQuery(() => db.filaments.toArray()) || [];
  const printers = useLiveQuery(() => db.printers.toArray()) || [];

  const selectedFilament = filaments.find((f) => f.id === input.filamentId);
  const selectedPrinter = printers.find((p) => p.id === input.printerId);

  // Computa o resultado em tempo real através da engine puramente matemática
  const result = computeCalculation(input, selectedFilament, selectedPrinter);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savePieceName, setSavePieceName] = useState(pieceName || '');
  const [savePieceNameError, setSavePieceNameError] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Percentuais de cada elemento no custo total para visualização gráfica
  const total = result.totalCost > 0 ? result.totalCost : 1;
  const filamentPercent = (result.filamentCost / total) * 100;
  const energyPercent = (result.energyCost / total) * 100;
  const laborPercent = (result.laborCost / total) * 100;
  const maintenancePercent = (result.maintenanceCost / total) * 100;
  const extrasPercent = (result.extraCostsTotal / total) * 100;

  // Salvar orçamento no Dexie
  const handleSaveCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savePieceName.trim()) {
      setSavePieceNameError(t('calc.saveError'));
      return;
    }
    setSavePieceNameError('');

    await db.savedCalculations.add({
      id: `calc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: savePieceName.trim(),
      notes: saveNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
      filamentName: selectedFilament?.name || (language === 'pt' ? 'Filamento Personalizado' : 'Custom Filament'),
      printerName: selectedPrinter?.name || (language === 'pt' ? 'Impressora Personalizada' : 'Custom Printer'),
      input: { ...input },
      result: { ...result },
    });

    setPieceName(savePieceName.trim());
    setIsSaveModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Copiar orçamento formatado
  const handleCopySummary = async () => {
    const text = `
🎯 *${language === 'pt' ? 'ORÇAMENTO DE IMPRESSÃO 3D - FORGECALC3D' : '3D PRINT QUOTATION - FORGECALC3D'}*
${pieceName ? `📦 ${language === 'pt' ? 'Peça' : 'Part'}: *${pieceName}*` : ''}
───────────────
🧵 ${language === 'pt' ? 'Filamento' : 'Filament'}: ${selectedFilament?.name || (language === 'pt' ? 'Manual' : 'Custom')} (${formatGrams(result.filamentWeightWithLoss, language)})
⏱️ ${language === 'pt' ? 'Tempo de Impressão' : 'Print Time'}: ${input.printHours || 0}h ${input.printMinutes || 0}m
⚡ ${language === 'pt' ? 'Máquina' : 'Printer'}: ${selectedPrinter?.name || (language === 'pt' ? 'Manual' : 'Custom')}

📊 *${t('calc.costBreakdown')}:*
• ${t('calc.filamentCost')}: ${formatCurrency(result.filamentCost, language)}
• ${t('calc.energyCost')}: ${formatCurrency(result.energyCost, language)}
• ${t('calc.operatorLabor')}: ${formatCurrency(result.laborCost, language)}
• ${t('calc.maintenanceCost')}: ${formatCurrency(result.maintenanceCost, language)}
• ${t('calc.extrasTotal')}: ${formatCurrency(result.extraCostsTotal, language)}
───────────────
💰 *${t('calc.totalCost')}: ${formatCurrency(result.totalCost, language)}*

🏷️ *${t('calc.wholesalePrice')} (${input.resellerMultiplier}x): ${formatCurrency(result.resellerPrice, language)}*
⭐ *${t('calc.retailPrice')} (${input.retailMultiplier}x): ${formatCurrency(result.retailPrice, language)}*
`.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-800/20 dark:border-emerald-500/30 shadow-md p-4 sm:p-6 relative overflow-hidden transition-colors duration-200">
        {/* Detalhe visual de topo em verde esmeralda */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#065F46] dark:bg-emerald-500" />

        {/* Cabeçalho do Card de Resultados */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg text-[#065F46] dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#065F46] dark:text-emerald-400">
              {t('calc.summaryTitle')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={resetCalculator}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* H1 em Destaque Conforme Design System: 32px, Peso 800 */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('calc.totalCost')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h1 className="font-heading text-[32px] font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-none">
              {formatCurrency(result.totalCost, language)}
            </h1>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              /{language === 'pt' ? 'peça' : 'part'}
            </span>
          </div>
        </div>

        {/* Cards de Preços Sugeridos: Revendedor e Consumidor Final */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Preço Revendedor */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                {language === 'pt' ? 'Revendedor' : 'Wholesale'}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {input.resellerMultiplier}x
                </span>
              </div>
            </div>
            <div className="font-heading text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(result.resellerPrice, language)}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
              {t('calc.profit')}: {formatCurrency(result.resellerProfit, language)}
            </div>
          </div>

          {/* Preço Consumidor Final */}
          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#065F46] dark:text-emerald-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
                {language === 'pt' ? 'Consumidor Final' : 'Retail'}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-900/60 text-[#065F46] dark:text-emerald-300">
                  {input.retailMultiplier}x
                </span>
              </div>
            </div>
            <div className="font-heading text-xl font-bold text-[#065F46] dark:text-emerald-400">
              {formatCurrency(result.retailPrice, language)}
            </div>
            <div className="text-[11px] text-[#065F46] dark:text-emerald-400 font-medium mt-1">
              {t('calc.profit')}: {formatCurrency(result.retailProfit, language)}
            </div>
          </div>
        </div>

        {/* Ajuste Rápido dos Multiplicadores de Margem */}
        <div className="mb-6 p-3 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
            <Percent className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{language === 'pt' ? 'Ajustar Multiplicadores Deste Cálculo:' : 'Adjust Multipliers For This Quote:'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={language === 'pt' ? 'Margem Revenda' : 'Wholesale Mult.'}
              labelClassName="min-h-[2rem] sm:min-h-0"
              type="number"
              step="any"
              min="1"
              suffixText="x"
              value={input.resellerMultiplier ?? ''}
              onChange={(e) =>
                setInput({ resellerMultiplier: parseNumericInput(e.target.value) })
              }
              error={
                typeof input.resellerMultiplier === 'number' && input.resellerMultiplier < 1
                  ? t('settings.multiplierMin')
                  : undefined
              }
            />
            <Input
              label={language === 'pt' ? 'Margem Consumidor' : 'Retail Mult.'}
              labelClassName="min-h-[2rem] sm:min-h-0"
              type="number"
              step="any"
              min="1"
              suffixText="x"
              value={input.retailMultiplier ?? ''}
              onChange={(e) =>
                setInput({ retailMultiplier: parseNumericInput(e.target.value) })
              }
              error={
                typeof input.retailMultiplier === 'number' && input.retailMultiplier < 1
                  ? t('settings.multiplierMin')
                  : undefined
              }
            />
          </div>
        </div>

        {/* Composição / Breakdown Visual dos Custos */}
        <div className="mb-6">
          <h2 className="font-heading text-[14px] font-bold text-slate-800 dark:text-slate-100 mb-3">
            {t('calc.costBreakdown')}
          </h2>

          {/* Barra visual de distribuição */}
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5 mb-3">
            <div
              style={{ width: `${filamentPercent}%` }}
              className="bg-emerald-600 h-full"
              title={`${t('calc.filamentCost')}: ${formatPercent(filamentPercent, language)}`}
            />
            <div
              style={{ width: `${energyPercent}%` }}
              className="bg-amber-500 h-full"
              title={`${t('calc.energyCost')}: ${formatPercent(energyPercent, language)}`}
            />
            <div
              style={{ width: `${laborPercent}%` }}
              className="bg-blue-600 h-full"
              title={`${t('calc.operatorLabor')}: ${formatPercent(laborPercent, language)}`}
            />
            <div
              style={{ width: `${maintenancePercent}%` }}
              className="bg-purple-500 h-full"
              title={`${t('calc.maintenanceCost')}: ${formatPercent(maintenancePercent, language)}`}
            />
            <div
              style={{ width: `${extrasPercent}%` }}
              className="bg-teal-500 h-full"
              title={`${t('calc.extrasTotal')}: ${formatPercent(extrasPercent, language)}`}
            />
          </div>

          {/* Tabela de itens com valores e percentuais */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                {t('calc.filamentCost')} ({formatGrams(result.filamentWeightWithLoss, language)}):
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(result.filamentCost, language)}{' '}
                <span className="text-slate-400 dark:text-slate-500 font-normal">({formatPercent(filamentPercent, language)})</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                {t('calc.energyCost')} ({result.kwhConsumption.toFixed(3)} kWh):
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(result.energyCost, language)}{' '}
                <span className="text-slate-400 dark:text-slate-500 font-normal">({formatPercent(energyPercent, language)})</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                {t('calc.operatorLabor')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(result.laborCost, language)}{' '}
                <span className="text-slate-400 dark:text-slate-500 font-normal">({formatPercent(laborPercent, language)})</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                {t('calc.maintenanceCost')}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(result.maintenanceCost, language)}{' '}
                <span className="text-slate-400 dark:text-slate-500 font-normal">({formatPercent(maintenancePercent, language)})</span>
              </span>
            </div>

            {result.extraCostsTotal > 0 && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                  {t('calc.extrasTotal')}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(result.extraCostsTotal, language)}{' '}
                  <span className="text-slate-400 dark:text-slate-500 font-normal">({formatPercent(extrasPercent, language)})</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback visual de ações */}
        {saveSuccess && (
          <div className="mb-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#065F46] dark:text-emerald-300 animate-in fade-in">
            <Check className="w-4 h-4" />
            {t('calc.saveSuccess')}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleCopySummary}
            className="leading-tight py-1.5 sm:py-2"
            icon={copiedNotification ? <Check className="w-4 h-4 shrink-0" /> : <Share2 className="w-4 h-4 shrink-0" />}
          >
            {copiedNotification ? (language === 'pt' ? 'Copiado!' : 'Copied!') : (language === 'pt' ? 'Compartilhar' : 'Share')}
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setSavePieceName(pieceName || '');
              setIsSaveModalOpen(true);
            }}
            className="leading-tight py-1.5 sm:py-2"
            icon={<BookmarkCheck className="w-4 h-4 shrink-0" />}
          >
            {t('calc.saveCalculation')}
          </Button>
        </div>
      </div>

      {/* Modal para Salvar Orçamento */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title={t('calc.saveModalTitle')}
        subtitle={language === 'pt' ? 'Armazene o orçamento para consultas futuras no histórico offline' : 'Store quotation for future offline reference'}
      >
        <form noValidate onSubmit={handleSaveCalculation} className="space-y-4">
          <Input
            label={`${t('calc.pieceName')} *`}
            placeholder={t('calc.pieceNamePlaceholder')}
            value={savePieceName}
            onChange={(e) => {
              setSavePieceName(e.target.value);
              if (savePieceNameError) setSavePieceNameError('');
            }}
            error={savePieceNameError || undefined}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              {t('calc.notes')}
            </label>
            <textarea
              className="w-full px-3 py-2 text-[14px] font-normal text-slate-900 dark:text-white bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-[#065F46] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#065F46] dark:focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              rows={3}
              placeholder={t('calc.notesPlaceholder')}
              value={saveNotes}
              onChange={(e) => setSaveNotes(e.target.value)}
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('calc.totalCost')}:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(result.totalCost, language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('calc.retailPrice')}:</span>
              <span className="font-bold text-[#065F46] dark:text-emerald-400">{formatCurrency(result.retailPrice, language)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSaveModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!savePieceName.trim()}
              icon={<BookmarkCheck className="w-4 h-4" />}
            >
              {t('common.confirm')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
