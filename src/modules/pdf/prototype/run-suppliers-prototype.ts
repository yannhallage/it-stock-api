import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { SuppliersPdfDataService } from '../services/suppliers/suppliers-pdf-data.service';
import { SuppliersPdfService } from '../services/suppliers/suppliers-pdf.service';
import { SupplierPrintPayload } from '../services/suppliers/suppliers-pdf.types';

const defaultPayload: SupplierPrintPayload = [
  {
    id: 1,
    name: 'Tech Distrib',
    contact: '+225 0707070707',
    address: 'Abidjan, Plateau',
    createdAt: new Date('2026-01-04T08:15:00.000Z'),
    deletedAt: null,
  },
  {
    id: 2,
    name: 'Office Plus',
    contact: '+225 0505050505',
    address: 'Abidjan, Cocody',
    createdAt: new Date('2026-01-12T10:10:00.000Z'),
    deletedAt: null,
  },
  {
    id: 3,
    name: 'West IT',
    contact: null,
    address: 'Yamoussoukro',
    createdAt: new Date('2026-02-01T09:00:00.000Z'),
    deletedAt: null,
  },
  {
    id: 4,
    name: 'Apple Reseller',
    contact: '+225 0101010101',
    address: null,
    createdAt: new Date('2026-02-15T13:35:00.000Z'),
    deletedAt: new Date('2026-04-01T00:00:00.000Z'),
  },
];

const run = async () => {
  const dataService = new SuppliersPdfDataService();
  const pdfService = new SuppliersPdfService();

  const printData = dataService.buildSuppliersSheet(defaultPayload);
  const pdfBuffer = await pdfService.generateSuppliersSheet(printData);

  const outputDir = resolve(process.cwd(), 'tmp');
  const outputFile = resolve(outputDir, 'prototype-suppliers-sheet.pdf');

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, pdfBuffer);

  process.stdout.write(`Prototype genere: ${outputFile}\n`);
};

run().catch((error) => {
  process.stderr.write(`Erreur generation prototype PDF fournisseurs: ${String(error)}\n`);
  process.exit(1);
});
