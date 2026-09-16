import React from 'react';
import { FilamentSelector } from './FilamentSelector';
import { PrinterSelector } from './PrinterSelector';
import { LaborAndExtras } from './LaborAndExtras';
import { ResultSummary } from './ResultSummary';

export const CalculatorView: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Coluna Esquerda: Entradas de Dados */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <FilamentSelector />
          <PrinterSelector />
          <LaborAndExtras />
        </div>

        {/* Coluna Direita: Resumo Financeiro Fixo/Acompanhando */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20">
            <ResultSummary />
          </div>
        </div>
      </div>
    </div>
  );
};
