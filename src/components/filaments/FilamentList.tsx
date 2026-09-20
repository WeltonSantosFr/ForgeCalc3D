import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Search,
  Layers,
  Edit2,
  Trash2,
  Calculator,
} from 'lucide-react';
import { db } from '../../db/db';
import type { Filament } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { FilamentModal } from './FilamentModal';
import { formatCurrency, formatGrams, formatPercent } from '../../utils/formatters';

export const FilamentList: React.FC = () => {
  const filaments = useLiveQuery(() => db.filaments.toArray()) || [];
  const { setInput, setActiveTab } = useCalculatorStore();
  const { t, language } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filamentToEdit, setFilamentToEdit] = useState<Filament | null>(null);

  // Lista única de materiais presentes nos cadastros
  const uniqueMaterials = Array.from(
    new Set(filaments.map((f) => f.material.toUpperCase()))
  );

  // Filtros aplicados
  const filteredFilaments = filaments.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaterial =
      selectedMaterial === 'all' ||
      f.material.toUpperCase() === selectedMaterial.toUpperCase();
    return matchesSearch && matchesMaterial;
  });

  const handleEdit = (filament: Filament) => {
    setFilamentToEdit(filament);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(t('filaments.deleteConfirmDesc', { name }))) {
      await db.filaments.delete(id);
    }
  };

  const handleUseInCalculator = (filament: Filament) => {
    setInput({
      filamentId: filament.id,
      lossMarginPercent: filament.defaultLossMarginPercent ?? 5,
    });
    setActiveTab('calculator');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#065F46] dark:text-emerald-400 shrink-0" />
            <span>{t('filaments.title')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto sm:mx-0">
            {t('filaments.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4 shrink-0" />}
          className="w-full sm:w-auto justify-center shrink-0"
          onClick={() => {
            setFilamentToEdit(null);
            setIsModalOpen(true);
          }}
        >
          {t('filaments.newFilament')}
        </Button>
      </div>

      {/* Barra de Busca e Filtros por Material */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder={language === 'pt' ? 'Buscar por nome ou material...' : 'Search by name or material...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Chips de Materiais */}
        {uniqueMaterials.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedMaterial('all')}
              className={`text-xs px-3 py-2 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedMaterial === 'all'
                  ? 'bg-[#065F46] dark:bg-emerald-600 text-white border-[#065F46] dark:border-emerald-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {t('common.all')} ({filaments.length})
            </button>
            {uniqueMaterials.map((mat) => (
              <button
                key={mat}
                onClick={() => setSelectedMaterial(mat)}
                className={`text-xs px-3 py-2 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMaterial === mat
                    ? 'bg-[#065F46] dark:bg-emerald-600 text-white border-[#065F46] dark:border-emerald-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Cards de Filamentos */}
      {filteredFilaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFilaments.map((f) => {
            const costPerGram = f.spoolWeightGrams > 0 ? f.spoolPrice / f.spoolWeightGrams : 0;

            return (
              <div
                key={f.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 shadow-2xs"
                        style={{ backgroundColor: f.colorHex || '#0F172A' }}
                        title={`${t('filaments.color')}: ${f.colorHex || '#0F172A'}`}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {f.material}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(f)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={t('common.edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Nome do Filamento */}
                  <h2 className="font-heading text-[16px] font-bold text-slate-900 dark:text-white leading-snug mb-3">
                    {f.name}
                  </h2>

                  {/* Detalhes Financeiros */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('calc.spoolPrice')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(f.spoolPrice, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('calc.spoolWeight')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatGrams(f.spoolWeightGrams, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('filaments.defaultLossMargin')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatPercent(f.defaultLossMarginPercent, language)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <span className="font-semibold text-[#065F46] dark:text-emerald-400">{t('calc.costPerGram')}:</span>
                      <span className="font-extrabold text-[#065F46] dark:text-emerald-400 text-sm">
                        {formatCurrency(costPerGram, language)}/g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botão Usar na Calculadora */}
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<Calculator className="w-3.5 h-3.5" />}
                  onClick={() => handleUseInCalculator(f)}
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
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-1">
            {searchTerm || selectedMaterial !== 'all'
              ? (language === 'pt' ? 'Nenhum filamento encontrado' : 'No filaments found')
              : t('filaments.empty')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {searchTerm || selectedMaterial !== 'all'
              ? (language === 'pt' ? 'Tente remover os filtros ou buscar por outro termo.' : 'Try clearing filters or searching for another term.')
              : t('filaments.emptyDesc')}
          </p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setFilamentToEdit(null);
              setIsModalOpen(true);
            }}
          >
            {language === 'pt' ? 'Cadastrar Primeiro Filamento' : 'Register First Filament'}
          </Button>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      <FilamentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filamentToEdit={filamentToEdit}
      />
    </div>
  );
};
