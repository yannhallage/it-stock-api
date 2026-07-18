import { HistoryEventType, AssetStatus, RepairStatus } from '@prisma/client';

export type RepairInterventionPrintPayload = {
  repair: {
    id: number;
    assetId: number;
    workshopEntryDate: Date;
    workshopExitDate?: Date | null;
    technicianName: string | null;
    action: string | null;
    cost: unknown;
    status: RepairStatus;
    outcome: AssetStatus | null;
    asset: {
      inventoryNumber: string;
      serialNumber: string | null;
      model: string;
      status: AssetStatus;
      category: { id: number; name: string };
      materialType: { id: number; name: string };
      brand: { id: number; name: string };
    };
    incident: {
      id: number;
      reportedAt: Date;
      description: string;
      department: {
        id: number;
        name: string;
      };
    } | null;
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
    workshopExitDate: string;
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
