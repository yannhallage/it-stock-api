export type AssignmentSheetPrintPayload = Array<{
  id: number;
  assetId: number;
  department: string;
  user: unknown;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  asset: {
    id: number;
    inventoryNumber: string;
    serial_number: string | null;
    type: string;
    brand: string;
    model: string;
    status: string;
  };
}>;

export type AssignmentSheetPrintView = {
  printedAt: string;
  generatedAt: Date;
  sheets: Array<{
    sheetNumber: string;
    asset: {
      inventoryNumber: string;
      type: string;
      brand: string;
      model: string;
      serialNumber: string;
      statusLabel: string;
      statusCode: string;
    };
    beneficiaries: Array<{
      index: number;
      fullName: string;
      role: string;
      service: string;
      assignedAt: string;
      assignedAtRaw: Date;
      status: string;
    }>;
    totals: {
      users: number;
      active: number;
      globalStatus: string;
    };
  }>;
};
