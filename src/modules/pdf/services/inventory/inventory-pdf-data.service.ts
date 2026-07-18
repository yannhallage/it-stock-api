import {
  INVENTORY_COLUMN_KEYS,
  InventoryColumnKey,
} from '../../../stocks/dto/filter-assets.dto';
import { InventoryAssetPayload, InventoryPrintView } from './inventory-pdf.types';

const DEFAULT_COLUMNS: InventoryColumnKey[] = [
  'inventoryNumber',
  'type',
  'brandModel',
  'lastName',
  'firstName',
  'direction',
  'status',
  'entryDate',
];

const formatDate = (value: Date | null | undefined): string => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value);
};

const formatDateTime = (value: Date): string =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);

export class InventoryPdfDataService {
  buildInventorySheet(
    payload: InventoryAssetPayload,
    options: {
      filters?: string[];
      columns?: InventoryColumnKey[];
      title?: string;
    } = {},
  ): InventoryPrintView {
    const generatedAt = new Date();
    const columns =
      options.columns && options.columns.length > 0
        ? options.columns.filter((c) => (INVENTORY_COLUMN_KEYS as readonly string[]).includes(c))
        : DEFAULT_COLUMNS;

    const assets = payload.map((asset, index) => ({
      index: index + 1,
      inventoryNumber: asset.inventoryNumber,
      type: asset.materialType.name,
      brandModel: `${asset.brand.name} / ${asset.model}`,
      firstName: asset.currentAssignment?.user.firstName ?? '—',
      lastName: asset.currentAssignment?.user.lastName ?? '—',
      direction: asset.currentAssignment?.department.name ?? '—',
      status: asset.status,
      entryDate: formatDate(asset.entryDate),
      entryDateRaw: asset.entryDate ?? null,
      warranty: asset.warrantyEndDate
        ? `${formatDate(asset.warrantyStartDate)} → ${formatDate(asset.warrantyEndDate)}`
        : '—',
      supplier: asset.supplier?.name ?? '—',
      serialNumber: asset.serialNumber ?? '—',
      location: asset.location?.name ?? '—',
    }));

    return {
      organizationName: 'IT Stock',
      title: options.title ?? 'Etat du parc informatique',
      printedAt: formatDateTime(generatedAt),
      generatedAt,
      totalAssets: payload.length,
      filters: options.filters?.length ? options.filters : ['Parc complet'],
      columns,
      assets,
      summary: {
        total: assets.length,
        assigned: assets.filter((a) => a.status === 'AFFECTE').length,
        inStock: assets.filter((a) => a.status === 'EN_STOCK_NON_AFFECTE').length,
        broken: assets.filter((a) => a.status === 'EN_PANNE').length,
        inRepair: assets.filter((a) => a.status === 'EN_REPARATION').length,
        outOfService: assets.filter((a) => a.status === 'HORS_SERVICE').length,
      },
    };
  }
}
