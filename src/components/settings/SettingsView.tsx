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
  Globe,
} from 'lucide-react';
import { db, DEFAULT_SETTINGS } from '../../db/db';
import { exportDatabaseToJson, importDatabaseFromJson, type ImportSummary } from '../../db/backup';
import type { Settings, ThemeMode, LanguageMode } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from '../../i18n';
import { parseNumericInput } from '../../utils/inputs';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Select } from '../common/Select';

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
  const { t, language, languageMode, setLanguageMode } = useTranslation();

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
      setExportSuccess(t('settings.exportSuccess', { fileName }));
      setTimeout(() => setExportSuccess(null), 4000);
    } catch {
      alert(t('settings.exportError'));
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
      const message = err instanceof Error ? err.message : t('settings.importError');
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
      label: t('settings.themeLight'),
      description: t('settings.themeLightDesc'),
      icon: <Sun className="w-5 h-5" />,
    },
    {
      id: 'dark',
      label: t('settings.themeDark'),
      description: t('settings.themeDarkDesc'),
      icon: <Moon className="w-5 h-5" />,
    },
    {
      id: 'system',
      label: t('settings.themeSystem'),
      description: t('settings.themeSystemDesc'),
      icon: <Laptop className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="text-center sm:text-left">
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#065F46] dark:text-emerald-400 shrink-0" />
          <span>{t('settings.title')}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto sm:mx-0">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Seção de Seleção de Idioma */}
      <Card
        title={t('settings.languageTitle')}
        subtitle={t('settings.languageSubtitle')}
      >
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#065F46] dark:text-emerald-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>
                  {languageMode === 'system'
                    ? `${t('settings.themeSystem')} (${language === 'pt' ? 'Português' : 'English'})`
                    : languageMode === 'pt'
                    ? 'Português'
                    : 'English'}
                </span>
                <span className="text-[11px] font-semibold text-[#065F46] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                  {t('common.active')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('settings.languageHelperText')}
              </p>
            </div>
          </div>

          <Select
            id="settings-language-select"
            label={t('settings.languageSelectLabel')}
            value={languageMode}
            onChange={(e) => setLanguageMode(e.target.value as LanguageMode)}
            options={[
              { value: 'system', label: t('common.langAuto') },
              { value: 'pt', label: 'Português' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>
      </Card>

      {/* Seleção de Tema Visual */}
      <Card
        title={t('settings.themeTitle')}
        subtitle={t('settings.themeSubtitle')}
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
                      {t('common.active')}
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
        title={t('settings.financialTitle')}
        subtitle={t('settings.financialSubtitle')}
      >
        <form noValidate onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`${t('settings.defaultEnergyRate')} (${t('common.currencyPerKwh')})`}
              type="number"
              step="any"
              min="0"
              prefixText={t('common.currencyPrefix')}
              suffixText="/kWh"
              value={formData.defaultEnergyRateKwh ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultEnergyRateKwh: parseNumericInput(e.target.value),
                })
              }
              helperText={t('settings.defaultEnergyRateHelper')}
              required
              error={
                typeof formData.defaultEnergyRateKwh === 'number' && formData.defaultEnergyRateKwh < 0
                  ? t('settings.energyRateNegative')
                  : undefined
              }
            />

            <Input
              label={`${t('settings.defaultLaborRate')} (${t('common.currencyPerHour')})`}
              type="number"
              step="any"
              min="0"
              prefixText={t('common.currencyPrefix')}
              suffixText="/h"
              value={formData.defaultLaborRatePerHour ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultLaborRatePerHour: parseNumericInput(e.target.value),
                })
              }
              helperText={t('settings.defaultLaborRateHelper')}
              required
              error={
                typeof formData.defaultLaborRatePerHour === 'number' && formData.defaultLaborRatePerHour < 0
                  ? t('settings.laborRateNegative')
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('settings.resellerMultiplier')}
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
              helperText={t('settings.resellerMultiplierHelper')}
              required
              error={
                typeof formData.resellerMultiplier === 'number' && formData.resellerMultiplier < 1
                  ? t('settings.multiplierMin')
                  : undefined
              }
            />

            <Input
              label={t('settings.retailMultiplier')}
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
              helperText={t('settings.retailMultiplierHelper')}
              required
              error={
                typeof formData.retailMultiplier === 'number' && formData.retailMultiplier < 1
                  ? t('settings.multiplierMin')
                  : undefined
              }
            />
          </div>

          {saveSuccess && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#065F46] dark:text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4" />
              {t('settings.savedSuccess')}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4" />}
            >
              {t('settings.saveSettings')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Backup e Restauração Local */}
      <Card
        title={t('settings.backupTitle')}
        subtitle={t('settings.backupSubtitle')}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('settings.backupDesc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Exportar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {t('settings.exportTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {t('settings.exportDesc')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleExport}
                icon={<Download className="w-4 h-4" />}
                fullWidth
              >
                {t('settings.exportButton')}
              </Button>
            </div>

            {/* Importar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {t('settings.importTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {t('settings.importDesc')}
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
                {isImporting ? t('settings.importing') : t('settings.importButton')}
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
                {t('settings.importSuccessTitle')}
              </div>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300/80 pl-6 space-y-0.5">
                <p>{t('settings.filamentsProcessed', { count: importSummary.filamentsCount })}</p>
                <p>{t('settings.printersProcessed', { count: importSummary.printersCount })}</p>
                <p>{t('settings.calculationsRecovered', { count: importSummary.calculationsCount })}</p>
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
              {t('settings.aboutTitle')}
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('settings.aboutDesc')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
                {t('settings.localDbBadge')}
              </span>
              <span>•</span>
              <span>{t('settings.versionBadge')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
