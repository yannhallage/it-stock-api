import PDFDocument from 'pdfkit';
import { StocksService } from '../stocks/stocks.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { IncidentsService } from '../incidents/incidents.service';
import { StockAssetsPdfDataService } from '../pdf/services/assets/stock-assets-pdf-data.service';
import { StockAssetsPdfService } from '../pdf/services/assets/stock-assets-pdf.service';
import { AssignmentSheetPdfDataService } from '../pdf/services/assignments/assignment-sheet-pdf-data.service';
import { AssignmentSheetPdfService } from '../pdf/services/assignments/assignment-sheet-pdf.service';
import { SuppliersPdfDataService } from '../pdf/services/suppliers/suppliers-pdf-data.service';
import { SuppliersPdfService } from '../pdf/services/suppliers/suppliers-pdf.service';
import { HttpError } from '../../errors/http-error';

type PrintableValue = string | number | boolean | null | Date | undefined;
type PrintableRecord = Record<string, PrintableValue>;

const formatValue = (value: PrintableValue): string => {
  if (value == null) return 'N/A';
  if (value instanceof Date) {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
  }
  return String(value);
};

export class ImpressionService {
  private readonly stocksService = new StocksService();
  private readonly assignmentsService = new AssignmentsService();
  private readonly suppliersService = new SuppliersService();
  private readonly incidentsService = new IncidentsService();
  private readonly stockAssetsPdfDataService = new StockAssetsPdfDataService();
  private readonly stockAssetsPdfService = new StockAssetsPdfService();
  private readonly assignmentSheetPdfDataService = new AssignmentSheetPdfDataService();
  private readonly assignmentSheetPdfService = new AssignmentSheetPdfService();
  private readonly suppliersPdfDataService = new SuppliersPdfDataService();
  private readonly suppliersPdfService = new SuppliersPdfService();

  async printAssets(): Promise<Buffer> {
    const assets = await this.stocksService.getAssets({});
    const printData = this.stockAssetsPdfDataService.buildStockAssetsSheet(assets);
    return this.stockAssetsPdfService.generateStockAssetsSheet(printData);
  }

  async printAssigment(
    assignmentId: number,
    requester?: { id: string; email: string },
  ): Promise<Buffer> {
    if (!requester?.id || !requester?.email) {
      throw new HttpError(
        401,
        "Utilisateur non authentifie pour l'impression de l'affectation.",
        'UNAUTHENTICATED_REQUEST',
      );
    }

    const assignment = await this.assignmentsService.getAssignmentForPrintById(assignmentId);
    if (!assignment) {
      throw new HttpError(404, 'Affectation non trouvee.', 'ASSIGNMENT_NOT_FOUND');
    }

    const assignments = [assignment];
    const printData = this.assignmentSheetPdfDataService.buildAssignmentSheet(assignments);
    return this.assignmentSheetPdfService.generateAssignmentSheet(printData);
  }

  async printSuppliers(): Promise<Buffer> {
    const suppliers = await this.suppliersService.listSuppliers({});
    const printData = this.suppliersPdfDataService.buildSuppliersSheet(suppliers);
    return this.suppliersPdfService.generateSuppliersSheet(printData);
  }

  async printIncidents(): Promise<Buffer> {
    const incidents = await this.incidentsService.listIncidents({});
    const normalizedIncidents = incidents.map((incident) => ({
      id: incident.id,
      assetId: incident.assetId,
      status: incident.status,
      department: incident.department,
      reportedAt: incident.reportedAt,
      description: incident.description,
      assetInventoryNumber: incident.asset.inventoryNumber,
      assetType: incident.asset.type,
      assetBrandModel: `${incident.asset.brand} ${incident.asset.model}`,
      assetStatus: incident.asset.status,
    }));
    return this.buildListPdf('Liste des incidents', normalizedIncidents);
  }

  private async buildListPdf(title: string, rows: PrintableRecord[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(16).font('Helvetica-Bold').text('IT Stock');
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica-Bold').text(title);
      doc.moveDown(0.4);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Date d'impression: ${formatValue(new Date())}`);
      doc.text(`Nombre d'elements: ${rows.length}`);
      doc.moveDown();

      if (rows.length === 0) {
        doc.fontSize(11).font('Helvetica').text('Aucune donnee a imprimer.');
        doc.end();
        return;
      }

      rows.forEach((row, index) => {
        if (doc.y > 740) {
          doc.addPage();
        }

        doc.fontSize(11).font('Helvetica-Bold').text(`Element ${index + 1}`);
        doc.moveDown(0.2);

        Object.entries(row).forEach(([key, value]) => {
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`${key}: `, { continued: true })
            .font('Helvetica')
            .text(formatValue(value));
        });

        doc.moveDown(0.6);
      });

      doc.end();
    });
  }
}
