import { StockAssetPrintPayload, StockAssetPrintView } from './stock-assets-pdf.types';

const formatDateTime = (value: Date | null | undefined): string => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

export class StockAssetsPdfDataService {
  buildStockAssetsSheet(payload: StockAssetPrintPayload): StockAssetPrintView {
    const generatedAt = new Date();

    return {
      organizationName: 'IT Stock',
      title: 'Etat du stock materiel',
      printedAt: formatDateTime(generatedAt),
      generatedAt,
      totalAssets: payload.length,
      assets: payload.map((asset, index) => ({
        index: index + 1,
        inventoryNumber: asset.inventoryNumber,
        serialNumber: asset.serial_number ?? 'N/A',
        type: asset.type,
        brandModel: `${asset.brand} / ${asset.model}`,
        supplier: asset.supplier,
        status: asset.status,
        entryDate: formatDateTime(asset.entryDate),
        warrantyStartDate: formatDateTime(asset.warrantyStartDate),
        warrantyEndDate: formatDateTime(asset.warrantyEndDate),
        entryDateRaw: asset.entryDate ?? null,
        warrantyEndDateRaw: asset.warrantyEndDate ?? null,
      })),
    };
  }
}
