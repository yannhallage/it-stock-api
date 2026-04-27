import { HistoryEventType } from '@prisma/client';
import {
  RepairInterventionPrintPayload,
  RepairInterventionPrintView,
} from './repair-intervention-pdf.types';

const formatDateTime = (value: Date | null | undefined): string => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

const formatMoney = (value: unknown): string => {
  if (value == null) return '0 XAF';

  const asNumber = Number(value);
  if (Number.isNaN(asNumber)) return '0 XAF';

  return `${asNumber.toLocaleString('fr-FR')} XAF`;
};

export class RepairInterventionPdfDataService {
  buildRepairInterventionSheet(payload: RepairInterventionPrintPayload): RepairInterventionPrintView {
    const { repair, history } = payload;

    const repairStartedAt = history.find((event) => event.type === HistoryEventType.REPAIR_STARTED);
    const repairFinishedAt = history.find((event) => event.type === HistoryEventType.REPAIR_FINISHED);

    return {
      organizationName: 'IT Stock',
      title: 'Fiche de reparation materiel',
      sheetNumber: `REP-${repair.id}`,
      printedAt: formatDateTime(new Date()),
      asset: {
        inventoryNumber: repair.incident.asset.inventoryNumber,
        serialNumber: repair.incident.asset.serial_number ?? 'N/A',
        type: repair.incident.asset.type,
        brandModel: `${repair.incident.asset.brand} / ${repair.incident.asset.model}`,
        currentStatus: repair.incident.asset.status,
      },
      incident: {
        reference: `INC-${repair.incident.id}`,
        reportedAt: formatDateTime(repair.incident.reportedAt),
        department: repair.incident.department,
        description: repair.incident.description,
      },
      workshop: {
        reference: `REP-${repair.id}`,
        workshopEntryDate: formatDateTime(repair.workshopEntryDate),
        technicianName: repair.technicianName ?? 'Non renseigne',
        action: repair.action ?? 'Non renseignee',
        cost: formatMoney(repair.cost),
        repairStatus: repair.status,
        finalOutcome: repair.outcome ?? 'En attente',
      },
      controlValidation: {
        postRepairTest: 'Oui / Non',
        backInService: 'Oui / Non',
        observations: '.............................................',
        technicianSignature: 'Signature technicien + date',
        managerSignature: 'Signature responsable + date',
      },
      traceability: {
        repairStartedAt: formatDateTime(repairStartedAt?.createdAt),
        repairFinishedAt: formatDateTime(repairFinishedAt?.createdAt),
      },
    };
  }
}
