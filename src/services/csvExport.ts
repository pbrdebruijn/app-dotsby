import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getSleepLogs } from '../db/queries/sleep';
import { getFeedingLogs } from '../db/queries/feeding';
import { getDiaperLogs } from '../db/queries/diapers';
import { getPumpingLogs } from '../db/queries/pumping';
import { toDisplayValue, getVolumeUnit } from '../utils/units';

function escapeField(value: string | number | boolean | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(fields: (string | number | boolean | null | undefined)[]): string {
  return fields.map(escapeField).join(',');
}

export async function exportBabyDataAsCsv(
  babyId: string,
  babyName: string,
  babyBirthDate: string,
  useMetricUnits: boolean,
): Promise<void> {
  // Query all data from birth to now
  const startDate = new Date(babyBirthDate).toISOString();
  const endDate = new Date().toISOString();

  const [sleepLogs, feedingLogs, diaperLogs, pumpingLogs] = await Promise.all([
    getSleepLogs(babyId, startDate, endDate),
    getFeedingLogs(babyId, startDate, endDate),
    getDiaperLogs(babyId, startDate, endDate),
    getPumpingLogs(babyId, startDate, endDate),
  ]);

  const volUnit = getVolumeUnit(useMetricUnits);
  const lines: string[] = [];

  // Header
  lines.push(row(['Dotsby Data Export']));
  lines.push(row(['Baby', babyName]));
  lines.push(row(['Birth Date', babyBirthDate]));
  lines.push(row(['Exported', new Date().toISOString()]));
  lines.push('');

  // Sleep logs
  lines.push(row(['--- Sleep Logs ---']));
  lines.push(row(['Start Time', 'End Time', 'Type', 'Location', 'Quality', 'Notes']));
  for (const log of sleepLogs) {
    lines.push(
      row([log.startTime, log.endTime, log.sleepType, log.location, log.qualityRating, log.notes]),
    );
  }
  lines.push('');

  // Feeding logs
  lines.push(row(['--- Feeding Logs ---']));
  lines.push(
    row(['Start Time', 'End Time', 'Feed Type', 'Content Type', `Amount (${volUnit})`, 'Food', 'Reaction', 'Notes']),
  );
  for (const log of feedingLogs) {
    const amount = log.amountOz != null ? toDisplayValue(log.amountOz, useMetricUnits).toFixed(1) : '';
    lines.push(
      row([
        log.startTime,
        log.endTime,
        log.feedType,
        log.contentType,
        amount,
        log.foodName,
        log.reactionFlag ? 'Yes' : 'No',
        log.notes,
      ]),
    );
  }
  lines.push('');

  // Diaper logs
  lines.push(row(['--- Diaper Logs ---']));
  lines.push(row(['Time', 'Type', 'Color', 'Consistency', 'Notes']));
  for (const log of diaperLogs) {
    lines.push(row([log.loggedAt, log.diaperType, log.color, log.consistency, log.notes]));
  }
  lines.push('');

  // Pumping logs
  lines.push(row(['--- Pumping Logs ---']));
  lines.push(
    row(['Start Time', 'End Time', `Total (${volUnit})`, `Left (${volUnit})`, `Right (${volUnit})`, 'Notes']),
  );
  for (const log of pumpingLogs) {
    const total = toDisplayValue(log.outputOz, useMetricUnits).toFixed(1);
    const left = log.outputLeftOz != null ? toDisplayValue(log.outputLeftOz, useMetricUnits).toFixed(1) : '';
    const right = log.outputRightOz != null ? toDisplayValue(log.outputRightOz, useMetricUnits).toFixed(1) : '';
    lines.push(row([log.startTime, log.endTime, total, left, right, log.notes]));
  }

  const csv = lines.join('\n');
  const safeName = babyName.replace(/[^a-zA-Z0-9]/g, '_');
  const file = new File(Paths.cache, `dotsby_${safeName}_export.csv`);
  file.text = csv;

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: `${babyName}'s Dotsby Data`,
    UTI: 'public.comma-separated-values-text',
  });
}
