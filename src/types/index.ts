export interface Filament {
  id: string;
  name: string;
  material: string; // Ex: PLA, PETG, ABS, TPU, Resina, ASA, etc.
  spoolWeightGrams: number; // Ex: 1000g
  spoolPrice: number; // Ex: 110.00
  defaultLossMarginPercent: number; // Ex: 5%
  colorHex?: string;
  createdAt: string;
}

export interface Printer {
  id: string;
  name: string;
  powerWatts: number; // Consumo médio, ex: 150W
  energyRateKwh: number; // Tarifa de energia, ex: 0.85
  maintenanceRatePerHour: number; // Custo de desgaste por hora, ex: 1.50
  createdAt: string;
}

export interface Settings {
  id: number; // Chave singleton = 1
  defaultLaborRatePerHour: number; // Valor padrão hora trabalho (ex: 30.00)
  defaultEnergyRateKwh: number; // Tarifa padrão de energia (ex: 0.85)
  resellerMultiplier: number; // Multiplicador padrão revenda (padrão: 3.0)
  retailMultiplier: number; // Multiplicador padrão consumidor final (padrão: 5.0)
  updatedAt: string;
}

export interface ExtraCost {
  id: string;
  description: string;
  cost: number;
}

export interface CalculationInput {
  // Filamento
  filamentId: string;
  filamentWeightGrams: number;
  lossMarginPercent: number;
  // Fallbacks manuais caso não selecione filamento cadastrado
  manualSpoolPrice?: number;
  manualSpoolWeightGrams?: number;

  // Impressora & Tempo
  printerId: string;
  printHours: number;
  printMinutes: number;
  // Fallbacks manuais caso não selecione impressora cadastrada
  manualPowerWatts?: number;
  manualEnergyRateKwh?: number;
  manualMaintenanceRatePerHour?: number;

  // Mão de Obra
  laborMinutes: number;
  laborRatePerHour: number;

  // Insumos extras
  extraCosts: ExtraCost[];

  // Margens / Multiplicadores
  resellerMultiplier: number;
  retailMultiplier: number;
}

export interface CalculationResult {
  // Filamento
  filamentCostPerGram: number;
  filamentWeightWithLoss: number;
  filamentCost: number;

  // Energia
  decimalHours: number;
  kwhConsumption: number;
  energyCost: number;

  // Mão de Obra & Manutenção
  laborCost: number;
  maintenanceCost: number;

  // Extras
  extraCostsTotal: number;

  // Totais e Preços Sugeridos
  totalCost: number;
  resellerPrice: number;
  retailPrice: number;

  // Lucro bruto estimado
  resellerProfit: number;
  retailProfit: number;
}

export interface SavedCalculation {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
  filamentName?: string;
  printerName?: string;
  input: CalculationInput;
  result: CalculationResult;
}

export interface DatabaseBackup {
  version: number;
  appName: string;
  exportedAt: string;
  filaments: Filament[];
  printers: Printer[];
  settings?: Settings;
  savedCalculations: SavedCalculation[];
}
