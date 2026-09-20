import Dexie, { type Table } from 'dexie';
import type { Filament, Printer, Settings, SavedCalculation } from '../types';

export class ForgeCalcDatabase extends Dexie {
  filaments!: Table<Filament, string>;
  printers!: Table<Printer, string>;
  settings!: Table<Settings, number>;
  savedCalculations!: Table<SavedCalculation, string>;

  constructor() {
    super('ForgeCalc3D_DB');

    this.version(1).stores({
      filaments: 'id, name, material, createdAt',
      printers: 'id, name, createdAt',
      settings: 'id',
      savedCalculations: 'id, name, createdAt',
    });
  }
}

export const db = new ForgeCalcDatabase();

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  defaultLaborRatePerHour: 30.0,
  defaultEnergyRateKwh: 0.85,
  resellerMultiplier: 3.0,
  retailMultiplier: 5.0,
  theme: 'light',
  language: 'system',
  updatedAt: new Date().toISOString(),
};

/**
 * Garante que as configurações padrão estejam persistidas
 */
export async function ensureDefaultSettings(): Promise<Settings> {
  const current = await db.settings.get(1);
  if (!current) {
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return current;
}
