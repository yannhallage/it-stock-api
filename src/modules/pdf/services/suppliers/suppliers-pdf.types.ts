export type SupplierPrintPayload = Array<{
  id: number;
  name: string;
  contact: string | null;
  address: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}>;

export type SupplierPrintView = {
  organizationName: string;
  title: string;
  printedAt: string;
  generatedAt: Date;
  totalSuppliers: number;
  suppliers: Array<{
    index: number;
    name: string;
    contact: string;
    address: string;
    createdAt: string;
    createdAtRaw: Date | null;
    isArchived: string;
  }>;
};
