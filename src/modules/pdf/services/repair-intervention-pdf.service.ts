import PDFDocument from 'pdfkit';
import { RepairInterventionPrintView } from './repair-intervention-pdf.types';

export class RepairInterventionPdfService {
  async generateRepairInterventionSheet(data: RepairInterventionPrintView): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const line = (label: string, value: string) => {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(value);
      };

      doc.fontSize(16).font('Helvetica-Bold').text(data.organizationName);
      doc.fontSize(14).text(data.title);
      doc.moveDown(0.5);
      line('N° fiche', data.sheetNumber);
      line("Date d'impression", data.printedAt);
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('1) Identification du materiel');
      doc.moveDown(0.3);
      line("N° inventaire", data.asset.inventoryNumber);
      line('N° serie', data.asset.serialNumber);
      line('Type', data.asset.type);
      line('Marque / Modele', data.asset.brandModel);
      line('Statut actuel', data.asset.currentStatus);
      doc.moveDown();

      doc.font('Helvetica-Bold').text('2) Informations incident');
      doc.moveDown(0.3);
      line('Reference incident', data.incident.reference);
      line('Date de signalement', data.incident.reportedAt);
      line('Service demandeur', data.incident.department);
      line('Description panne', data.incident.description);
      doc.moveDown();

      doc.font('Helvetica-Bold').text('3) Informations atelier');
      doc.moveDown(0.3);
      line('Reference reparation', data.workshop.reference);
      line('Date entree atelier', data.workshop.workshopEntryDate);
      line('Technicien', data.workshop.technicianName);
      line('Action prevue / realisee', data.workshop.action);
      line('Cout', data.workshop.cost);
      line('Statut reparation', data.workshop.repairStatus);
      line('Resultat final', data.workshop.finalOutcome);
      doc.moveDown();

      doc.font('Helvetica-Bold').text('4) Controle et validation');
      doc.moveDown(0.3);
      line('Test post-reparation effectue', data.controlValidation.postRepairTest);
      line('Materiel remis en service', data.controlValidation.backInService);
      line('Observations complementaires', data.controlValidation.observations);
      line('', data.controlValidation.technicianSignature);
      line('', data.controlValidation.managerSignature);
      doc.moveDown();

      doc.font('Helvetica-Bold').text('5) Tracabilite');
      doc.moveDown(0.3);
      line('REPAIR_STARTED', data.traceability.repairStartedAt);
      line('REPAIR_FINISHED', data.traceability.repairFinishedAt);

      doc.end();
    });
  }
}
