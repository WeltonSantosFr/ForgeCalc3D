import { describe, it, expect } from 'vitest';
import {
  calculateCostPerGram,
  calculateWeightWithLoss,
  calculateFilamentCost,
  calculateDecimalHours,
  calculateEnergyConsumption,
  calculateEnergyCost,
  calculateLaborCost,
  calculateMaintenanceCost,
  computeCalculation,
} from './calculations';
import type { CalculationInput, Filament, Printer } from '../types';

describe('Cálculos do ForgeCalc3D', () => {
  it('deve calcular corretamente o custo por grama', () => {
    expect(calculateCostPerGram(110, 1000)).toBeCloseTo(0.11, 4);
    expect(calculateCostPerGram(150, 750)).toBeCloseTo(0.2, 4);
    expect(calculateCostPerGram(100, 0)).toBe(0);
  });

  it('deve calcular o peso com margem de perda', () => {
    expect(calculateWeightWithLoss(100, 5)).toBeCloseTo(105, 2);
    expect(calculateWeightWithLoss(200, 10)).toBeCloseTo(220, 2);
    expect(calculateWeightWithLoss(0, 5)).toBe(0);
  });

  it('deve calcular o custo total de filamento com perda', () => {
    const res = calculateFilamentCost(110, 1000, 100, 5);
    expect(res.costPerGram).toBeCloseTo(0.11, 4);
    expect(res.weightWithLoss).toBeCloseTo(105, 2);
    expect(res.totalFilamentCost).toBeCloseTo(11.55, 2);
  });

  it('deve converter horas e minutos em horas decimais', () => {
    expect(calculateDecimalHours(2, 30)).toBeCloseTo(2.5, 4);
    expect(calculateDecimalHours(1, 15)).toBeCloseTo(1.25, 4);
    expect(calculateDecimalHours(0, 45)).toBeCloseTo(0.75, 4);
  });

  it('deve calcular consumo de energia em kWh e custo de energia', () => {
    const kwh = calculateEnergyConsumption(150, 2.5); // 0.15 kW * 2.5h = 0.375 kWh
    expect(kwh).toBeCloseTo(0.375, 4);
    const cost = calculateEnergyCost(kwh, 0.85); // 0.375 * 0.85 = 0.31875
    expect(cost).toBeCloseTo(0.31875, 4);
  });

  it('deve calcular custos de mão de obra e manutenção', () => {
    // 15 min a R$ 30/h = 7.50
    expect(calculateLaborCost(15, 30)).toBeCloseTo(7.50, 2);
    // 2.5h a R$ 1.50/h = 3.75
    expect(calculateMaintenanceCost(2.5, 1.5)).toBeCloseTo(3.75, 2);
  });

  it('deve calcular o custo total integrado e preços sugeridos com multiplicadores', () => {
    const mockFilament: Filament = {
      id: 'f-1',
      name: 'PLA Preto',
      material: 'PLA',
      spoolPrice: 110,
      spoolWeightGrams: 1000,
      defaultLossMarginPercent: 5,
      createdAt: new Date().toISOString(),
    };

    const mockPrinter: Printer = {
      id: 'p-1',
      name: 'Bambu Lab A1',
      powerWatts: 150,
      energyRateKwh: 0.85,
      maintenanceRatePerHour: 1.50,
      createdAt: new Date().toISOString(),
    };

    const input: CalculationInput = {
      filamentId: 'f-1',
      filamentWeightGrams: 100,
      lossMarginPercent: 5,
      printerId: 'p-1',
      printHours: 2,
      printMinutes: 30,
      laborMinutes: 15,
      laborRatePerHour: 30,
      extraCosts: [
        { id: '1', description: 'Parafusos M3', cost: 3.00 },
        { id: '2', description: 'Embalagem', cost: 2.00 },
      ],
      resellerMultiplier: 3.0,
      retailMultiplier: 5.0,
    };

    const result = computeCalculation(input, mockFilament, mockPrinter);

    // Filamento: 105g * 0.11 = 11.55
    expect(result.filamentCost).toBeCloseTo(11.55, 2);
    // Extras: 3.00 + 2.00 = 5.00
    expect(result.extraCostsTotal).toBe(5.00);
    // Energia: 0.375 kWh * 0.85 = 0.31875
    expect(result.energyCost).toBeCloseTo(0.31875, 4);
    // Mão de Obra: 7.50
    expect(result.laborCost).toBeCloseTo(7.50, 2);
    // Manutenção: 3.75
    expect(result.maintenanceCost).toBeCloseTo(3.75, 2);

    // Custo Total: 11.55 + 5.00 + 0.31875 + 7.50 + 3.75 = 28.11875
    expect(result.totalCost).toBeCloseTo(28.11875, 2);

    // Preço Revenda: 28.11875 * 3 = 84.35625
    expect(result.resellerPrice).toBeCloseTo(84.36, 2);

    // Preço Consumidor Final: 28.11875 * 5 = 140.59375
    expect(result.retailPrice).toBeCloseTo(140.59, 2);
  });

  it('deve lidar com campos vazios (\'\') sem gerar NaN ou quebrar os cálculos', () => {
    const emptyInput: CalculationInput = {
      filamentId: '',
      filamentWeightGrams: '',
      lossMarginPercent: '',
      manualSpoolPrice: '',
      manualSpoolWeightGrams: '',
      printerId: '',
      printHours: '',
      printMinutes: '',
      manualPowerWatts: '',
      manualEnergyRateKwh: '',
      manualMaintenanceRatePerHour: '',
      laborMinutes: '',
      laborRatePerHour: '',
      extraCosts: [],
      resellerMultiplier: '',
      retailMultiplier: '',
    };

    const result = computeCalculation(emptyInput);

    expect(result.filamentCost).toBe(0);
    expect(result.energyCost).toBe(0);
    expect(result.laborCost).toBe(0);
    expect(result.maintenanceCost).toBe(0);
    expect(result.totalCost).toBe(0);
    expect(result.resellerPrice).toBe(0);
    expect(result.retailPrice).toBe(0);
    expect(isNaN(result.totalCost)).toBe(false);
  });
});
