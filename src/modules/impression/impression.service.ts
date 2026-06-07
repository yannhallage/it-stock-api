import { StocksService } from '../stocks/stocks.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { IncidentsService } from '../incidents/incidents.service';
import { ScreenLoansService } from '../screen-loans/screen-loans.service';
import { StockAssetsPdfDataService } from '../pdf/services/assets/stock-assets-pdf-data.service';
import { StockAssetsPdfService } from '../pdf/services/assets/stock-assets-pdf.service';
import { AssignmentSheetPdfDataService } from '../pdf/services/assignments/assignment-sheet-pdf-data.service';
import { AssignmentSheetPdfService } from '../pdf/services/assignments/assignment-sheet-pdf.service';
import { SuppliersPdfDataService } from '../pdf/services/suppliers/suppliers-pdf-data.service';
import { SuppliersPdfService } from '../pdf/services/suppliers/suppliers-pdf.service';
import { IncidentsListPdfDataService } from '../pdf/services/incidents/incidents-list-pdf-data.service';
import { IncidentsListPdfService } from '../pdf/services/incidents/incidents-list-pdf.service';
import { AssetDetailPdfService } from '../pdf/services/asset-detail-pdf.service';
import { ScreenLoansPdfService } from '../pdf/services/screen-loans/screen-loans-pdf.service';
import { HttpError } from '../../errors/http-error';

export class ImpressionService {
  private readonly stocksService = new StocksService();
  private readonly assignmentsService = new AssignmentsService();
  private readonly suppliersService = new SuppliersService();
  private readonly incidentsService = new IncidentsService();
  private readonly screenLoansService = new ScreenLoansService();
  private readonly stockAssetsPdfDataService = new StockAssetsPdfDataService();
  private readonly stockAssetsPdfService = new StockAssetsPdfService();
  private readonly assignmentSheetPdfDataService = new AssignmentSheetPdfDataService();
  private readonly assignmentSheetPdfService = new AssignmentSheetPdfService();
  private readonly suppliersPdfDataService = new SuppliersPdfDataService();
  private readonly suppliersPdfService = new SuppliersPdfService();
  private readonly incidentsListPdfDataService = new IncidentsListPdfDataService();
  private readonly incidentsListPdfService = new IncidentsListPdfService();
  private readonly assetDetailPdfService = new AssetDetailPdfService();
  private readonly screenLoansPdfService = new ScreenLoansPdfService();

  async printAssets(): Promise<Buffer> {
    const assets = await this.stocksService.getAssets({});
    const printData = this.stockAssetsPdfDataService.buildStockAssetsSheet(assets);
    return this.stockAssetsPdfService.generateStockAssetsSheet(printData);
  }

  async printAsset(inventoryNumber: string): Promise<Buffer> {
    const normalizedInventoryNumber = inventoryNumber.trim();

    if (!normalizedInventoryNumber) {
      throw new HttpError(
        400,
        "Le numero d'inventaire du materiel est obligatoire.",
        'ASSET_INVENTORY_NUMBER_REQUIRED',
      );
    }

    const asset = await this.stocksService.getAssetByInventoryNumber(normalizedInventoryNumber);

    if (!asset) {
      throw new HttpError(404, 'Materiel non trouve.', 'ASSET_NOT_FOUND');
    }

    return this.assetDetailPdfService.generateAssetDetailSheet(asset);
  }

  async printScreenLoans(): Promise<Buffer> {
    const loans = await this.screenLoansService.listLoans({});
    return this.screenLoansPdfService.generateScreenLoansSheet(loans);
  }

  async printScreenLoan(loanId: number): Promise<Buffer> {
    if (!Number.isInteger(loanId) || loanId <= 0) {
      throw new HttpError(
        400,
        "L'identifiant de l'emprunt doit etre un entier positif.",
        'INVALID_SCREEN_LOAN_ID',
      );
    }

    const loan = await this.screenLoansService.getLoanById(loanId);

    if (!loan) {
      throw new HttpError(404, 'Emprunt non trouve.', 'SCREEN_LOAN_NOT_FOUND');
    }

    return this.screenLoansPdfService.generateScreenLoanSheet(loan);
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
