import { db, ensureDefaultSettings } from './db';
import type { DatabaseBackup, Filament, Printer, Settings, SavedCalculation } from '../types';

/**
 * Exporta todo o banco de dados Dexie para um arquivo JSON
 */
export async function exportDatabaseToJson(): Promise<string> {
  const filaments = await db.filaments.toArray();
  const printers = await db.printers.toArray();
  const settings = await db.settings.get(1);
  const savedCalculations = await db.savedCalculations.toArray();

  const backupData: DatabaseBackup = {
    version: 1,
    appName: 'ForgeCalc3D',
    exportedAt: new Date().toISOString(),
    filaments,
    printers,
    settings,
    savedCalculations,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `ForgeCalc3D_backup_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}

export interface ImportSummary {
  filamentsCount: number;
  printersCount: number;
  calculationsCount: number;
  settingsUpdated: boolean;
}

/**
 * Importa dados de um arquivo JSON para o Dexie
 */
export async function importDatabaseFromJson(jsonContent: string, mode: 'merge' | 'replace' = 'merge'): Promise<ImportSummary> {
  let parsed: Partial<DatabaseBackup>;
  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    throw new Error('Arquivo JSON inválido. Verifique o arquivo selecionado.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Formato de arquivo incompatível.');
  }

  const filaments = Array.isArray(parsed.filaments) ? (parsed.filaments as Filament[]) : [];
  const printers = Array.isArray(parsed.printers) ? (parsed.printers as Printer[]) : [];
  const savedCalculations = Array.isArray(parsed.savedCalculations) ? (parsed.savedCalculations as SavedCalculation[]) : [];
  const settings = parsed.settings as Settings | undefined;

  await db.transaction('rw', [db.filaments, db.printers, db.settings, db.savedCalculations], async () => {
    if (mode === 'replace') {
      await db.filaments.clear();
      await db.printers.clear();
      await db.savedCalculations.clear();
    }

    if (filaments.length > 0) {
      await db.filaments.bulkPut(filaments);
    }

    if (printers.length > 0) {
      await db.printers.bulkPut(printers);
    }

    if (savedCalculations.length > 0) {
      await db.savedCalculations.bulkPut(savedCalculations);
    }

    if (settings && typeof settings === 'object') {
      await db.settings.put({
        ...settings,
        id: 1,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await ensureDefaultSettings();
    }
  });

  return {
    filamentsCount: filaments.length,
    printersCount: printers.length,
    calculationsCount: savedCalculations.length,
    settingsUpdated: !!settings,
  };
}
