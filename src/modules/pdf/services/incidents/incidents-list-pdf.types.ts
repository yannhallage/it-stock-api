import { AssetStatus, IncidentStatus } from '@prisma/client';

export type IncidentsListPrintPayload = Array<{
  id: number;
  assetId: number;
  status: IncidentStatus;
  department: string;
  reportedAt: Date;
  description: string;
  asset: {
    id: number;
    inventoryNumber: string;
    type: string;
    brand: string;
    model: string;
    status: AssetStatus;
    assignments: Array<{ user: unknown }>;
  };
}>;

export type IncidentsListPrintView = {
  organizationName: string;
  title: string;
  printedAt: string;
  totalIncidents: number;
  generatedAt: Date;
  incidents: Array<{
    index: number;
    inventoryNumber: string;
    assetType: string;
    brandModel: string;
    department: string;
    reportedAt: string;
    reportedAtRaw: Date;
    incidentStatus: string;
    assetStatus: string;
    utilisateur: string;
    description: string;
  }>;
};
