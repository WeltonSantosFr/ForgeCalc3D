import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Check,
  AlertCircle,
  HardDrive,
  Info,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { db, DEFAULT_SETTINGS } from '../../db/db';
import { exportDatabaseToJson, importDatabaseFromJson, type ImportSummary } from '../../db/backup';
import type { Settings, ThemeMode } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { parseNumericInput } from '../../utils/inputs';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

type SettingsFormState = {
  id: number;
  defaultLaborRatePerHour: number | '';
  defaultEnergyRateKwh: number | '';
  resellerMultiplier: number | '';
  retailMultiplier: number | '';
  updatedAt: string;
};

export const SettingsView: React.FC = () => {
  const currentSettings = useLiveQuery(() => db.settings.get(1));
  const { applySettingsDefaults } = useCalculatorStore();
  const { themeMode, setTheme } = useThemeStore();

  const [formData, setFormData] = useState<SettingsFormState>(DEFAULT_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentSettings) {
      setFormData(currentSettings);
    }
  }, [currentSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Settings = {
      ...formData,
      id: 1,
      defaultLaborRatePerHour: Math.max(0, Number(formData.defaultLaborRatePerHour) || 0),
      defaultEnergyRateKwh: Math.max(0, Number(formData.defaultEnergyRateKwh) || 0),
      resellerMultiplier: Math.max(1, Number(formData.resellerMultiplier) || 3.0),
      retailMultiplier: Math.max(1, Number(formData.retailMultiplier) || 5.0),
      updatedAt: new Date().toISOString(),
    };

    await db.settings.put(updated);
    applySettingsDefaults(updated);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = async () => {
    try {
      const fileName = await exportDatabaseToJson();
      setExportSuccess(`Backup exportado com sucesso: ${fileName}`);
      setTimeout(() => setExportSuccess(null), 4000);
    } catch {
      alert('Erro ao exportar backup.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSummary(null);

    try {
      const text = await file.text();
      const summary = await importDatabaseFromJson(text, 'merge');
      setImportSummary(summary);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao importar o arquivo.';
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  const themeOptions: {
    id: ThemeMode;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'light',
      label: 'Modo Claro',
      description: 'Visual tradicional, alto contraste e fundo claro',
      icon: <Sun className="w-5 h-5" />,
    },
    {
      id: 'dark',
      label: 'Modo Escuro',
      description: 'Confortável para os olhos e ideal para baixa iluminação',
      icon: <Moon className="w-5 h-5" />,
    },
    {
      id: 'system',
      label: 'Automático',
      description: 'Sincroniza dinamicamente com o tema do seu dispositivo',
      icon: <Laptop className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#065F46] dark:text-emerald-400" />
          Configurações Globais & Backup
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Parâmetros financeiros padrão da sua operação, personalização visual e gerenciamento de backups locais
        </p>
      </div>

      {/* Seleção de Tema Visual */}
      <Card
        title="Aparência & Tema"
        subtitle="Personalize o modo de visualização do aplicativo para o seu ambiente de trabalho"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const isSelected = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#065F46] dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-[#065F46] dark:ring-emerald-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-[#065F46] dark:bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#065F46] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      Ativo
                    </span>
                  )}
                </div>
                <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  {opt.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Formulário de Configurações Financeiras */}
      <Card
        title="Parâmetros Financeiros Padrão"
        subtitle="Valores utilizados como sugestão ao iniciar novos cálculos"
      >
        <form noValidate onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tarifa Padrão de Energia Elétrica (R$/kWh)"
              type="number"
              step="any"
              min="0"
              prefixText="R$"
              suffixText="/kWh"
              value={formData.defaultEnergyRateKwh ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultEnergyRateKwh: parseNumericInput(e.target.value),
                })
              }
              helperText="Padrão inicial: R$ 0,85/kWh"
              required
              error={
                typeof formData.defaultEnergyRateKwh === 'number' && formData.defaultEnergyRateKwh < 0
                  ? 'Tarifa não pode ser negativa'
                  : undefined
              }
            />

            <Input
              label="Valor Padrão da Hora de Trabalho (R$/h)"
              type="number"
              step="any"
              min="0"
              prefixText="R$"
              suffixText="/h"
              value={formData.defaultLaborRatePerHour ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultLaborRatePerHour: parseNumericInput(e.target.value),
                })
              }
              helperText="Padrão inicial: R$ 30,00/h"
              required
              error={
                typeof formData.defaultLaborRatePerHour === 'number' && formData.defaultLaborRatePerHour < 0
                  ? 'Valor da hora não pode ser negativo'
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Multiplicador Padrão de Revenda (Atacado)"
              type="number"
              step="any"
              min="1"
              suffixText="x"
              value={formData.resellerMultiplier ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resellerMultiplier: parseNumericInput(e.target.value),
                })
              }
              helperText="Padrão da especificação: 3.0x"
              required
              error={
                typeof formData.resellerMultiplier === 'number' && formData.resellerMultiplier < 1
                  ? 'Mínimo de 1.0x'
                  : undefined
              }
            />

            <Input
              label="Multiplicador Padrão para Consumidor Final (Varejo)"
              type="number"
              step="any"
              min="1"
              suffixText="x"
              value={formData.retailMultiplier ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  retailMultiplier: parseNumericInput(e.target.value),
                })
              }
              helperText="Padrão da especificação: 5.0x"
              required
              error={
                typeof formData.retailMultiplier === 'number' && formData.retailMultiplier < 1
                  ? 'Mínimo de 1.0x'
                  : undefined
              }
            />
          </div>

          {saveSuccess && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#065F46] dark:text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4" />
              Configurações salvas com sucesso!
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4" />}
            >
              Salvar Configurações
            </Button>
          </div>
        </form>
      </Card>

      {/* Backup e Restauração Local */}
      <Card
        title="Backup & Restauração Local (JSON)"
        subtitle="Exporte ou importe seus cadastros de filamentos, impressoras e histórico"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Como o <strong>ForgeCalc3D opera 100% offline</strong> sem depender de servidores na nuvem, você pode gerar backups manuais para migrar dados entre celulares, tablets ou navegadores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Exportar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Exportar Dados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Gera um arquivo .json seguro contendo todos os cadastros e orçamentos.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleExport}
                icon={<Download className="w-4 h-4" />}
                fullWidth
              >
                Baixar Arquivo JSON
              </Button>
            </div>

            {/* Importar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Importar Dados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Selecione um arquivo de backup (.json) para restaurar no aplicativo.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                icon={<Upload className="w-4 h-4" />}
                fullWidth
              >
                {isImporting ? 'Importando...' : 'Selecionar Arquivo JSON'}
              </Button>
            </div>
          </div>

          {exportSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#065F46] dark:text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4" />
              {exportSuccess}
            </div>
          )}

          {importSummary && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-[#065F46] dark:text-emerald-300 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold">
                <Check className="w-4 h-4" />
                Dados importados com sucesso!
              </div>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300/80 pl-6 space-y-0.5">
                <p>• {importSummary.filamentsCount} filamentos processados</p>
                <p>• {importSummary.printersCount} impressoras processadas</p>
                <p>• {importSummary.calculationsCount} orçamentos recuperados</p>
              </div>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              {importError}
            </div>
          )}
        </div>
      </Card>

      {/* Informações da Aplicação */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
            <Info className="w-5 h-5 text-[#065F46] dark:text-emerald-400" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              ForgeCalc3D — Utilitário de Custos 3D
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Desenvolvido com foco em velocidade, autonomia e precisão para estúdios e operadores de impressão 3D FDM e Resina (MSLA).
            </p>
            <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
                Banco Local: Dexie.js (IndexedDB)
              </span>
              <span>•</span>
              <span>Versão 1.0.0</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
