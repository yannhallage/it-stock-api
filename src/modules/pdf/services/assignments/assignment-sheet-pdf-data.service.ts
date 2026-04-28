import {
  AssignmentSheetPrintPayload,
  AssignmentSheetPrintView,
} from './assignment-sheet-pdf.types';

const formatDateTime = (value: Date | null | undefined): string => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

const toLabel = (status: string): string => status.replace(/_/g, ' ');

const parseUser = (
  input: unknown
): {
  fullNames: string[];
  role: string;
  service: string;
} => {
  if (!input || typeof input !== 'object') {
    return { fullNames: ['N/A'], role: 'N/A', service: 'N/A' };
  }

  const record = input as Record<string, unknown>;
  const read = (...keys: string[]): string | null => {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
  };
  const readStringArray = (...keys: string[]): string[] => {
    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) {
        const normalized = value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean);
        if (normalized.length > 0) {
          return normalized;
        }
      }
    }
    return [];
  };

  const firstName = read('prenom', 'firstName');
  const lastName = read('nom', 'lastName');
  const names = readStringArray('names', 'fullNames', 'beneficiaries');
  const fallbackName = read('name', 'fullName', 'username');
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const fullNames =
    (combinedName ? [combinedName] : null) ||
    (names.length > 0 ? names : null) ||
    (fallbackName ? [fallbackName] : null) ||
    ['N/A'];

  return {
    fullNames,
    role: read('poste', 'position', 'role', 'jobTitle') || 'N/A',
    service: read('service', 'department') || 'N/A',
  };
};

export class AssignmentSheetPdfDataService {
  buildAssignmentSheet(payload: AssignmentSheetPrintPayload): AssignmentSheetPrintView {
    const generatedAt = new Date();
    const byAsset = new Map<number, AssignmentSheetPrintPayload>();

    for (const row of payload) {
      const items = byAsset.get(row.assetId) ?? [];
      items.push(row);
      byAsset.set(row.assetId, items);
    }

    const sheets = [...byAsset.values()].map((rows) => {
      const first = rows[0];
      const beneficiaries = rows
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .flatMap((assignment) => {
          const user = parseUser(assignment.user);
          const active = assignment.endDate == null;

          return user.fullNames.map((fullName) => ({
            index: 0,
            fullName,
            role: user.role,
            service: user.service === 'N/A' ? assignment.department : user.service,
            assignedAt: formatDateTime(assignment.startDate),
            assignedAtRaw: assignment.startDate,
            status: active ? 'ACTIF' : 'CLOTURE',
          }));
        })
        .map((beneficiary, index) => ({
          ...beneficiary,
          index: index + 1,
        }));

      const activeCount = beneficiaries.filter((row) => row.status === 'ACTIF').length;

      return {
        sheetNumber: `ASG-${first.asset.inventoryNumber}`,
        asset: {
          inventoryNumber: first.asset.inventoryNumber,
          type: first.asset.type,
          brand: first.asset.brand,
          model: first.asset.model,
          serialNumber: first.asset.serial_number ?? 'N/A',
          statusLabel: toLabel(first.asset.status),
          statusCode: first.asset.status,
        },
        beneficiaries,
        totals: {
          users: beneficiaries.length,
          active: activeCount,
          globalStatus: activeCount > 0 ? 'EN SERVICE' : 'INACTIF',
        },
      };
    });

    return {
      printedAt: formatDateTime(generatedAt),
      generatedAt,
      sheets,
    };
  }
}
