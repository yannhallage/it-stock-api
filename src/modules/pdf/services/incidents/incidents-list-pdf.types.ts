import { AssetStatus, IncidentStatus } from '@prisma/client';

export type IncidentsListPrintPayload = Array<{
  id: number;
  assetId: number;
  status: IncidentStatus;
  departmentId: number;
  reportedAt: Date;
  description: string;
  department: {
    id: number;
    name: string;
  };
  asset: {
    id: number;
    inventoryNumber: string;
    serialNumber: string | null;
    model: string;
    status: AssetStatus;
    category: { id: number; name: string };
    materialType: { id: number; name: string };
    brand: { id: number; name: string };
    assignments: Array<{
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
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
