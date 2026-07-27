import {
  AssignmentsListPrintPayload,
  AssignmentsListPrintView,
} from './assignments-list-pdf.types';

const formatDateTime = (value: Date | null | undefined): string => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

const formatEmployeeName = (employee: {
  firstName: string;
  lastName: string;
  email: string | null;
}): string => {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  return fullName || employee.email || 'N/A';
};

export class AssignmentsListPdfDataService {
  buildAssignmentsListSheet(payload: AssignmentsListPrintPayload): AssignmentsListPrintView {
    const generatedAt = new Date();

    return {
      organizationName: 'IT Stock',
      title: 'LISTE DES AFFECTATIONS',
      printedAt: formatDateTime(generatedAt),
      generatedAt,
      totalAssignments: payload.length,
      assignments: payload.map((row, index) => {
        const active = row.endDate == null;

        return {
          index: index + 1,
          inventoryNumber: row.asset.inventoryNumber,
          assetType: row.asset.materialType.name,
          brandModel: `${row.asset.brand.name} / ${row.asset.model}`,
          assetStatus: String(row.asset.status).replace(/_/g, ' '),
          department: row.department.name,
          employee: formatEmployeeName(row.employee),
          startDate: formatDateTime(row.startDate),
          startDateRaw: row.startDate,
          endDate: formatDateTime(row.endDate),
          endDateRaw: row.endDate,
          status: active ? 'ACTIF' : 'CLOTURE',
        };
      }),
    };
  }
}
