import type { CalculationInput, CalculationResult, Filament, Printer } from '../types';

/**
 * Calcula o custo por grama de um filamento
 */
export function calculateCostPerGram(spoolPrice: number, spoolWeightGrams: number): number {
  if (!spoolWeightGrams || spoolWeightGrams <= 0) return 0;
  return spoolPrice / spoolWeightGrams;
}

/**
 * Calcula o peso total considerando a margem de perda
 */
export function calculateWeightWithLoss(filamentWeightGrams: number, lossMarginPercent: number): number {
  if (filamentWeightGrams <= 0) return 0;
  const margin = Math.max(0, lossMarginPercent);
  return filamentWeightGrams * (1 + margin / 100);
}

/**
 * Calcula o custo total de filamento
 */
export function calculateFilamentCost(
  spoolPrice: number,
  spoolWeightGrams: number,
  filamentWeightGrams: number,
  lossMarginPercent: number
): { costPerGram: number; weightWithLoss: number; totalFilamentCost: number } {
  const costPerGram = calculateCostPerGram(spoolPrice, spoolWeightGrams);
  const weightWithLoss = calculateWeightWithLoss(filamentWeightGrams, lossMarginPercent);
  const totalFilamentCost = weightWithLoss * costPerGram;

  return {
    costPerGram,
    weightWithLoss,
    totalFilamentCost,
  };
}

/**
 * Converte horas e minutos em horas decimais
 */
export function calculateDecimalHours(hours: number, minutes: number): number {
  const h = Math.max(0, hours || 0);
  const m = Math.max(0, minutes || 0);
  return h + m / 60;
}

/**
 * Calcula o consumo de energia em kWh
 */
export function calculateEnergyConsumption(powerWatts: number, decimalHours: number): number {
  if (powerWatts <= 0 || decimalHours <= 0) return 0;
  return (powerWatts / 1000) * decimalHours;
}

/**
 * Calcula o custo de energia elétrica
 */
export function calculateEnergyCost(kwh: number, rateKwh: number): number {
  if (kwh <= 0 || rateKwh <= 0) return 0;
  return kwh * rateKwh;
}

/**
 * Calcula o custo de mão de obra do operador
 */
export function calculateLaborCost(laborMinutes: number, laborRatePerHour: number): number {
  if (laborMinutes <= 0 || laborRatePerHour <= 0) return 0;
  return (laborMinutes / 60) * laborRatePerHour;
}

/**
 * Calcula o custo de manutenção/depreciação da máquina
 */
export function calculateMaintenanceCost(decimalHours: number, maintenanceRatePerHour: number): number {
  if (decimalHours <= 0 || maintenanceRatePerHour <= 0) return 0;
  return decimalHours * maintenanceRatePerHour;
}

/**
 * Executa todos os cálculos integrados a partir do CalculationInput e das entidades selecionadas
 */
export function computeCalculation(
  input: CalculationInput,
  filament?: Filament,
  printer?: Printer
): CalculationResult {
  // Dados do filamento
  const spoolPrice = filament ? filament.spoolPrice : (input.manualSpoolPrice ?? 0);
  const spoolWeightGrams = filament ? filament.spoolWeightGrams : (input.manualSpoolWeightGrams ?? 1000);
  const lossMargin = input.lossMarginPercent ?? (filament ? filament.defaultLossMarginPercent : 0);

  const { costPerGram, weightWithLoss, totalFilamentCost } = calculateFilamentCost(
    spoolPrice,
    spoolWeightGrams,
    input.filamentWeightGrams ?? 0,
    lossMargin
  );

  // Dados da impressora e tempo
  const powerWatts = printer ? printer.powerWatts : (input.manualPowerWatts ?? 0);
  const energyRateKwh = printer ? printer.energyRateKwh : (input.manualEnergyRateKwh ?? 0.85);
  const maintenanceRate = printer ? printer.maintenanceRatePerHour : (input.manualMaintenanceRatePerHour ?? 0);

  const decimalHours = calculateDecimalHours(input.printHours ?? 0, input.printMinutes ?? 0);
  const kwhConsumption = calculateEnergyConsumption(powerWatts, decimalHours);
  const energyCost = calculateEnergyCost(kwhConsumption, energyRateKwh);

  // Mão de obra e manutenção
  const laborCost = calculateLaborCost(input.laborMinutes ?? 0, input.laborRatePerHour ?? 0);
  const maintenanceCost = calculateMaintenanceCost(decimalHours, maintenanceRate);

  // Custos Extras
  const extraCostsTotal = (input.extraCosts || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);

  // Custo Total de Produção
  const totalCost = totalFilamentCost + extraCostsTotal + energyCost + laborCost + maintenanceCost;

  // Multiplicadores e Preços de Venda Sugeridos
  const resellerMultiplier = Math.max(1, input.resellerMultiplier || 3.0);
  const retailMultiplier = Math.max(1, input.retailMultiplier || 5.0);

  const resellerPrice = totalCost * resellerMultiplier;
  const retailPrice = totalCost * retailMultiplier;

  const resellerProfit = Math.max(0, resellerPrice - totalCost);
  const retailProfit = Math.max(0, retailPrice - totalCost);

  return {
    filamentCostPerGram: costPerGram,
    filamentWeightWithLoss: weightWithLoss,
    filamentCost: totalFilamentCost,
    decimalHours,
    kwhConsumption,
    energyCost,
    laborCost,
    maintenanceCost,
    extraCostsTotal,
    totalCost,
    resellerPrice,
    retailPrice,
    resellerProfit,
    retailProfit,
  };
}
