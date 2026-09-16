import { create } from 'zustand';
import type { CalculationInput, SavedCalculation, Settings } from '../types';

export type ActiveTab = 'calculator' | 'filaments' | 'printers' | 'history' | 'settings';

interface CalculatorState {
  // Navegação
  activeTab: ActiveTab;
  isDrawerOpen: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  setDrawerOpen: (open: boolean) => void;

  // Peça
  pieceName: string;
  setPieceName: (name: string) => void;

  // Inputs de Cálculo
  input: CalculationInput;
  setInput: (changes: Partial<CalculationInput>) => void;
  addExtraCost: (description: string, cost: number) => void;
  removeExtraCost: (id: string) => void;
  clearExtraCosts: () => void;
  resetCalculator: () => void;
  loadSavedCalculation: (saved: SavedCalculation) => void;
  applySettingsDefaults: (settings: Settings) => void;
}

const initialInput: CalculationInput = {
  filamentId: '',
  filamentWeightGrams: '',
  lossMarginPercent: 5,
  manualSpoolPrice: 110.0,
  manualSpoolWeightGrams: 1000,

  printerId: '',
  printHours: '',
  printMinutes: '',
  manualPowerWatts: 150,
  manualEnergyRateKwh: 0.85,
  manualMaintenanceRatePerHour: 1.5,

  laborMinutes: '',
  laborRatePerHour: 30.0,

  extraCosts: [],

  resellerMultiplier: 3.0,
  retailMultiplier: 5.0,
};

export const useCalculatorStore = create<CalculatorState>((set) => ({
  activeTab: 'calculator',
  isDrawerOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab, isDrawerOpen: false }),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  pieceName: '',
  setPieceName: (name) => set({ pieceName: name }),

  input: initialInput,

  setInput: (changes) =>
    set((state) => ({
      input: {
        ...state.input,
        ...changes,
      },
    })),

  addExtraCost: (description, cost) =>
    set((state) => ({
      input: {
        ...state.input,
        extraCosts: [
          ...state.input.extraCosts,
          {
            id: `extra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            description: description.trim() || 'Insumo Adicional',
            cost: Math.max(0, cost || 0),
          },
        ],
      },
    })),

  removeExtraCost: (id) =>
    set((state) => ({
      input: {
        ...state.input,
        extraCosts: state.input.extraCosts.filter((item) => item.id !== id),
      },
    })),

  clearExtraCosts: () =>
    set((state) => ({
      input: {
        ...state.input,
        extraCosts: [],
      },
    })),

  resetCalculator: () =>
    set((state) => ({
      pieceName: '',
      input: {
        ...initialInput,
        resellerMultiplier: state.input.resellerMultiplier,
        retailMultiplier: state.input.retailMultiplier,
        laborRatePerHour: state.input.laborRatePerHour,
      },
    })),

  loadSavedCalculation: (saved) =>
    set({
      pieceName: saved.name,
      input: {
        ...saved.input,
      },
      activeTab: 'calculator',
      isDrawerOpen: false,
    }),

  applySettingsDefaults: (settings) =>
    set((state) => ({
      input: {
        ...state.input,
        laborRatePerHour: state.input.laborRatePerHour || settings.defaultLaborRatePerHour,
        resellerMultiplier: state.input.resellerMultiplier || settings.resellerMultiplier,
        retailMultiplier: state.input.retailMultiplier || settings.retailMultiplier,
        manualEnergyRateKwh: state.input.manualEnergyRateKwh || settings.defaultEnergyRateKwh,
      },
    })),
}));
