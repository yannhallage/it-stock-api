import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { AssignmentSheetPdfDataService } from '../services/assignments/assignment-sheet-pdf-data.service';
import { AssignmentSheetPdfService } from '../services/assignments/assignment-sheet-pdf.service';
import { AssignmentSheetPrintPayload } from '../services/assignments/assignment-sheet-pdf.types';

const defaultPayload: AssignmentSheetPrintPayload = [
  {
    id: 1,
    assetId: 101,
    department: 'IT',
    user: {
      nom: 'Dupont',
      prenom: 'Jean',
      poste: 'Developpeur',
      service: 'IT',
    },
    startDate: new Date('2026-01-10T08:00:00.000Z'),
    endDate: null,
    createdAt: new Date('2026-01-10T08:05:00.000Z'),
    asset: {
      id: 101,
      inventoryNumber: 'INV-2026-001',
      serial_number: 'SN-HP-001',
      type: 'Laptop',
      brand: 'HP',
      model: 'EliteBook 840 G9',
      status: 'AFFECTE',
    },
  },
  {
    id: 2,
    assetId: 101,
    department: 'IT',
    user: {
      nom: 'Kouassi',
      prenom: 'Marie',
      poste: 'Chef Projet',
      service: 'IT',
    },
    startDate: new Date('2026-01-15T10:30:00.000Z'),
    endDate: null,
    createdAt: new Date('2026-01-15T10:35:00.000Z'),
    asset: {
      id: 101,
      inventoryNumber: 'INV-2026-001',
      serial_number: 'SN-HP-001',
      type: 'Laptop',
      brand: 'HP',
      model: 'EliteBook 840 G9',
      status: 'AFFECTE',
    },
  },
  {
    id: 3,
    assetId: 202,
    department: 'Finance',
    user: {
      fullName: 'Amani Ruth',
      role: 'Comptable',
      department: 'Finance',
    },
    startDate: new Date('2026-02-01T09:00:00.000Z'),
    endDate: new Date('2026-03-01T17:00:00.000Z'),
    createdAt: new Date('2026-02-01T09:03:00.000Z'),
    asset: {
      id: 202,
      inventoryNumber: 'INV-2026-014',
      serial_number: 'SN-LENOVO-014',
      type: 'Laptop',
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      status: 'EN_STOCK_NON_AFFECTE',
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
