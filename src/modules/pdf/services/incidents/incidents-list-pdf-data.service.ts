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

const formatBeneficiaire = (employee: {
  firstName: string;
  lastName: string;
  email: string | null;
}): string => {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  return fullName || employee.email || 'N/A';
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
        const utilisateur = active ? formatBeneficiaire(active.employee) : 'N/A';

        return {
          index: index + 1,
          inventoryNumber: row.asset.inventoryNumber,
          assetType: row.asset.materialType.name,
          brandModel: `${row.asset.brand.name} / ${row.asset.model}`,
          department: row.department.name,
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
