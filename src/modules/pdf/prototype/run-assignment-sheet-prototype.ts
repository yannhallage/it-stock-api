import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { AssignmentSheetPdfDataService } from '../services/assignments/assignment-sheet-pdf-data.service';
import { AssignmentSheetPdfService } from '../services/assignments/assignment-sheet-pdf.service';
import { AssignmentSheetPrintPayload } from '../services/assignments/assignment-sheet-pdf.types';

const defaultPayload: AssignmentSheetPrintPayload = [
  {
    id: 1,
    assetId: 101,
    employeeId: 'emp-1',
    departmentId: 1,
    note: null,
    startDate: new Date('2026-01-10T08:00:00.000Z'),
    endDate: null,
    createdAt: new Date('2026-01-10T08:05:00.000Z'),
    employee: {
      id: 'emp-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@assnat.ci',
    },
    department: { id: 1, name: 'IT' },
    asset: {
      id: 101,
      inventoryNumber: 'INV-2026-001',
      serialNumber: 'SN-HP-001',
      model: 'EliteBook 840 G9',
      status: 'AFFECTE',
      category: { id: 1, name: 'Informatique' },
      materialType: { id: 1, name: 'Laptop' },
      brand: { id: 1, name: 'HP' },
    },
  },
  {
    id: 2,
    assetId: 101,
    employeeId: 'emp-2',
    departmentId: 1,
    note: null,
    startDate: new Date('2026-01-15T10:30:00.000Z'),
    endDate: null,
    createdAt: new Date('2026-01-15T10:35:00.000Z'),
    employee: {
      id: 'emp-2',
      firstName: 'Marie',
      lastName: 'Kouassi',
      email: 'marie.kouassi@assnat.ci',
    },
    department: { id: 1, name: 'IT' },
    asset: {
      id: 101,
      inventoryNumber: 'INV-2026-001',
      serialNumber: 'SN-HP-001',
      model: 'EliteBook 840 G9',
      status: 'AFFECTE',
      category: { id: 1, name: 'Informatique' },
      materialType: { id: 1, name: 'Laptop' },
      brand: { id: 1, name: 'HP' },
    },
  },
  {
    id: 3,
    assetId: 202,
    employeeId: 'emp-3',
    departmentId: 2,
    note: null,
    startDate: new Date('2026-02-01T09:00:00.000Z'),
    endDate: new Date('2026-03-01T17:00:00.000Z'),
    createdAt: new Date('2026-02-01T09:03:00.000Z'),
    employee: {
      id: 'emp-3',
      firstName: 'Ruth',
      lastName: 'Amani',
      email: 'ruth.amani@assnat.ci',
    },
    department: { id: 2, name: 'Finance' },
    asset: {
      id: 202,
      inventoryNumber: 'INV-2026-014',
      serialNumber: 'SN-LENOVO-014',
      model: 'ThinkPad T14',
      status: 'EN_STOCK_NON_AFFECTE',
      category: { id: 1, name: 'Informatique' },
      materialType: { id: 1, name: 'Laptop' },
      brand: { id: 2, name: 'Lenovo' },
    },
  },
];

const run = async () => {
  const dataService = new AssignmentSheetPdfDataService();
  const pdfService = new AssignmentSheetPdfService();

  const printData = dataService.buildAssignmentSheet(defaultPayload);
  const pdfBuffer = await pdfService.generateAssignmentSheet(printData);

  const outputDir = resolve(process.cwd(), 'tmp');
  const outputFile = resolve(outputDir, 'prototype-assignment-sheet.pdf');

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, pdfBuffer);

  process.stdout.write(`Prototype genere: ${outputFile}\n`);
};

run().catch((error) => {
  process.stderr.write(`Erreur generation prototype PDF affectation: ${String(error)}\n`);
  process.exit(1);
});
