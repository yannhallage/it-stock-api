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
        .map((assignment, index) => {
          const active = assignment.endDate == null;
          const fullName = `${assignment.user.firstName} ${assignment.user.lastName}`.trim();

          return {
            index: index + 1,
            fullName: fullName || assignment.user.email,
            role: 'N/A',
            service: assignment.department.name,
            assignedAt: formatDateTime(assignment.startDate),
            assignedAtRaw: assignment.startDate,
            status: active ? 'ACTIF' : 'CLOTURE',
          };
        });

      const activeCount = beneficiaries.filter((row) => row.status === 'ACTIF').length;

      return {
        sheetNumber: `ASG-${first.asset.inventoryNumber}`,
        asset: {
          inventoryNumber: first.asset.inventoryNumber,
          type: first.asset.materialType.name,
          brand: first.asset.brand.name,
          model: first.asset.model,
          serialNumber: first.asset.serialNumber ?? 'N/A',
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
