import { readFile } from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { AssignmentSheetPrintView } from './assignment-sheet-pdf.types';

const SERVICE_NAME = 'CST DID';
const LOCAL_LOGO_PATH =
  process.env.LOGO_PATH ||
  path.resolve(__dirname, '..', '..', 'image.png');

type SheetRow = AssignmentSheetPrintView['sheets'][number];

export class AssignmentSheetPdfService {
  async generateAssignmentSheet(data: AssignmentSheetPrintView): Promise<Buffer> {
    const logoSrc = await this.getLogoSrc();
    const html = this.buildHtml(data, logoSrc);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
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

  private buildHtml(data: AssignmentSheetPrintView, logoSrc: string): string {
    const sheets = data.sheets.length ? data.sheets : [this.emptySheet()];
    const content = sheets.map((sheet) => this.buildSheet(sheet, data, logoSrc)).join('');

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 14mm 10mm; }

  html, body {
    height: 100%;
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    margin: 0;
  }

  .sheet {
    page-break-after: always;
  }

  .sheet:last-child {
    page-break-after: auto;
  }

  .top-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .bottom-content {
    margin-top: 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 8px;
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
    line-height: 1.5;
  }

  .header-left {
    text-align: left;
  }

  .header-right {
    text-align: right;
  }

  .logo {
    width: 68px;
    height: 68px;
    object-fit: contain;
  }

  .meta {
    text-align: right;
    font-size: 11px;
    margin-top: 8px;
  }

  .divider {
    margin: 12px 0 14px;
    border-bottom: 2px solid #222;
  }

  .title {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }

  .section {
    margin-bottom: 18px;
  }

  .section-title {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .device-box {
    font-size: 12px;
    line-height: 1.6;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }

  thead th {
    text-align: left;
    font-size: 11px;
    border-bottom: 2px solid #222;
    padding: 6px 4px;
  }

  tbody td {
    font-size: 11px;
    border-bottom: 1px solid #ddd;
    padding: 6px 4px;
  }

  .name-cell {
    white-space: pre-line;
  }

  .center {
    text-align: center;
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    margin-top: 18px;
    gap: 18px;
  }

  .info {
    font-size: 11px;
    line-height: 1.7;
  }

  .status-box {
    width: 230px;
    font-size: 11px;
  }

  .status-box div {
    display: flex;
    justify-content: space-between;
    padding: 5px 8px;
    border-bottom: 1px solid #ddd;
  }

  .highlight {
    background: #e3e6e8;
    font-weight: bold;
  }

  .signature {
    margin-top: 28px;
    font-size: 11px;
  }

  .signature-line {
    margin-top: 16px;
    width: 170px;
    border-bottom: 1px solid #000;
  }
</style>
</head>

<body>
${content}
</body>
</html>`;
  }

  private buildSheet(sheet: SheetRow, data: AssignmentSheetPrintView, logoSrc: string): string {
    const rows = (sheet.beneficiaries.length ? sheet.beneficiaries : [this.emptyBeneficiary()])
      .map(
        (row) => `
<tr>
  <td class="center">${row.index}</td>
  <td class="name-cell">${this.escapeHtml(row.fullName)}</td>
  <td>${this.escapeHtml(row.role)}</td>
  <td>${this.escapeHtml(row.service)}</td>
  <td>${this.escapeHtml(row.assignedAt)}</td>
  <td>${this.escapeHtml(row.status)}</td>
</tr>`
      )
      .join('');

    return `
<div class="sheet">
  <div class="top-content">
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

    <div class="meta">
      ID: ${this.escapeHtml(sheet.sheetNumber)}<br>
      DATE: ${this.escapeHtml(this.formatDate(data.generatedAt))}
    </div>

    <div class="divider"></div>

    <div class="title">FICHE ASSIGNATION APPAREIL</div>

    <div class="section">
      <div class="section-title">INFORMATIONS APPAREIL</div>
      <div class="device-box">
        <strong>Inventaire:</strong> ${this.escapeHtml(sheet.asset.inventoryNumber)}<br>
        <strong>Type:</strong> ${this.escapeHtml(sheet.asset.type)}<br>
        <strong>Marque:</strong> ${this.escapeHtml(sheet.asset.brand)}<br>
        <strong>Modele:</strong> ${this.escapeHtml(sheet.asset.model)}<br>
        <strong>N° Serie:</strong> ${this.escapeHtml(sheet.asset.serialNumber)}<br>
        <strong>Etat:</strong> ${this.escapeHtml(sheet.asset.statusLabel)}
      </div>
    </div>

    <div class="section">
      <div class="section-title">UTILISATEURS BENEFICIAIRES</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Poste</th>
            <th>Service</th>
            <th>Date assignation</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  </div>

  <div class="bottom-content">
    <div class="bottom">
      <div class="info">
        <strong>RESPONSABLE IT</strong><br>
        Service: ${this.escapeHtml(SERVICE_NAME)}<br>
        Date impression: ${this.escapeHtml(data.printedAt)}
      </div>

      <div class="status-box">
        <div><span>UTILISATEURS</span><span>${sheet.totals.users}</span></div>
        <div><span>ACTIFS</span><span>${sheet.totals.active}</span></div>
        <div class="highlight"><span>STATUT</span><span>${this.escapeHtml(sheet.totals.globalStatus)}</span></div>
      </div>
    </div>

    <div class="signature">
      <div class="signature-line"></div>
      SIGNATURE RESPONSABLE
    </div>
  </div>
</div>`;
  }

  private async getLogoSrc(): Promise<string> {
    try {
      if (!LOCAL_LOGO_PATH) return '';
      const file = await readFile(LOCAL_LOGO_PATH);
      return `data:image/png;base64,${file.toString('base64')}`;
    } catch {
      return '';
    }
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

  private formatDate(date?: Date | null): string {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
      .format(date)
      .toUpperCase();
  }

  private emptySheet(): SheetRow {
    return {
      sheetNumber: 'ASG-N/A',
      asset: {
        inventoryNumber: 'N/A',
        type: 'N/A',
        brand: 'N/A',
        model: 'N/A',
        serialNumber: 'N/A',
        statusLabel: 'N/A',
        statusCode: 'N/A',
      },
      beneficiaries: [],
      totals: {
        users: 0,
        active: 0,
        globalStatus: 'INACTIF',
      },
    };
  }

  private emptyBeneficiary(): SheetRow['beneficiaries'][number] {
    return {
      index: 1,
      fullName: 'N/A',
      role: 'N/A',
      service: 'N/A',
      assignedAt: 'N/A',
      assignedAtRaw: new Date(),
      status: 'N/A',
    };
  }
}
