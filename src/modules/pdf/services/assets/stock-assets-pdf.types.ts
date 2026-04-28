import { AssetStatus } from '@prisma/client';

export type StockAssetPrintPayload = Array<{
  id: number;
  inventoryNumber: string;
  serial_number: string | null;
  type: string;
  brand: string;
  model: string;
  supplier: string;
  status: AssetStatus;
  entryDate: Date;
  warrantyStartDate: Date | null;
  warrantyEndDate: Date | null;
  createdAt: Date;
}>;

export type StockAssetPrintView = {
  organizationName: string;
  title: string;
  printedAt: string;
  totalAssets: number;
  generatedAt: Date;
  assets: Array<{
    index: number;
    inventoryNumber: string;
    serialNumber: string;
    type: string;
    brandModel: string;
    supplier: string;
    status: string;
    entryDate: string;
    warrantyStartDate: string;
    warrantyEndDate: string;
    entryDateRaw: Date | null;
    warrantyEndDateRaw: Date | null;
  }>;
};
