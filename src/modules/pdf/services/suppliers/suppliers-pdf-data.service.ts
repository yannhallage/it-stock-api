import { SupplierPrintPayload, SupplierPrintView } from './suppliers-pdf.types';

const formatDateTime = (value: Date | null | undefined): string => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

export class SuppliersPdfDataService {
  buildSuppliersSheet(payload: SupplierPrintPayload): SupplierPrintView {
    const generatedAt = new Date();

    return {
      organizationName: 'IT Stock',
      title: 'Liste des fournisseurs',
      printedAt: formatDateTime(generatedAt),
      generatedAt,
      totalSuppliers: payload.length,
      suppliers: payload.map((supplier, index) => ({
        index: index + 1,
        name: supplier.name,
        contact: supplier.contact ?? 'N/A',
        address: supplier.address ?? 'N/A',
        createdAt: formatDateTime(supplier.createdAt),
        createdAtRaw: supplier.createdAt ?? null,
        isArchived: supplier.deletedAt ? 'Oui' : 'Non',
      })),
    };
  }
}
