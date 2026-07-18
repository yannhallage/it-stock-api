import { AssetStatus } from '@prisma/client';

type AssetRelationNames = {
  category: { id: number; name: string };
  materialType: { id: number; name: string };
  brand: { id: number; name: string };
  supplier: { id: number; name: string } | null;
  location: { id: number; name: string } | null;
};

export type StockAssetPrintPayload = Array<
  {
    id: number;
    inventoryNumber: string;
    serialNumber: string | null;
    model: string;
    status: AssetStatus;
    entryDate: Date;
    purchasePrice: unknown;
    warrantyStartDate: Date | null;
    warrantyEndDate: Date | null;
    createdAt: Date;
  } & AssetRelationNames
>;

export type StockAssetPrintView = {
  organizationName: string;
  title: string;
  printedAt: string;
  totalAssets: number;
  filters: string[];
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
    warrantyStartDateRaw: Date | null;
    warrantyEndDateRaw: Date | null;
  }>;
};
