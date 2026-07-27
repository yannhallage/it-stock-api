export type AssignmentSheetPrintPayload = Array<{
  id: number;
  assetId: number;
  employeeId: string;
  departmentId: number;
  startDate: Date;
  endDate: Date | null;
  note: string | null;
  createdAt: Date;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
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
      employees: number;
      active: number;
      globalStatus: string;
    };
  }>;
};
