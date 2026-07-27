import { StocksService } from '../stocks/stocks.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { IncidentsService } from '../incidents/incidents.service';
import { ScreenLoansService } from '../screen-loans/screen-loans.service';
import { StockAssetsPdfDataService } from '../pdf/services/assets/stock-assets-pdf-data.service';
import { StockAssetsPdfService } from '../pdf/services/assets/stock-assets-pdf.service';
import { AssetFilterDto } from '../stocks/dto/filter-assets.dto';
import { AssignmentSheetPdfDataService } from '../pdf/services/assignments/assignment-sheet-pdf-data.service';
import { AssignmentSheetPdfService } from '../pdf/services/assignments/assignment-sheet-pdf.service';
import { AssignmentsListPdfDataService } from '../pdf/services/assignments/assignments-list-pdf-data.service';
import { AssignmentsListPdfService } from '../pdf/services/assignments/assignments-list-pdf.service';
import { SuppliersPdfDataService } from '../pdf/services/suppliers/suppliers-pdf-data.service';
import { SuppliersPdfService } from '../pdf/services/suppliers/suppliers-pdf.service';
import { IncidentsListPdfDataService } from '../pdf/services/incidents/incidents-list-pdf-data.service';
import { IncidentsListPdfService } from '../pdf/services/incidents/incidents-list-pdf.service';
import { AssetDetailPdfService } from '../pdf/services/asset-detail-pdf.service';
import { ScreenLoansPdfService } from '../pdf/services/screen-loans/screen-loans-pdf.service';
import { InventoryPdfDataService } from '../pdf/services/inventory/inventory-pdf-data.service';
import { InventoryPdfService } from '../pdf/services/inventory/inventory-pdf.service';
import { SignaleticSheetPdfService } from '../pdf/services/inventory/signaletic-sheet-pdf.service';
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
  private readonly assignmentsListPdfDataService = new AssignmentsListPdfDataService();
  private readonly assignmentsListPdfService = new AssignmentsListPdfService();
  private readonly suppliersPdfDataService = new SuppliersPdfDataService();
  private readonly suppliersPdfService = new SuppliersPdfService();
  private readonly incidentsListPdfDataService = new IncidentsListPdfDataService();
  private readonly incidentsListPdfService = new IncidentsListPdfService();
  private readonly assetDetailPdfService = new AssetDetailPdfService();
  private readonly screenLoansPdfService = new ScreenLoansPdfService();
  private readonly inventoryPdfDataService = new InventoryPdfDataService();
  private readonly inventoryPdfService = new InventoryPdfService();
  private readonly signaleticSheetPdfService = new SignaleticSheetPdfService();

  async printAssets(filters: AssetFilterDto = {}): Promise<Buffer> {
    const assets = await this.stocksService.getAssets(filters);
    const printData = this.stockAssetsPdfDataService.buildStockAssetsSheet(assets as any, {
      filters: this.buildAssetFilterSummary(filters),
    });
    return this.stockAssetsPdfService.generateStockAssetsSheet(printData);
  }

  async printInventory(filters: AssetFilterDto = {}): Promise<Buffer> {
    const assets = await this.stocksService.getAssets(filters);
    const printData = this.inventoryPdfDataService.buildInventorySheet(assets as any, {
      filters: this.buildAssetFilterSummary(filters),
      columns: filters.columns,
      title: filters.warrantyExpired || filters.minAgeYears
        ? 'Materiels a renouveler'
        : 'Etat du parc informatique',
    });
    return this.inventoryPdfService.generateInventorySheet(printData);
  }

  async printSignaleticSheets(filters: AssetFilterDto = {}): Promise<Buffer> {
    const assets = await this.stocksService.getAssets(filters);
    if (assets.length === 0) {
      throw new HttpError(404, 'Aucun materiel a imprimer.', 'NO_ASSETS_FOR_SIGNALETIC');
    }
    return this.signaleticSheetPdfService.generateSignaleticSheets(assets as any);
  }

  private buildAssetFilterSummary(filters: AssetFilterDto): string[] {
    const summary: string[] = [];

    if (filters.search) summary.push(`Recherche: ${filters.search}`);
    if (filters.materialTypeId) summary.push(`Type materiel: #${filters.materialTypeId}`);
    if (filters.materialTypeIds?.length) {
      summary.push(`Types: ${filters.materialTypeIds.join(', ')}`);
    }
    if (filters.categoryId) summary.push(`Categorie: #${filters.categoryId}`);
    if (filters.brandId) summary.push(`Marque: #${filters.brandId}`);
    if (filters.departmentId) summary.push(`Direction: #${filters.departmentId}`);
    if (filters.employeeId) summary.push(`Employé: ${filters.employeeId}`);
    if (filters.status) summary.push(`Etat: ${filters.status.replace(/_/g, ' ')}`);
    if (filters.warrantyExpired) summary.push('Garantie expiree');
    if (filters.minAgeYears) summary.push(`Age >= ${filters.minAgeYears} ans`);
    if (filters.physicalInventoryPending) summary.push('Non inventorie physiquement');

    if (filters.entryDateFrom || filters.entryDateTo) {
      const from = filters.entryDateFrom ? this.formatDate(filters.entryDateFrom) : 'debut';
      const to = filters.entryDateTo ? this.formatDate(filters.entryDateTo) : 'fin';
      summary.push(`Periode entree: ${from} - ${to}`);
    }

    return summary;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
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
    assignmentId?: number,
    requester?: { id: string; email: string },
  ): Promise<Buffer> {
    if (!requester?.id || !requester?.email) {
      throw new HttpError(
        401,
        "Utilisateur non authentifie pour l'impression de l'affectation.",
        'UNAUTHENTICATED_REQUEST',
      );
    }

    // Une affectation → fiche individuelle
    if (typeof assignmentId === 'number') {
      const assignment =
        await this.assignmentsService.getAssignmentForPrintById(assignmentId);
      if (!assignment) {
        throw new HttpError(404, 'Affectation non trouvee.', 'ASSIGNMENT_NOT_FOUND');
      }

      const printData = this.assignmentSheetPdfDataService.buildAssignmentSheet([assignment]);
      return this.assignmentSheetPdfService.generateAssignmentSheet(printData);
    }

    // Sans id → liste tabulaire de toutes les affectations
    const assignments = await this.assignmentsService.listAssignmentsForPrint();
    const printData = this.assignmentsListPdfDataService.buildAssignmentsListSheet(assignments);
    return this.assignmentsListPdfService.generateAssignmentsListSheet(printData);
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
