import { readFile } from 'fs/promises';
import path from 'path';
import { launchPdfBrowser } from '../shared/pdf-browser';

const SERVICE_NAME = 'CST DID';
const LOGO_PATHS = [
  process.env.LOGO_PATH,
  path.resolve(process.cwd(), 'src/modules/pdf/image.png'),
  path.resolve(__dirname, '..', '..', 'image.png'),
].filter((value): value is string => Boolean(value));

type ScreenLoanPrintItem = {
  id: number;
  assetId: number;
  borrowerName: string;
  borrowerDepartment: string | null;
  loanDate: Date;
  expectedReturnDate: Date;
  returnedAt: Date | null;
  note: string | null;
  createdAt: Date;
  asset: {
    id: number;
    inventoryNumber: string;
    type: string;
    brand: string;
    model: string;
    status: string;
  };
};

type Metrics = {
  total: number;
  active: number;
  returned: number;
  overdue: number;
  borrowers: number;
};

type LoanStatus = {
  label: string;
  className: string;
};

export class ScreenLoansPdfService {
  async generateScreenLoansSheet(loans: ScreenLoanPrintItem[]): Promise<Buffer> {
    const generatedAt = new Date();
    const logoSrc = await this.getLogoSrc();
    const html = this.buildListHtml(loans, generatedAt, logoSrc);

    return this.renderPdf(html, true);
  }

  async generateScreenLoanSheet(loan: ScreenLoanPrintItem): Promise<Buffer> {
    const generatedAt = new Date();
    const logoSrc = await this.getLogoSrc();
    const html = this.buildDetailHtml(loan, generatedAt, logoSrc);

    return this.renderPdf(html, false);
  }

  private async renderPdf(html: string, landscape: boolean): Promise<Buffer> {
    const browser = await launchPdfBrowser();

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        landscape,
        printBackground: true,
        margin: {
          top: '14mm',
          right: '10mm',
          bottom: '18mm',
          left: '10mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private buildListHtml(
    loans: ScreenLoanPrintItem[],
    generatedAt: Date,
    logoSrc: string,
  ): string {
    const metrics = this.computeMetrics(loans, generatedAt);
    const rows = (loans.length ? loans : [this.emptyLoan()])
      .map((loan, index) => this.buildListRow(index + 1, loan, generatedAt))
      .join('');

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4 landscape; margin: 14mm 10mm; }

  body {
    font-family: "Times New Roman", serif;
    color: #000;
    margin: 0;
    padding-bottom: 38px;
    font-size: 10px;
  }

  .header {
    text-align: center;
    margin-bottom: 10px;
  }

  .header-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    column-gap: 16px;
  }

  .header-left,
  .header-right {
    font-weight: bold;
    font-size: 12px;
    line-height: 1.45;
  }

  .header-left { text-align: left; }
  .header-right { text-align: right; }

  .logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  .meta {
    font-size: 10px;
    margin-top: 6px;
  }

  .title {
    text-align: center;
    font-weight: bold;
    text-decoration: underline;
    font-size: 15px;
    margin: 12px 0;
  }

  .kpis {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .kpis td {
    border: 1px solid #000;
    padding: 5px;
    text-align: center;
  }

  .kpi-label {
    font-size: 9px;
  }

  .kpi-value {
    font-size: 17px;
    font-weight: bold;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th, td {
    border: 1px solid #000;
    padding: 4px;
    word-break: break-word;
    vertical-align: top;
  }

  th {
    background: #f2f2f2;
    font-size: 9px;
  }

  .num, .center {
    text-align: center;
  }

  .status {
    display: inline-block;
    padding: 2px 5px;
    font-weight: bold;
    border: 1px solid #000;
  }

  .loan_ACTIVE { background: #e7f1ff; }
  .loan_RETURNED { background: #e6f4ea; }
  .loan_OVERDUE { background: #f8d7da; }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 9px;
    border-top: 1px solid #000;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>
  ${this.buildHeader(logoSrc, generatedAt)}

  <div class="title">ETAT DES EMPRUNTS MATERIEL</div>

  <table class="kpis">
    <tr>
      <td><div class="kpi-label">TOTAL</div><div class="kpi-value">${metrics.total}</div></td>
      <td><div class="kpi-label">EN COURS</div><div class="kpi-value">${metrics.active}</div></td>
      <td><div class="kpi-label">RETOURNES</div><div class="kpi-value">${metrics.returned}</div></td>
      <td><div class="kpi-label">EN RETARD</div><div class="kpi-value">${metrics.overdue}</div></td>
      <td><div class="kpi-label">EMPRUNTEURS</div><div class="kpi-value">${metrics.borrowers}</div></td>
    </tr>
  </table>

  <table>
    <thead>
      <tr>
        <th style="width: 4%;">#</th>
        <th style="width: 7%;">ID</th>
        <th style="width: 12%;">Inventaire</th>
        <th style="width: 15%;">Materiel</th>
        <th style="width: 15%;">Emprunteur</th>
        <th style="width: 12%;">Direction</th>
        <th style="width: 10%;">Date pret</th>
        <th style="width: 10%;">Retour prevu</th>
        <th style="width: 10%;">Retour effectif</th>
        <th style="width: 10%;">Etat</th>
        <th>Note</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="footer">
    <span>${SERVICE_NAME}</span>
    <span>${this.escapeHtml(this.formatDateTime(generatedAt))}</span>
  </div>
</body>
</html>`;
  }

  private buildDetailHtml(
    loan: ScreenLoanPrintItem,
    generatedAt: Date,
    logoSrc: string,
  ): string {
    const status = this.getLoanStatus(loan, generatedAt);
    const duration = this.computeDuration(loan);

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 14mm 10mm; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    margin: 0;
    padding-bottom: 38px;
    font-size: 11px;
    line-height: 1.35;
  }

  .header {
    text-align: center;
    margin-bottom: 10px;
  }

  .header-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
  }

  .header-left,
  .header-right {
    font-weight: bold;
    font-size: 12px;
    line-height: 1.45;
  }

  .header-left { text-align: left; }
  .header-right { text-align: right; }

  .logo {
    width: 68px;
    height: 68px;
    object-fit: contain;
  }

  .divider {
    border-bottom: 2px solid #111;
    margin: 12px 0 14px;
  }

  .title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .subtitle {
    text-align: center;
    font-size: 11px;
    margin-bottom: 16px;
  }

  .section {
    margin-top: 14px;
    page-break-inside: avoid;
  }

  .section-title {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid #222;
    border-left: 1px solid #222;
  }

  .cell {
    min-height: 28px;
    border-right: 1px solid #222;
    border-bottom: 1px solid #222;
    padding: 6px 8px;
  }

  .label {
    display: block;
    color: #555;
    font-size: 9px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .value {
    font-weight: bold;
  }

  .status {
    display: inline-block;
    padding: 2px 6px;
    font-weight: bold;
    border: 1px solid #222;
  }

  .loan_ACTIVE { background: #e7f1ff; }
  .loan_RETURNED { background: #e6f4ea; }
  .loan_OVERDUE { background: #f8d7da; }

  .note {
    border: 1px solid #222;
    min-height: 54px;
    padding: 8px;
  }

  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    margin-top: 36px;
  }

  .signature-line {
    border-bottom: 1px solid #111;
    height: 34px;
    margin-bottom: 6px;
  }

  .footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid #222;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
    font-size: 9px;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-row">
      <div class="header-left">
        REPUBLIQUE DE COTE D'IVOIRE<br>
        Union - Discipline - Travail
      </div>
      <div>
        <img src="${logoSrc}" class="logo" />
      </div>
      <div class="header-right">
        ASSEMBLEE NATIONALE<br>
        DIRECTION DES SYSTEMES D'INFORMATION
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="title">FICHE EMPRUNT MATERIEL</div>
  <div class="subtitle">
    N fiche: EMP-${loan.id} | Date impression: ${this.escapeHtml(this.formatDateTime(generatedAt))}
  </div>

  <div class="section">
    <div class="section-title">Informations emprunt</div>
    <div class="grid">
      ${this.infoCell('Identifiant emprunt', String(loan.id))}
      ${this.infoCell('Etat emprunt', this.statusBadge(status), true)}
      ${this.infoCell('Emprunteur', loan.borrowerName)}
      ${this.infoCell('Direction', loan.borrowerDepartment ?? 'N/A')}
      ${this.infoCell('Date pret', this.formatDateTime(loan.loanDate))}
      ${this.infoCell('Retour prevu', this.formatDateTime(loan.expectedReturnDate))}
      ${this.infoCell('Retour effectif', this.formatDateTime(loan.returnedAt))}
      ${this.infoCell('Duree', duration)}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Materiel emprunte</div>
    <div class="grid">
      ${this.infoCell("Numero d'inventaire", loan.asset.inventoryNumber)}
      ${this.infoCell('Type', loan.asset.type)}
      ${this.infoCell('Marque / Modele', `${loan.asset.brand} / ${loan.asset.model}`)}
      ${this.infoCell('Statut actuel du materiel', loan.asset.status.replace(/_/g, ' '))}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Observation</div>
    <div class="note">${this.escapeHtml(loan.note ?? '') || '&nbsp;'}</div>
  </div>

  <div class="signatures">
    <div>
      <div class="signature-line"></div>
      Signature emprunteur
    </div>
    <div>
      <div class="signature-line"></div>
      Signature responsable IT
    </div>
  </div>

  <div class="footer">
    <span>${SERVICE_NAME}</span>
    <span>EMP-${loan.id}</span>
  </div>
</body>
</html>`;
  }

  private buildHeader(logoSrc: string, generatedAt: Date): string {
    return `
<div class="header">
  <div class="header-row">
    <div class="header-left">
      REPUBLIQUE DE COTE D'IVOIRE<br>
      Union - Discipline - Travail
    </div>
    <div>
      <img src="${logoSrc}" class="logo" />
    </div>
    <div class="header-right">
      ASSEMBLEE NATIONALE<br>
      DIRECTION DES SYSTEMES D'INFORMATION
    </div>
  </div>
  <div class="meta">
    Service: ${this.escapeHtml(SERVICE_NAME)}<br>
    Date: ${this.escapeHtml(this.formatDate(generatedAt))}
  </div>
</div>`;
  }

  private buildListRow(index: number, loan: ScreenLoanPrintItem, now: Date): string {
    const status =
      loan.id > 0
        ? this.getLoanStatus(loan, now)
        : {
            label: '-',
            className: '',
          };

    return `
<tr>
  <td class="num">${index}</td>
  <td class="num">${loan.id > 0 ? loan.id : '-'}</td>
  <td>${this.escapeHtml(loan.asset.inventoryNumber)}</td>
  <td>${this.escapeHtml(`${loan.asset.type} - ${loan.asset.brand} ${loan.asset.model}`)}</td>
  <td>${this.escapeHtml(loan.borrowerName)}</td>
  <td>${this.escapeHtml(loan.borrowerDepartment ?? 'N/A')}</td>
  <td class="center">${loan.id > 0 ? this.escapeHtml(this.formatDate(loan.loanDate)) : '-'}</td>
  <td class="center">${loan.id > 0 ? this.escapeHtml(this.formatDate(loan.expectedReturnDate)) : '-'}</td>
  <td class="center">${loan.id > 0 ? this.escapeHtml(this.formatDate(loan.returnedAt)) : '-'}</td>
  <td class="center">${this.statusBadge(status)}</td>
  <td>${this.escapeHtml(loan.note ?? '')}</td>
</tr>`;
  }

  private infoCell(label: string, value: string, html = false): string {
    return `
<div class="cell">
  <span class="label">${this.escapeHtml(label)}</span>
  <span class="value">${html ? value : this.escapeHtml(value)}</span>
</div>`;
  }

  private computeMetrics(loans: ScreenLoanPrintItem[], now: Date): Metrics {
    const returned = loans.filter((loan) => loan.returnedAt != null).length;
    const active = loans.filter((loan) => loan.returnedAt == null).length;
    const overdue = loans.filter(
      (loan) => loan.returnedAt == null && loan.expectedReturnDate.getTime() < now.getTime(),
    ).length;
    const borrowers = new Set(loans.map((loan) => loan.borrowerName).filter(Boolean)).size;

    return {
      total: loans.length,
      active,
      returned,
      overdue,
      borrowers,
    };
  }

  private getLoanStatus(loan: ScreenLoanPrintItem, now: Date): LoanStatus {
    if (loan.returnedAt) {
      return {
        label: 'Retourne',
        className: 'loan_RETURNED',
      };
    }

    if (loan.expectedReturnDate.getTime() < now.getTime()) {
      return {
        label: 'En retard',
        className: 'loan_OVERDUE',
      };
    }

    return {
      label: 'En cours',
      className: 'loan_ACTIVE',
    };
  }

  private statusBadge(status: LoanStatus): string {
    return `<span class="status ${this.escapeAttribute(status.className)}">${this.escapeHtml(
      status.label,
    )}</span>`;
  }

  private computeDuration(loan: ScreenLoanPrintItem): string {
    const end = loan.returnedAt ?? new Date();
    const days = Math.max(0, Math.ceil((end.getTime() - loan.loanDate.getTime()) / 86400000));

    return `${days} jour(s)`;
  }

  private async getLogoSrc(): Promise<string> {
    for (const logoPath of LOGO_PATHS) {
      try {
        const file = await readFile(logoPath);
        return `data:image/png;base64,${file.toString('base64')}`;
      } catch {
        continue;
      }
    }

    return '';
  }

  private formatDate(date?: Date | null): string {
    if (!date) return 'N/A';

    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}/${date.getFullYear()}`;
  }

  private formatDateTime(date?: Date | null): string {
    if (!date) return 'N/A';

    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private emptyLoan(): ScreenLoanPrintItem {
    return {
      id: 0,
      assetId: 0,
      borrowerName: '-',
      borrowerDepartment: '-',
      loanDate: new Date(0),
      expectedReturnDate: new Date(0),
      returnedAt: null,
      note: 'Aucun emprunt enregistre.',
      createdAt: new Date(0),
      asset: {
        id: 0,
        inventoryNumber: '-',
        type: '-',
        brand: '-',
        model: '-',
        status: '-',
      },
    };
  }

  private escapeHtml(value?: string): string {
    if (!value) return '';

    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}
