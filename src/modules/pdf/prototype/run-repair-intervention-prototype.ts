import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { AssetStatus, HistoryEventType, RepairStatus } from '@prisma/client';
import { RepairInterventionPdfDataService } from '../services/repair-intervention-pdf-data.service';
import { RepairInterventionPdfService } from '../services/repair-intervention-pdf.service';
import { RepairInterventionPrintPayload } from '../services/repair-intervention-pdf.types';

const defaultPayload: RepairInterventionPrintPayload = {
  repair: {
    id: 1001,
    workshopEntryDate: new Date('2026-04-20T08:30:00.000Z'),
    technicianName: 'TECHNICIEN DEMO',
    action: "Remplacement du disque SSD et reinstallation du systeme d'exploitation",
    cost: 75000,
    status: RepairStatus.TERMINE,
    outcome: AssetStatus.EN_SERVICE,
    incident: {
      id: 501,
      reportedAt: new Date('2026-04-19T10:15:00.000Z'),
      department: 'Direction Informatique',
      description: "Le poste ne demarre plus et affiche une erreur disque.",
      asset: {
        inventoryNumber: 'INV-2026-001',
        serial_number: 'SN-LAPTOP-7788',
        type: 'Laptop',
        brand: 'Dell',
        model: 'Latitude 5520',
        status: AssetStatus.EN_SERVICE,
      },
    },
  },
  history: [
    {
      type: HistoryEventType.REPAIR_STARTED,
      createdAt: new Date('2026-04-20T08:45:00.000Z'),
    },
    {
      type: HistoryEventType.REPAIR_FINISHED,
      createdAt: new Date('2026-04-21T15:20:00.000Z'),
    },
  ],
};

const run = async () => {
  const dataService = new RepairInterventionPdfDataService();
  const pdfService = new RepairInterventionPdfService();

  const printData = dataService.buildRepairInterventionSheet(defaultPayload);
  const pdfBuffer = await pdfService.generateRepairInterventionSheet(printData);

  const outputDir = resolve(process.cwd(), 'tmp');
  const outputFile = resolve(outputDir, 'prototype-repair-sheet.pdf');

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, pdfBuffer);

  process.stdout.write(`Prototype genere: ${outputFile}\n`);
};

run().catch((error) => {
  process.stderr.write(`Erreur generation prototype PDF: ${String(error)}\n`);
  process.exit(1);
});
