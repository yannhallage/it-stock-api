export type AssignmentSheetPrintPayload = Array<{
  id: number;
  assetId: number;
  userId: string;
  departmentId: number;
  startDate: Date;
  endDate: Date | null;
  note: string | null;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  department: {
    id: number;
    name: string;
  };
  asset: {
    id: number;
    inventoryNumber: string;
    serialNumber: string | null;
    model: string;
    status: string;
    category: { id: number; name: string };
    materialType: { id: number; name: string };
    brand: { id: number; name: string };
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
