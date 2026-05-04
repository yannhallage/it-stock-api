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
import { IncidentsListPdfDataService } from '../pdf/services/incidents/incidents-list-pdf-data.service';
import { IncidentsListPdfService } from '../pdf/services/incidents/incidents-list-pdf.service';
import { HttpError } from '../../errors/http-error';

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
  private readonly incidentsListPdfDataService = new IncidentsListPdfDataService();
  private readonly incidentsListPdfService = new IncidentsListPdfService();

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
    const incidents = await this.incidentsService.listIncidentsForPdf({});
    const printData = this.incidentsListPdfDataService.buildIncidentsListSheet(incidents);
    return this.incidentsListPdfService.generateIncidentsListSheet(printData);
  }
}
