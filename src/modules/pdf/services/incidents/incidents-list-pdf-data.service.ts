import { AssetStatus, IncidentStatus } from '@prisma/client';
import { IncidentsListPrintPayload, IncidentsListPrintView } from './incidents-list-pdf.types';

const formatDateTime = (value: Date | null | undefined): string => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

const incidentStatusLabel = (status: IncidentStatus): string => {
  if (status === 'OUVERT') return 'Ouvert';
  if (status === 'CLOS') return 'Clos';
  return status;
};

const assetStatusLabel = (status: AssetStatus): string =>
  String(status).replace(/_/g, ' ');

const MAX_DESCRIPTION_LEN = 120;

const truncateDescription = (text: string): string => {
  const t = text.trim();
  if (t.length <= MAX_DESCRIPTION_LEN) return t;
  return `${t.slice(0, MAX_DESCRIPTION_LEN)}…`;
};

/** Libellés affichables à partir du JSON `Assignment.user` (même logique que les fiches d’affectation). */
const formatBeneficiaires = (input: unknown): string => {
  if (!input || typeof input !== 'object') {
    return 'N/A';
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

  return fullNames.join(', ');
};

export class IncidentsListPdfDataService {
  buildIncidentsListSheet(payload: IncidentsListPrintPayload): IncidentsListPrintView {
    const generatedAt = new Date();

    return {
      organizationName: 'IT Stock',
      title: 'LISTE DES PANNES (INCIDENTS)',
      printedAt: formatDateTime(generatedAt),
      generatedAt,
      totalIncidents: payload.length,
      incidents: payload.map((row, index) => {
        const active = row.asset.assignments[0];
        const utilisateur = active ? formatBeneficiaires(active.user) : 'N/A';

        return {
          index: index + 1,
          inventoryNumber: row.asset.inventoryNumber,
          assetType: row.asset.type,
          brandModel: `${row.asset.brand} / ${row.asset.model}`,
          department: row.department,
          reportedAt: formatDateTime(row.reportedAt),
          reportedAtRaw: row.reportedAt,
          incidentStatus: incidentStatusLabel(row.status),
          assetStatus: assetStatusLabel(row.asset.status),
          utilisateur,
          description: truncateDescription(row.description),
        };
      }),
    };
  }
}
