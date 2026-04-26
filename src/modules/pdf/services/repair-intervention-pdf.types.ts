import { HistoryEventType, AssetStatus, RepairStatus } from '@prisma/client';

export type RepairInterventionPrintPayload = {
  repair: {
    id: number;
    workshopEntryDate: Date;
    technicianName: string | null;
    action: string | null;
    cost: unknown;
    status: RepairStatus;
    outcome: AssetStatus | null;
    incident: {
      id: number;
      reportedAt: Date;
      department: string;
      description: string;
      asset: {
        inventoryNumber: string;
        serial_number: string | null;
        type: string;
        brand: string;
        model: string;
        status: AssetStatus;
      };
    };
  };
  history: Array<{
    type: HistoryEventType;
    createdAt: Date;
  }>;
};

export type RepairInterventionPrintView = {
  organizationName: string;
  title: string;
  sheetNumber: string;
  printedAt: string;
  asset: {
    inventoryNumber: string;
    serialNumber: string;
    type: string;
    brandModel: string;
    currentStatus: string;
  };
  incident: {
    reference: string;
    reportedAt: string;
    department: string;
    description: string;
  };
  workshop: {
    reference: string;
    workshopEntryDate: string;
    technicianName: string;
    action: string;
    cost: string;
    repairStatus: string;
    finalOutcome: string;
  };
  controlValidation: {
    postRepairTest: string;
    backInService: string;
    observations: string;
    technicianSignature: string;
    managerSignature: string;
  };
  traceability: {
    repairStartedAt: string;
    repairFinishedAt: string;
  };
};
