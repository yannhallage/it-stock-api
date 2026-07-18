import { StockAssetPrintPayload, StockAssetPrintView } from './stock-assets-pdf.types';

const formatDateTime = (value: Date | null | undefined): string => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

export class StockAssetsPdfDataService {
  buildStockAssetsSheet(
    payload: StockAssetPrintPayload,
    options: { filters?: string[] } = {},
  ): StockAssetPrintView {
    const generatedAt = new Date();

    return {
      organizationName: 'IT Stock',
      title: 'Etat du stock materiel',
      printedAt: formatDateTime(generatedAt),
      generatedAt,
      totalAssets: payload.length,
      filters: options.filters?.length ? options.filters : ['Tous les materiels'],
      assets: payload.map((asset, index) => ({
        index: index + 1,
        inventoryNumber: asset.inventoryNumber,
        serialNumber: asset.serialNumber ?? 'N/A',
        type: asset.materialType.name,
        brandModel: `${asset.brand.name} / ${asset.model}`,
        supplier: asset.supplier?.name ?? 'N/A',
        status: asset.status,
        entryDate: formatDateTime(asset.entryDate),
        warrantyStartDate: formatDateTime(asset.warrantyStartDate),
        warrantyEndDate: formatDateTime(asset.warrantyEndDate),
        entryDateRaw: asset.entryDate ?? null,
        warrantyStartDateRaw: asset.warrantyStartDate ?? null,
        warrantyEndDateRaw: asset.warrantyEndDate ?? null,
      })),
    };
  }
}
