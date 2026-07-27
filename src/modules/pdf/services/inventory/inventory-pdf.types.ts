import { AssetStatus } from '@prisma/client';
import { InventoryColumnKey } from '../../../stocks/dto/filter-assets.dto';

export type InventoryAssetPayload = Array<{
  id: number;
  inventoryNumber: string;
  serialNumber: string | null;
  model: string;
  status: AssetStatus;
  entryDate: Date;
  warrantyStartDate: Date | null;
  warrantyEndDate: Date | null;
  materialType: { id: number; name: string };
  brand: { id: number; name: string };
  supplier: { id: number; name: string } | null;
  location: { id: number; name: string } | null;
  currentAssignment: {
    employee: { firstName: string; lastName: string };
    department: { id: number; name: string };
  } | null;
}>;

export type InventoryPrintView = {
  organizationName: string;
  title: string;
  printedAt: string;
  generatedAt: Date;
  totalAssets: number;
  filters: string[];
  columns: InventoryColumnKey[];
  assets: Array<{
    index: number;
    inventoryNumber: string;
    type: string;
    brandModel: string;
    firstName: string;
    lastName: string;
    direction: string;
    status: AssetStatus;
    entryDate: string;
    entryDateRaw: Date | null;
    warranty: string;
    supplier: string;
    serialNumber: string;
    location: string;
  }>;
  summary: {
    total: number;
    assigned: number;
    inStock: number;
    broken: number;
    inRepair: number;
    outOfService: number;
  };
};
