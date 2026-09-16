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
} from 'lucide-react';
import { db, DEFAULT_SETTINGS } from '../../db/db';
import { exportDatabaseToJson, importDatabaseFromJson, type ImportSummary } from '../../db/backup';
import type { Settings } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const SettingsView: React.FC = () => {
  const currentSettings = useLiveQuery(() => db.settings.get(1));
  const { applySettingsDefaults } = useCalculatorStore();

  const [formData, setFormData] = useState<Settings>(DEFAULT_SETTINGS);
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
      defaultLaborRatePerHour: Math.max(0, formData.defaultLaborRatePerHour || 0),
      defaultEnergyRateKwh: Math.max(0, formData.defaultEnergyRateKwh || 0),
      resellerMultiplier: Math.max(1, formData.resellerMultiplier || 3.0),
      retailMultiplier: Math.max(1, formData.retailMultiplier || 5.0),
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#065F46]" />
          Configurações Globais & Backup
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Parâmetros financeiros padrão da sua operação e gerenciamento de backups locais
        </p>
      </div>

      {/* Formulário de Configurações Financeiras */}
      <Card
        title="Parâmetros Financeiros Padrão"
        subtitle="Valores utilizados como sugestão ao iniciar novos cálculos"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tarifa Padrão de Energia Elétrica (R$/kWh)"
              type="number"
              step="0.01"
              min="0"
              prefixText="R$"
              suffixText="/kWh"
              value={formData.defaultEnergyRateKwh || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultEnergyRateKwh: parseFloat(e.target.value) || 0,
                })
              }
              helperText="Padrão inicial: R$ 0,85/kWh"
              required
            />

            <Input
              label="Valor Padrão da Hora de Trabalho (R$/h)"
              type="number"
              step="1"
              min="0"
              prefixText="R$"
              suffixText="/h"
              value={formData.defaultLaborRatePerHour || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultLaborRatePerHour: parseFloat(e.target.value) || 0,
                })
              }
              helperText="Padrão inicial: R$ 30,00/h"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Multiplicador Padrão de Revenda (Atacado)"
              type="number"
              step="0.1"
              min="1"
              suffixText="x"
              value={formData.resellerMultiplier || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resellerMultiplier: parseFloat(e.target.value) || 1,
                })
              }
              helperText="Padrão da especificação: 3.0x"
              required
            />

            <Input
              label="Multiplicador Padrão para Consumidor Final (Varejo)"
              type="number"
              step="0.1"
              min="1"
              suffixText="x"
              value={formData.retailMultiplier || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  retailMultiplier: parseFloat(e.target.value) || 1,
                })
              }
              helperText="Padrão da especificação: 5.0x"
              required
            />
          </div>

          {saveSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#065F46] animate-in fade-in">
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
          <p className="text-xs text-slate-600 leading-relaxed">
            Como o <strong>ForgeCalc3D opera 100% offline</strong> sem depender de servidores na nuvem, você pode gerar backups manuais para migrar dados entre celulares, tablets ou navegadores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Exportar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">
                  Exportar Dados
                </h3>
                <p className="text-xs text-slate-500 mb-4">
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
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">
                  Importar Dados
                </h3>
                <p className="text-xs text-slate-500 mb-4">
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
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#065F46] animate-in fade-in">
              <Check className="w-4 h-4" />
              {exportSuccess}
            </div>
          )}

          {importSummary && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#065F46] space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold">
                <Check className="w-4 h-4" />
                Dados importados com sucesso!
              </div>
              <div className="text-[11px] text-emerald-800 pl-6 space-y-0.5">
                <p>• {importSummary.filamentsCount} filamentos processados</p>
                <p>• {importSummary.printersCount} impressoras processadas</p>
                <p>• {importSummary.calculationsCount} orçamentos recuperados</p>
              </div>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {importError}
            </div>
          )}
        </div>
      </Card>

      {/* Informações da Aplicação */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
            <Info className="w-5 h-5 text-[#065F46]" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-900 text-sm">
              ForgeCalc3D — Utilitário de Custos 3D
            </div>
            <p className="text-slate-500 leading-relaxed">
              Desenvolvido com foco em velocidade, autonomia e precisão para estúdios e operadores de impressão 3D FDM e Resina (MSLA).
            </p>
            <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-[#065F46]" />
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
