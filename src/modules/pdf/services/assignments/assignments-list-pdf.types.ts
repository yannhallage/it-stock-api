export type AssignmentsListPrintPayload = Array<{
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

export type AssignmentsListPrintView = {
  organizationName: string;
  title: string;
  printedAt: string;
  generatedAt: Date;
  totalAssignments: number;
  assignments: Array<{
    index: number;
    inventoryNumber: string;
    assetType: string;
    brandModel: string;
    assetStatus: string;
    department: string;
    employee: string;
    startDate: string;
    startDateRaw: Date;
    endDate: string;
    endDateRaw: Date | null;
    status: string;
  }>;
};
